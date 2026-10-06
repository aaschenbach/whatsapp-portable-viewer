import argparse
import base64
import csv
import hashlib
import json
import os
import quopri
import re
import shutil
import sqlite3
import sys
import unicodedata
from collections import defaultdict
from datetime import datetime
from pathlib import Path

WEB_DIR = Path(__file__).parent / "web"
INVISIBLE = re.compile("[​‌‍⁠﻿]")

TYPE_MAP = {
    0: "t", 1: "i", 2: "a", 3: "v", 4: "c", 5: "l", 7: "x", 9: "d",
    13: "g", 15: "del", 20: "s", 36: "x", 55: "x", 90: "k",
}
HIDDEN_TYPES = {11, 99}
MEDIA_KINDS = ("i", "a", "v", "d", "g", "s")
SYSTEM_TEXT = {36: "Mensagens temporárias alteradas", 55: "Conversa iniciada por anúncio"}

CHATS_SQL = """
SELECT chat._id AS chat_id, chat.subject AS subject, jid.user AS jid_user,
       jid.server AS jid_server, jid.raw_string AS jid_raw,
       phone_jid.user AS phone_user
FROM chat
JOIN jid ON jid._id = chat.jid_row_id
LEFT JOIN jid_map ON jid_map.lid_row_id = jid._id
LEFT JOIN jid AS phone_jid ON phone_jid._id = jid_map.jid_row_id
"""

MESSAGES_SQL = """
SELECT message._id AS msg_id, message.chat_row_id AS chat_id,
       message.from_me AS from_me, message.timestamp AS ts,
       message.message_type AS msg_type, message.text_data AS text,
       message.starred AS starred,
       sender.user AS sender_user, sender.server AS sender_server,
       sender_phone.user AS sender_phone,
       message_media.file_path AS media_path, message_media.mime_type AS media_mime,
       message_media.media_name AS media_name, message_media.media_caption AS media_caption,
       message_media.file_size AS media_size, message_media.file_hash AS media_hash, message_media.width AS media_w,
       message_media.height AS media_h, message_media.media_duration AS media_dur,
       message_quoted.text_data AS quoted_text, message_quoted.from_me AS quoted_from_me,
       quoted_sender.user AS quoted_user, quoted_phone.user AS quoted_phone,
       message_location.latitude AS lat, message_location.longitude AS lng,
       message_location.place_name AS place_name,
       message_revoked.message_row_id AS revoked_id,
       message_edit_info.message_row_id AS edited_id,
       call_log.video_call AS call_video, call_log.duration AS call_duration,
       call_log.call_result AS call_result,
       message_quoted_media.mime_type AS qm_mime, message_quoted_media.media_name AS qm_name,
       message_quoted_media.media_caption AS qm_caption,
       message_external_ad_content.title AS ad_title, message_external_ad_content.body AS ad_body,
       message_external_ad_content.source_url AS ad_url,
       message_external_ad_content.media_url AS ad_media_url,
       message_external_ad_content.micro_thumbnail AS ad_thumb
FROM message
LEFT JOIN jid AS sender ON sender._id = message.sender_jid_row_id
LEFT JOIN jid_map AS sender_map ON sender_map.lid_row_id = sender._id
LEFT JOIN jid AS sender_phone ON sender_phone._id = sender_map.jid_row_id
LEFT JOIN message_media ON message_media.message_row_id = message._id
LEFT JOIN message_quoted ON message_quoted.message_row_id = message._id
LEFT JOIN jid AS quoted_sender ON quoted_sender._id = message_quoted.sender_jid_row_id
LEFT JOIN jid_map AS quoted_map ON quoted_map.lid_row_id = quoted_sender._id
LEFT JOIN jid AS quoted_phone ON quoted_phone._id = quoted_map.jid_row_id
LEFT JOIN message_location ON message_location.message_row_id = message._id
LEFT JOIN message_revoked ON message_revoked.message_row_id = message._id
LEFT JOIN message_edit_info ON message_edit_info.message_row_id = message._id
LEFT JOIN message_call_log ON message_call_log.message_row_id = message._id
LEFT JOIN call_log ON call_log._id = message_call_log.call_log_row_id
LEFT JOIN message_quoted_media ON message_quoted_media.message_row_id = message._id
LEFT JOIN message_external_ad_content ON message_external_ad_content.message_row_id = message._id
ORDER BY message.chat_row_id, message._id
"""

