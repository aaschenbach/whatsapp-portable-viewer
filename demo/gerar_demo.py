"""Gera um backup de demonstração com dados 100% fictícios.

Cria, dentro da pasta de saída, um msgstore.db sintético (apenas as tabelas que o
conversor consulta), uma pasta Media/ com arquivos falsos e um contatos.csv fictício.
Serve para os testes, para as capturas de tela do guia e para experimentar o fluxo
sem expor conversas reais.

Uso: uv run python demo/gerar_demo.py [pasta_de_saida]
"""

from __future__ import annotations

import base64
import hashlib
import io
import sqlite3
import sys
import wave
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw

SCHEMA = """
CREATE TABLE jid (_id INTEGER PRIMARY KEY, user TEXT, server TEXT, agent INTEGER, device INTEGER, type INTEGER, raw_string TEXT);
CREATE TABLE jid_map (lid_row_id INTEGER, jid_row_id INTEGER, sort_id INTEGER);
CREATE TABLE chat (_id INTEGER PRIMARY KEY, jid_row_id INTEGER, subject TEXT, last_message_row_id INTEGER);
CREATE TABLE message (_id INTEGER PRIMARY KEY, chat_row_id INTEGER, from_me INTEGER, sender_jid_row_id INTEGER,
                      timestamp INTEGER, message_type INTEGER, text_data TEXT, starred INTEGER);
CREATE TABLE message_media (message_row_id INTEGER, file_path TEXT, mime_type TEXT, media_name TEXT, media_caption TEXT,
                            file_size INTEGER, file_hash TEXT, width INTEGER, height INTEGER, media_duration INTEGER,
                            transferred INTEGER);
CREATE TABLE message_quoted (message_row_id INTEGER, chat_row_id INTEGER, from_me INTEGER, sender_jid_row_id INTEGER, text_data TEXT);
CREATE TABLE message_quoted_media (message_row_id INTEGER, mime_type TEXT, media_name TEXT, media_caption TEXT);
CREATE TABLE message_location (message_row_id INTEGER, latitude REAL, longitude REAL, place_name TEXT);
CREATE TABLE message_revoked (message_row_id INTEGER);
CREATE TABLE message_edit_info (message_row_id INTEGER);
CREATE TABLE call_log (_id INTEGER PRIMARY KEY, video_call INTEGER, duration INTEGER, call_result INTEGER);
CREATE TABLE message_call_log (message_row_id INTEGER, call_log_row_id INTEGER);
CREATE TABLE message_external_ad_content (message_row_id INTEGER, title TEXT, body TEXT, source_url TEXT, media_url TEXT, micro_thumbnail BLOB);
CREATE TABLE message_poll_option (_id INTEGER PRIMARY KEY, message_row_id INTEGER, option_name TEXT, vote_total INTEGER);
"""


def ms(year, month, day, hour, minute) -> int:
    return int(datetime(year, month, day, hour, minute).timestamp() * 1000)


def sha256_b64(path: Path) -> str:
    return base64.b64encode(hashlib.sha256(path.read_bytes()).digest()).decode()