MEDIA_SQL = """
SELECT message_media.file_path AS path, message_media.file_size AS size,
       message_media.file_hash AS hash
FROM message_media
WHERE message_media.file_path IS NOT NULL
ORDER BY message_media.file_size DESC
"""

POLL_SQL = """
SELECT message_poll_option.message_row_id AS msg_id,
       message_poll_option.option_name AS option_name,
       message_poll_option.vote_total AS vote_total
FROM message_poll_option
ORDER BY message_poll_option._id
"""

MEDIA_LABEL = {
    "i": "Foto", "a": "Áudio", "v": "Vídeo", "d": "Documento", "g": "GIF",
    "s": "Figurinha", "l": "Localização", "c": "Contato", "k": "Chamada",
    "del": "Mensagem apagada", "p": "Enquete",
}


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def format_phone(digits: str) -> str:
    if digits.startswith("55") and len(digits) in (12, 13):
        ddd, rest = digits[2:4], digits[4:]
        return f"+55 ({ddd}) {rest[:-4]}-{rest[-4:]}"
    return f"+{digits}"


LID_SERVERS = ("lid", "hosted.lid")


def norm_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if not digits:
        return ""
    if not raw.strip().startswith("+") and len(digits) in (10, 11):
        return "55" + digits
    return digits.lstrip("0") if len(digits) > 11 and digits.startswith("0") else digits


def phone_keys(digits: str) -> list[str]:
    keys = [digits]
    if digits.startswith("55") and len(digits) in (12, 13):
        keys.append("55" + digits[2:4] + digits[-8:])
    return keys


def add_contact(contacts: dict[str, str], digits: str, name: str) -> None:
    name = name.strip()
    if not digits or not name:
        return
    for key in phone_keys(digits):
        contacts.setdefault(key, name)


def read_text_file(path: Path) -> str:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "cp1252"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def load_vcf(path: Path, contacts: dict[str, str]) -> None:
    lines: list[str] = []
    for line in read_text_file(path).splitlines():
        if lines and line.startswith((" ", "\t")):
            lines[-1] += line[1:]
        elif lines and lines[-1].endswith("=") and "QUOTED-PRINTABLE" in lines[-1].upper():
            lines[-1] = lines[-1][:-1] + line
        else:
            lines.append(line)
    name, phones = "", []
    for line in lines + ["END:VCARD"]:
        upper = line.upper()
        if upper.startswith("BEGIN:VCARD"):
            name, phones = "", []
        elif upper.startswith("END:VCARD"):
            for phone in phones:
                add_contact(contacts, norm_phone(phone), name)
            name, phones = "", []
        elif ":" in line:
            head, value = line.split(":", 1)
            field = head.split(";")[0].upper()
            if "QUOTED-PRINTABLE" in head.upper():
                value = quopri.decodestring(value.encode("latin-1", "replace")).decode(
                    "utf-8", errors="replace")
            if field == "FN" and value.strip():
                name = value.strip()
            elif field == "N" and not name:
                name = " ".join(p for p in reversed(value.split(";")[:2]) if p.strip())
            elif field.endswith("TEL") or field == "TEL":
                phones.append(value)


def load_contacts_csv(path: Path, contacts: dict[str, str]) -> None:
    text = read_text_file(path)
    delimiter = ";" if text[:2048].count(";") > text[:2048].count(",") else ","
    rows = list(csv.reader(text.splitlines(), delimiter=delimiter))
    if not rows:
        return
    header = [cell.strip().lower() for cell in rows[0]]
    keywords = ("name", "nome", "phone", "telefone", "celular", "mobile")
    if any(any(k in cell for k in keywords) for cell in header):
        phone_cols = [i for i, cell in enumerate(header)
                      if any(k in cell for k in ("phone", "telefone", "celular", "mobile"))
                      and not any(k in cell for k in ("label", "type", "tipo"))]
        name_cols = [i for i, cell in enumerate(header)
                     if cell in ("name", "nome", "display name", "full name", "nome completo")]
        part_cols = [i for i, cell in enumerate(header)
                     if cell in ("first name", "given name", "middle name",
                                 "last name", "family name", "nome próprio", "sobrenome")]
        for row in rows[1:]:
            name = next((row[i].strip() for i in name_cols if i < len(row) and row[i].strip()), "")
            if not name:
                name = " ".join(row[i].strip() for i in part_cols if i < len(row) and row[i].strip())
            for i in phone_cols:
                if i < len(row):
                    for raw in re.findall(r"\+?\d[\d\s().-]{6,}\d", row[i]):
                        add_contact(contacts, norm_phone(raw), name)
    else:
        for row in rows:
            if len(row) >= 2:
                add_contact(contacts, norm_phone(row[0]), row[1])


def load_wa_db(path: Path, contacts: dict[str, str]) -> int:
    con = sqlite3.connect(f"file:{path.resolve().as_posix()}?mode=ro", uri=True)
    try:
        cols = {r[1] for r in con.execute("PRAGMA table_info(wa_contacts)")}
        if not cols:
            return 0
        name_cols = [c for c in ("display_name", "given_name", "nickname", "wa_name") if c in cols]
        if "jid" not in cols or not name_cols:
            return 0
        select = ", ".join(f"wa_contacts.{c}" for c in name_cols)
        count = 0
        for row in con.execute(f"SELECT wa_contacts.jid, {select} FROM wa_contacts"):
            name = next((str(v).strip() for v in row[1:] if v and str(v).strip()), "")
            jid = row[0] or ""
            user, _, server = jid.partition("@")
            if not name or not user:
                continue
            if server == "s.whatsapp.net":
                add_contact(contacts, re.sub(r"\D", "", user), name)
            elif server in LID_SERVERS:
                contacts.setdefault("lid:" + user, name)
            count += 1
        return count
    finally:
        con.close()


def load_contacts(paths: list[Path]) -> dict[str, str]:
    contacts: dict[str, str] = {}
    for path in paths:
        if path.suffix.lower() == ".vcf":
            load_vcf(path, contacts)
        elif path.suffix.lower() == ".csv":
            load_contacts_csv(path, contacts)
        else:
            load_wa_db(path, contacts)
    return contacts


def contact_name(contacts: dict[str, str], digits: str | None, lid: str | None = None) -> str | None:
    if not contacts:
        return None
    if lid and "lid:" + lid in contacts:
        return contacts["lid:" + lid]
    if digits:
        for key in phone_keys(digits):
            if key in contacts:
                return contacts[key]
    return None


def person_label(contacts, phone_user, raw_user, server) -> str:
    digits = phone_user or (raw_user if server == "s.whatsapp.net" else None)
    lid = raw_user if server in LID_SERVERS else None
    name = contact_name(contacts, digits, lid)
    if name:
        return name
    if digits:
        return format_phone(digits)
    if raw_user:
        return f"Contato LID ...{raw_user[-4:]}"
    return "Desconhecido"


def squash(text: str) -> str:
    text = unicodedata.normalize("NFC", text).casefold()
    return "".join(ch if ch.isalnum() else "_" for ch in text)