def make_image(path: Path, label: str, color: tuple[int, int, int], size=(480, 320)) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", size, color)
    draw = ImageDraw.Draw(image)
    draw.rectangle([10, 10, size[0] - 10, size[1] - 10], outline=(255, 255, 255), width=4)
    draw.text((30, size[1] // 2 - 6), label, fill=(255, 255, 255))
    image.save(path)


def make_wav(path: Path, seconds: float = 2.0) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rate = 8000
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(1)
        handle.setframerate(rate)
        handle.writeframes(bytes(128 + (60 if (i // 40) % 2 else -60) for i in range(int(rate * seconds))))


def make_pdf(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    stream = f"BT /F1 18 Tf 72 720 Td ({text}) Tj ET"
    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    body, offsets = "%PDF-1.4\n", []
    for number, obj in enumerate(objects, 1):
        offsets.append(len(body))
        body += f"{number} 0 obj\n{obj}\nendobj\n"
    xref = len(body)
    body += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n"
    body += "".join(f"{offset:010d} 00000 n \n" for offset in offsets)
    body += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n"
    path.write_bytes(body.encode("latin-1"))


def jpeg_bytes(label: str) -> bytes:
    buffer = io.BytesIO()
    image = Image.new("RGB", (89, 50), (0, 120, 90))
    ImageDraw.Draw(image).text((8, 18), label, fill=(255, 255, 255))
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def build(out: Path) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    media = out / "Media"
    images, voices, docs, stickers = (media / f"WhatsApp Business {n}" for n in
                                      ("Images", "Voice Notes", "Documents", "Stickers"))

    photo = images / "IMG-20260105-WA0001.jpg"
    make_image(photo, "Foto fictícia 1", (30, 120, 200))
    photo2 = images / "IMG-20260105-WA0002.jpg"
    make_image(photo2, "Foto fictícia 2", (190, 90, 40))
    make_wav(voices / "202601" / "PTT-20260105-WA0003.wav")
    sticker = stickers / "STK-20260105-WA0004.webp"
    sticker.parent.mkdir(parents=True, exist_ok=True)
    Image.new("RGBA", (256, 256), (240, 200, 0, 255)).save(sticker, format="WEBP")
    make_pdf(docs / "Orçamento_Demo.pdf", "Documento ficticio de demonstracao")
    make_pdf(docs / "Relatório d_Água.pdf", "Relatorio com apostrofo trocado")
    make_pdf(docs / "DOC-20260106-WA0005.pdf", "Documento sem extensao no banco")
    hashed = docs / "Sent" / "arquivo_renomeado_xyz.pdf"
    make_pdf(hashed, "Documento localizado pelo conteudo")

    db_path = out / "msgstore.db"
    if db_path.exists():
        db_path.unlink()
    con = sqlite3.connect(db_path)
    con.executescript(SCHEMA)

    jids = [
        (1, "5511900000001", "s.whatsapp.net", "5511900000001@s.whatsapp.net"),
        (2, "5511900000002", "s.whatsapp.net", "5511900000002@s.whatsapp.net"),
        (3, "120363000000000001", "g.us", "120363000000000001@g.us"),
        (4, "99887766554433", "lid", "99887766554433@lid"),
        (5, "5511900000003", "s.whatsapp.net", "5511900000003@s.whatsapp.net"),
        (6, "11223344556677", "lid", "11223344556677@lid"),
    ]
    con.executemany("INSERT INTO jid (_id, user, server, raw_string) VALUES (?,?,?,?)", jids)
    con.execute("INSERT INTO jid_map VALUES (4, 5, 1)")
    chats = [(1, 1, None), (2, 2, None), (3, 3, "Equipe Demonstração"), (4, 4, None), (5, 6, None)]
    con.executemany("INSERT INTO chat (_id, jid_row_id, subject) VALUES (?,?,?)", chats)

    messages: list[tuple] = []
    media_rows: list[tuple] = []

    def add(chat, from_me, ts, mtype, text=None, sender=None, starred=0) -> int:
        mid = len(messages) + 1
        messages.append((mid, chat, from_me, sender, ts, mtype, text, starred))
        return mid

    # Chat 1: cliente que chegou por anúncio
    ad = add(1, 0, ms(2026, 1, 5, 9, 0), 55)
    con.execute("INSERT INTO message_external_ad_content VALUES (?,?,?,?,?,?)",
                (ad, "Converse conosco", "Anúncio fictício de demonstração.\nClique para falar com a equipe.",
                 "https://example.com/anuncio-demo", "https://example.com/video-demo", jpeg_bytes("ANUNCIO")))
    add(1, 0, ms(2026, 1, 5, 9, 1), 0, "Olá! Vi o anúncio e queria *mais informações*.")
    add(1, 1, ms(2026, 1, 5, 9, 3), 0, "Olá! Claro. Posso te enviar o _orçamento_ agora?")
    reply = add(1, 0, ms(2026, 1, 5, 9, 4), 0, "Pode sim, obrigado!")
    con.execute("INSERT INTO message_quoted VALUES (?,?,?,?,?)", (reply, 1, 1, None, "Olá! Claro. Posso te enviar o orçamento agora?"))
    pic = add(1, 0, ms(2026, 1, 5, 9, 6), 1, "Foto do local")
    media_rows.append((pic, "Media/WhatsApp Business Images/IMG-20260105-WA0001.jpg", "image/jpeg", "IMG-20260105-WA0001.jpg",
                       "Foto do local", photo.stat().st_size, sha256_b64(photo), 480, 320, None, 1))
    voice = add(1, 0, ms(2026, 1, 5, 9, 7), 2)
    wav = voices / "202601" / "PTT-20260105-WA0003.wav"
    media_rows.append((voice, "Media/WhatsApp Business Voice Notes/202601/PTT-20260105-WA0003.wav", "audio/wav", None, None,
                       wav.stat().st_size, sha256_b64(wav), None, None, 2, 1))
    stk = add(1, 0, ms(2026, 1, 5, 9, 8), 20)
    media_rows.append((stk, "Media/WhatsApp Business Stickers/STK-20260105-WA0004.webp", "image/webp", None, None,
                       sticker.stat().st_size, sha256_b64(sticker), 256, 256, None, 1))
    doc1 = add(1, 1, ms(2026, 1, 5, 10, 0), 9)
    pdf1 = docs / "Orçamento_Demo.pdf"
    media_rows.append((doc1, "Media/WhatsApp Business Documents/Orçamento_Demo.pdf", "application/pdf", "Orçamento_Demo.pdf", None,
                       pdf1.stat().st_size, sha256_b64(pdf1), None, None, None, 1))
    deleted = add(1, 0, ms(2026, 1, 5, 10, 5), 15)
    con.execute("INSERT INTO message_revoked VALUES (?)", (deleted,))
    edited = add(1, 1, ms(2026, 1, 5, 10, 8), 0, "Combinado, até amanhã às 14h.")
    con.execute("INSERT INTO message_edit_info VALUES (?)", (edited,))
    loc = add(1, 1, ms(2026, 1, 5, 10, 9), 5)
    con.execute("INSERT INTO message_location VALUES (?,?,?,?)", (loc, -23.5505, -46.6333, "Endereço fictício, São Paulo"))
    call = add(1, 0, ms(2026, 1, 6, 8, 0), 90)
    con.execute("INSERT INTO call_log VALUES (1, 0, 95, 5)")
    con.execute("INSERT INTO message_call_log VALUES (?,?)", (call, 1))

    # Chat 2: mídias com nomes diferentes dos arquivos (cascata de vínculo)
    add(2, 0, ms(2026, 1, 6, 11, 0), 0, "Segue o material que combinamos.")
    apos = add(2, 0, ms(2026, 1, 6, 11, 1), 9)
    pdf2 = docs / "Relatório d_Água.pdf"
    media_rows.append((apos, "Media/WhatsApp Business Documents/Relatório d'Água.pdf", "application/pdf", "Relatório d'Água.pdf", None,
                       pdf2.stat().st_size, sha256_b64(pdf2), None, None, None, 1))
    noext = add(2, 0, ms(2026, 1, 6, 11, 2), 9)
    pdf3 = docs / "DOC-20260106-WA0005.pdf"
    media_rows.append((noext, "Media/WhatsApp Business Documents/DOC-20260106-WA0005", "application/pdf", "DOC-20260106-WA0005", None,
                       pdf3.stat().st_size, sha256_b64(pdf3), None, None, None, 1))
    byhash = add(2, 0, ms(2026, 1, 6, 11, 3), 9)
    media_rows.append((byhash, "Media/WhatsApp Business Documents/Sent/nome_original_perdido.pdf", "application/pdf", "nome_original_perdido.pdf", None,
                       hashed.stat().st_size, sha256_b64(hashed), None, None, None, 1))
    gone = add(2, 0, ms(2026, 1, 6, 11, 4), 1)
    media_rows.append((gone, "Media/WhatsApp Business Images/IMG-20260106-WA0099.jpg", "image/jpeg", "IMG-20260106-WA0099.jpg", None,
                       43303, "AAAA", 640, 480, None, 1))
    never = add(2, 0, ms(2026, 1, 6, 11, 5), 9)
    media_rows.append((never, None, "application/pdf", "Contrato_Fictício.pdf", None, 0, None, None, None, None, 0))
    add(2, 1, ms(2026, 1, 6, 11, 10), 0, "Recebi tudo, obrigado! Veja https://example.com/exemplo", starred=1)
    pic2 = add(2, 1, ms(2026, 1, 6, 11, 12), 1)
    media_rows.append((pic2, "Media/WhatsApp Business Images/IMG-20260105-WA0002.jpg", "image/jpeg", "IMG-20260105-WA0002.jpg", None,
                       photo2.stat().st_size, sha256_b64(photo2), 480, 320, None, 1))

    # Chat 3: grupo
    add(3, 0, ms(2026, 2, 1, 8, 0), 0, "Bom dia, equipe! Reunião às 10h.", sender=1)
    add(3, 0, ms(2026, 2, 1, 8, 1), 0, "Confirmado!", sender=2)
    add(3, 1, ms(2026, 2, 1, 8, 2), 0, "Levo a pauta impressa.")
    poll = add(3, 0, ms(2026, 2, 1, 8, 5), 0, "Qual horário prefere?", sender=1)
    con.executemany("INSERT INTO message_poll_option (message_row_id, option_name, vote_total) VALUES (?,?,?)",
                    [(poll, "10h", 3), (poll, "14h", 1)])

    # Chat 4: contato @lid com telefone mapeado; chat 5: @lid sem mapeamento
    add(4, 0, ms(2026, 3, 3, 15, 30), 0, "Olá, tudo bem? Pesquisa por ação, acentuação e número 90000-0003.")
    add(5, 0, ms(2026, 3, 4, 9, 15), 0, "Mensagem de um contato sem telefone conhecido.")

    con.executemany("INSERT INTO message VALUES (?,?,?,?,?,?,?,?)", messages)
    con.executemany("INSERT INTO message_media VALUES (?,?,?,?,?,?,?,?,?,?,?)", media_rows)
    last = {}
    for mid, chat, *_ in messages:
        last[chat] = mid
    for chat, mid in last.items():
        con.execute("UPDATE chat SET last_message_row_id=? WHERE _id=?", (mid, chat))
    con.commit()
    con.close()

    (out / "contatos.csv").write_text(
        "First Name,Last Name,Phone 1 - Label,Phone 1 - Value\n"
        "Ana,Demonstração,Mobile,+55 11 90000-0001\n"
        "Bruno,Exemplo,Mobile,+55 11 90000-0002\n"
        "Carla,Fictícia,Mobile,+55 11 90000-0003\n", encoding="utf-8-sig")
    return {"db": db_path, "media": media, "contacts": out / "contatos.csv",
            "messages": len(messages), "chats": len(chats)}


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "saida"
    info = build(out)
    print(f"Demonstração criada em {out}: {info['chats']} conversas, {info['messages']} mensagens.")


if __name__ == "__main__":
    main()