class MediaResolver:
    """Liga cada mídia citada no banco a um arquivo real da pasta Media."""

    def __init__(self, base: Path) -> None:
        self.base = base
        self.cache: dict[str, tuple[str, str] | None] = {}
        self.used: set[str] = set()
        self._ready = False

    def _index(self) -> None:
        if self._ready:
            return
        self.by_size: dict[int, list[Path]] = defaultdict(list)
        self.by_dir_name: dict[tuple[str, str], list[Path]] = defaultdict(list)
        self.by_dir_stem: dict[tuple[str, str], list[Path]] = defaultdict(list)
        self.by_name: dict[str, list[Path]] = defaultdict(list)
        self.by_stem: dict[str, list[Path]] = defaultdict(list)
        scan_root = self.base / "Media" if (self.base / "Media").is_dir() else self.base
        for path in scan_root.rglob("*"):
            if not path.is_file():
                continue
            rel_dir = squash(path.parent.relative_to(self.base).as_posix())
            self.by_size[path.stat().st_size].append(path)
            self.by_dir_name[(rel_dir, squash(path.name))].append(path)
            self.by_dir_stem[(rel_dir, squash(path.stem))].append(path)
            self.by_name[squash(path.name)].append(path)
            self.by_stem[squash(path.stem)].append(path)
        self._ready = True

    @staticmethod
    def _sha256_b64(path: Path) -> str:
        digest = hashlib.sha256()
        with open(path, "rb") as handle:
            for chunk in iter(lambda: handle.read(1 << 20), b""):
                digest.update(chunk)
        return base64.b64encode(digest.digest()).decode()

    def _rel(self, path: Path) -> str:
        return path.relative_to(self.base).as_posix()

    def resolve(self, rel: str, size: int | None, file_hash: str | None):
        """Retorna (caminho relativo, método) ou None."""
        if rel in self.cache and self.cache[rel] is not None:
            return self.cache[rel]
        found = self._resolve(rel, size, file_hash)
        if found is not None:
            self.cache[rel] = found
            self.used.add(found[0])
        elif rel not in self.cache:
            self.cache[rel] = None
        return found

    def _resolve(self, rel: str, size, file_hash):
        direct = self.base / rel
        if direct.is_file():
            return self._rel(direct), "exato"
        self._index()
        rel_path = Path(rel)
        rel_dir = squash(rel_path.parent.as_posix())
        for table, key, method in (
            (self.by_dir_name, (rel_dir, squash(rel_path.name)), "nome normalizado"),
            (self.by_dir_stem, (rel_dir, squash(rel_path.name)), "sem extensão"),
            (self.by_dir_stem, (rel_dir, squash(rel_path.stem)), "extensão diferente"),
        ):
            hits = table.get(key)
            if hits and (not size or any(h.stat().st_size == size for h in hits)):
                best = next((h for h in hits if not size or h.stat().st_size == size), hits[0])
                return self._rel(best), method
        if size and file_hash:
            for candidate in self.by_size.get(size, []):
                if self._sha256_b64(candidate) == file_hash:
                    return self._rel(candidate), "hash"
        for table, key, method in (
            (self.by_name, squash(rel_path.name), "nome em outra pasta"),
            (self.by_stem, squash(rel_path.stem), "nome em outra pasta"),
        ):
            hits = [h for h in table.get(key, []) if not size or h.stat().st_size == size]
            if hits:
                return self._rel(hits[0]), method
        return None

    def resolve_hash(self, size: int | None, file_hash: str | None):
        """Procura por conteúdo (tamanho + SHA-256) mídias que o banco não aponta para um caminho."""
        if not size or not file_hash:
            return None
        key = f"#hash:{size}:{file_hash}"
        if key in self.cache:
            return self.cache[key]
        self._index()
        found = None
        for candidate in self.by_size.get(size, []):
            if self._sha256_b64(candidate) == file_hash:
                found = (self._rel(candidate), "hash (sem caminho no banco)")
                self.used.add(found[0])
                break
        self.cache[key] = found
        return found

    def resolve_name(self, name: str | None, size: int | None):
        """Último recurso para documentos sem caminho nem hash: nome original igual."""
        if not name:
            return None
        self._index()
        hits = self.by_name.get(squash(name), [])
        if size:
            hits = [h for h in hits if h.stat().st_size == size]
        if not hits:
            return None
        self.used.add(self._rel(hits[0]))
        return self._rel(hits[0]), "nome do documento (sem caminho no banco)"

    def unreferenced(self) -> int:
        self._index()
        return sum(1 for paths in self.by_size.values() for p in paths
                   if self._rel(p) not in self.used)


def classify_missing(rel: str, size: int | None) -> str:
    first = rel.split("/")[1] if rel.startswith("Media/") and "/" in rel[6:] else rel.split("/")[0]
    if first.startswith("."):
        return f"pasta oculta '{first}' ausente na cópia (copie também pastas ocultas)"
    if not size:
        return "arquivo vazio/nunca baixado (tamanho 0 no banco)"
    return "arquivo não está na pasta Media (apagado do celular ou não copiado)"


def build_message(row, contacts, is_group):
    msg_type = row["msg_type"]
    if msg_type in HIDDEN_TYPES:
        return None
    kind = TYPE_MAP.get(msg_type)
    text = INVISIBLE.sub("", row["text"] or row["media_caption"] or "")
    if row["revoked_id"] is not None or kind == "del":
        kind, text = "del", ""
    elif row["media_path"] and kind not in ("i", "a", "v", "d", "g", "s"):
        mime = (row["media_mime"] or "").split("/")[0]
        kind = {"image": "i", "audio": "a", "video": "v"}.get(mime, "d")
    elif kind is None:
        kind = "t" if text else None
    if kind is None or (kind == "t" and not text.strip()):
        return None
    if kind == "x" and not text:
        text = SYSTEM_TEXT.get(msg_type, "Aviso do sistema")

    record = {"i": row["msg_id"], "m": row["from_me"], "t": row["ts"], "y": kind}
    if text:
        record["x"] = text
    if is_group and not row["from_me"] and kind != "x":
        record["s"] = person_label(contacts, row["sender_phone"], row["sender_user"],
                                   row["sender_server"])
    if row["media_path"]:
        record["f"] = sanitize_media_path(row["media_path"].replace("\\", "/"))
    if row["media_path"] or kind in MEDIA_KINDS:
        for key, column in (("mt", "media_mime"), ("n", "media_name"), ("sz", "media_size"),
                            ("w", "media_w"), ("h", "media_h"), ("d", "media_dur")):
            if row[column]:
                record[key] = row[column]
    if row["quoted_text"] is not None or row["quoted_user"] is not None:
        quoted_text = INVISIBLE.sub("", row["quoted_text"] or row["qm_caption"] or "")
        if not quoted_text and row["qm_mime"]:
            quoted_text = quoted_media_label(row["qm_mime"], row["qm_name"])
        quoted = {"x": quoted_text, "m": row["quoted_from_me"]}
        if not row["quoted_from_me"]:
            quoted["s"] = person_label(contacts, row["quoted_phone"], row["quoted_user"],
                                       "s.whatsapp.net")
        record["q"] = quoted
    if row["edited_id"] is not None:
        record["e"] = 1
    if row["starred"]:
        record["st"] = 1
    if kind == "l":
        record["lat"], record["lng"] = row["lat"], row["lng"]
        if row["place_name"]:
            record["pl"] = row["place_name"]
    if row["ad_title"] or row["ad_body"]:
        record["ad"] = {"t": row["ad_title"] or "", "b": row["ad_body"] or "",
                        "u": row["ad_url"] or row["ad_media_url"] or ""}
    if kind == "k":
        record["cv"] = row["call_video"] or 0
        record["cd"] = row["call_duration"] or 0
        record["cr"] = row["call_result"]
    return record


def quoted_media_label(mime: str, name: str | None) -> str:
    kind = (mime or "").split("/")[0]
    label = {"image": "Foto", "audio": "Áudio", "video": "Vídeo"}.get(kind, "Documento")
    return f"{label}: {name}" if name and label == "Documento" else label


def preview_text(record) -> str:
    if record.get("x") and record["y"] in ("t", "x", "c"):
        return record["x"]
    label = MEDIA_LABEL.get(record["y"], "")
    return f"{label}: {record['x']}" if record.get("x") and label else label


def js_write(path: Path, prefix: str, payload, suffix: str = ");") -> None:
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    path.write_text(f"{prefix}{body}{suffix}", encoding="utf-8")


def sanitize_media_path(rel: str) -> str:
    """Substitui segmentos de caminho que começam com '.' (ex: .Shared → _Shared).
    O Chrome bloqueia acesso via file:// a pastas/arquivos com nome iniciado por ponto."""
    return "/".join(("_" + p[1:]) if p.startswith(".") else p for p in rel.split("/"))


def copy_media_sanitized(source: Path, dest: Path,
                         _counter: list | None = None, _total: int = 0) -> None:
    """Copia source para dest renomeando entradas com nome iniciado por '.' (ex: .Shared → _Shared).
    Imprime progresso percentual em linha única."""
    root_call = _counter is None
    if root_call:
        _total = sum(1 for _ in source.rglob("*") if _.is_file())
        _counter = [0, -1]  # [copiados, último_pct]
    os.makedirs(dest, exist_ok=True)
    for item in source.iterdir():
        safe_name = ("_" + item.name[1:]) if item.name.startswith(".") else item.name
        target = dest / safe_name
        if item.is_dir():
            copy_media_sanitized(item, target, _counter, _total)
        else:
            shutil.copy2(item, target)
            _counter[0] += 1
            pct = int(_counter[0] * 100 / _total) if _total else 0
            if pct != _counter[1]:
                _counter[1] = pct
                if pct > 0:
                    print("\033[1A\033[2K", end="", flush=True)
                print(f"  Copiando mídia... {pct}% ({_counter[0]} de {_total} arquivos)", flush=True)
    if root_call:
        print("\033[1A\033[2K", end="", flush=True)
        print(f"  Mídia copiada: {_counter[0]} arquivos.", flush=True)


def resolve_media_base(media: Path | None) -> Path | None:
    if media is None:
        return None
    if (media / "Media").is_dir():
        return media
    if media.name == "Media" and media.is_dir():
        return media.parent
    return media


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(
        description="Converte msgstore.db em um visualizador HTML estático e portátil")
    parser.add_argument("--db", default="msgstore.db", type=Path)
    parser.add_argument("--media", type=Path,
                        help="Pasta 'Media' do WhatsApp (ou a pasta que a contém)")
    parser.add_argument("--out", default="pendrive", type=Path)
    parser.add_argument("--contacts", type=Path, nargs="+", default=[],
                        help="Fontes de nomes: wa.db descriptografado, .vcf ou .csv "
                             "(se omitido e existir wa.db ao lado do msgstore.db, ele é usado)")
    parser.add_argument("--copy-media", action="store_true",
                        help="Copia a pasta Media para dentro da saída")
    parser.add_argument("--strict", action="store_true",
                        help="Termina com erro (código 2) se alguma mídia ficar sem arquivo")
    parser.add_argument("--lang", default="pt-BR", choices=["pt-BR", "en"],
                        help="Idioma da interface do visualizador (padrão: pt-BR)")
    args = parser.parse_args()

    contact_files = list(args.contacts)
    if not contact_files and (args.db.parent / "wa.db").is_file():
        contact_files = [args.db.parent / "wa.db"]
        print(f"Usando nomes de contatos de {contact_files[0]}")
    contacts = load_contacts(contact_files)
    media_base = resolve_media_base(args.media)
    resolver = MediaResolver(media_base) if media_base is not None else None
    data_dir = args.out / "data"
    if data_dir.exists():
        shutil.rmtree(data_dir)
    data_dir.mkdir(parents=True)

    con = sqlite3.connect(f"file:{args.db.resolve().as_posix()}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row

    media_rows = list(con.execute(MEDIA_SQL))
    if resolver is not None:
        for row in media_rows:
            resolver.resolve(row["path"], row["size"], row["hash"])

    chat_info = {}
    named_individual = individual = 0
    for row in con.execute(CHATS_SQL):
        is_group = row["jid_server"] == "g.us"
        digits = row["phone_user"] or (
            row["jid_user"] if row["jid_server"] == "s.whatsapp.net" else None)
        lid = row["jid_user"] if row["jid_server"] in LID_SERVERS else None
        if not is_group:
            individual += 1
        if row["subject"]:
            title = row["subject"]
        elif is_group:
            title = "Grupo sem nome"
        elif contact_name(contacts, digits, lid):
            title = contact_name(contacts, digits, lid)
            named_individual += 1
        elif digits:
            title = format_phone(digits)
        elif lid:
            title = f"Contato LID ...{row['jid_user'][-4:]}"
        else:
            title = row["jid_raw"] or "Conversa"
        chat_info[row["chat_id"]] = {
            "id": row["chat_id"], "title": title, "phone": digits or "",
            "isGroup": 1 if is_group else 0,
        }

    polls: dict[int, list] = defaultdict(list)
    for row in con.execute(POLL_SQL):
        polls[row["msg_id"]].append([row["option_name"], row["vote_total"]])

    by_chat: dict[int, list] = defaultdict(list)
    fulltext = []
    skipped = total_messages = media_messages = pathless_total = pathless_found = 0
    unresolved: list[list] = []
    thumbs_dir = data_dir / "thumbs"
    saved_thumbs: set[str] = set()
    for row in con.execute(MESSAGES_SQL):
        info = chat_info.get(row["chat_id"])
        if info is None:
            continue
        record = build_message(row, contacts, bool(info["isGroup"]))
        if record is None:
            skipped += 1
            continue
        if row["msg_id"] in polls:
            record["y"], record["o"] = "p", polls[row["msg_id"]]
        if record.get("ad") and row["ad_thumb"]:
            digest = hashlib.sha1(row["ad_thumb"]).hexdigest()[:16]
            if digest not in saved_thumbs:
                thumbs_dir.mkdir(exist_ok=True)
                (thumbs_dir / f"{digest}.jpg").write_bytes(row["ad_thumb"])
                saved_thumbs.add(digest)
            record["ad"]["th"] = f"data/thumbs/{digest}.jpg"
        if record["y"] in MEDIA_KINDS or record.get("f"):
            media_messages += 1
            had_path = bool(record.get("f"))
            pathless_total += 0 if had_path else 1
            found = None
            if resolver is not None:
                if had_path:
                    found = resolver.resolve(record["f"], row["media_size"], row["media_hash"])
                else:
                    found = resolver.resolve_hash(row["media_size"], row["media_hash"])
                    if found is None and record["y"] == "d":
                        found = resolver.resolve_name(record.get("n"), row["media_size"])
            if found is not None:
                record["f"] = sanitize_media_path(found[0])
                pathless_found += 0 if had_path else 1
            elif resolver is not None or not had_path:
                record["nf"] = 1
                if resolver is not None:
                    reason = (classify_missing(record["f"], row["media_size"]) if had_path else
                              "sem caminho no banco e nenhum arquivo com o mesmo conteúdo "
                              "(não baixada no aparelho ou apagada)")
                    unresolved.append([row["msg_id"], info["title"],
                                       datetime.fromtimestamp(row["ts"] / 1000).strftime("%Y-%m-%d %H:%M"),
                                       record["y"], record.get("f") or record.get("n", ""),
                                       row["media_size"] or 0, reason])
        by_chat[row["chat_id"]].append(record)
        total_messages += 1
        searchable = record.get("x") or (record.get("n") if record["y"] == "d" else "")
        if searchable and record["y"] in ("t", "i", "v", "d", "g"):
            fulltext.append([row["chat_id"], record["i"], record["t"], searchable])

    chats = []
    for chat_id, records in by_chat.items():
        info = chat_info[chat_id]
        last = records[-1]
        info.update(lastTs=last["t"], lastText=preview_text(last)[:120], lastMe=last["m"],
                    count=len(records), hasMedia=1 if any("f" in r for r in records) else 0,
                    search=normalize(info["title"]))
        chats.append(info)
        js_write(data_dir / f"chat_{chat_id}.js", f"window.__chat({chat_id},", records)
    chats.sort(key=lambda chat: chat["lastTs"], reverse=True)

    meta = {"generatedAt": datetime.now().isoformat(timespec="seconds"),
            "messages": total_messages, "chats": len(chats)}
    js_write(data_dir / "chats.js", "window.CHATS=", chats, ";")
    with open(data_dir / "chats.js", "a", encoding="utf-8") as handle:
        handle.write(f"window.META={json.dumps(meta)};")
    js_write(data_dir / "fulltext.js", "window.__fulltext(", fulltext)

    for item in WEB_DIR.iterdir():
        if item.is_file():
            if item.name == "index.html" and args.lang != "pt-BR":
                html = item.read_text(encoding="utf-8")
                html = html.replace(
                    '<script src="app.js"></script>',
                    f'<script>window.LANG="{args.lang}";</script>\n<script src="app.js"></script>',
                )
                (args.out / item.name).write_text(html, encoding="utf-8")
            else:
                shutil.copy2(item, args.out / item.name)
    if resolver is not None and args.copy_media:
        source = media_base / "Media"
        if source.is_dir():
            dest_media = args.out / "Media"
            if dest_media.is_symlink() or (dest_media.exists() and not dest_media.is_dir()):
                dest_media.unlink()
            elif dest_media.is_dir():
                shutil.rmtree(dest_media)
            copy_media_sanitized(source, dest_media)

    report = [
        f"Gerado em: {meta['generatedAt']}",
        f"Conversas: {len(chats)}",
        f"Mensagens exibidas: {total_messages}",
        f"Mensagens ocultas (tipos internos sem conteúdo): {skipped}",
        f"Contatos carregados: {len(contacts)} chaves de {len(contact_files)} fonte(s)",
        f"Conversas individuais com nome de contato: {named_individual} de {individual}",
    ]
    exit_code = 0
    csv_path = args.out / "midias_ausentes.csv"
    if resolver is None:
        report.append("Pasta Media não informada: mídias não verificadas (use --media).")
    else:
        paths = {row["path"] for row in media_rows}
        methods: dict[str, list[tuple[str, str]]] = defaultdict(list)
        for rel in sorted(paths):
            found = resolver.cache.get(rel)
            if found is not None and found[1] != "exato":
                methods[found[1]].append((rel, found[0]))
        reasons: dict[str, int] = defaultdict(int)
        for entry in unresolved:
            reasons[entry[6]] += 1
        report += [
            f"Mensagens com mídia: {media_messages}",
            f"  com arquivo vinculado: {media_messages - len(unresolved)}",
            f"  SEM arquivo: {len(unresolved)}",
            f"Mídias sem caminho no banco: {pathless_total} (vinculadas pelo conteúdo/hash: {pathless_found})",
            f"Arquivos da pasta Media não usados por nenhuma mensagem: {resolver.unreferenced()}",
        ]
        if methods:
            report.append("")
            report.append("Vínculos corrigidos (o nome no banco difere do arquivo no disco):")
            for method, items in methods.items():
                suffix = "  [revisar]" if method in ("nome em outra pasta", "extensão diferente") else ""
                report.append(f"  {method}: {len(items)}{suffix}")
                report += [f"    {rel}  ->  {dst}" for rel, dst in items]
        if unresolved:
            report.append("")
            report.append("Mensagens sem arquivo, por motivo:")
            report += [f"  {count} | {reason}" for reason, count in sorted(reasons.items(), key=lambda kv: -kv[1])]
            report.append("Lista completa (mensagem, conversa, data, tipo, arquivo, tamanho, motivo): midias_ausentes.csv")
            with open(csv_path, "w", encoding="utf-8-sig", newline="") as handle:
                writer = csv.writer(handle, delimiter=";")
                writer.writerow(["mensagem_id", "conversa", "data", "tipo", "arquivo", "tamanho_banco", "motivo"])
                writer.writerows(unresolved)
            exit_code = 2 if args.strict else 0
        elif csv_path.exists():
            csv_path.unlink()
    report_text = chr(10).join(report)
    (args.out / "relatorio.txt").write_text(report_text, encoding="utf-8")
    print(report_text)
    if exit_code:
        print(chr(10) + "--strict: existem mídias sem arquivo.")
        raise SystemExit(exit_code)
