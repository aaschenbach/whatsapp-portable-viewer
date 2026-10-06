from __future__ import annotations

import csv
import json
import sqlite3
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "demo"))

import gerar_demo  # noqa: E402

from wacrypttools import builder  # noqa: E402


@pytest.fixture(scope="session")
def demo(tmp_path_factory):
    out = tmp_path_factory.mktemp("demo")
    info = gerar_demo.build(out)
    return {**info, "out": out}


@pytest.fixture(scope="session")
def built(demo, tmp_path_factory):
    target = tmp_path_factory.mktemp("pendrive")
    argv = ["wacrypttools", "--db", str(demo["db"]), "--media", str(demo["media"]),
            "--out", str(target), "--contacts", str(demo["contacts"])]
    old = sys.argv
    sys.argv = argv
    try:
        builder.main()
    finally:
        sys.argv = old
    return target


def read_js(path: Path, prefix: str, suffix: str):
    text = path.read_text(encoding="utf-8")
    assert text.startswith(prefix), path
    return json.loads(text[len(prefix):text.rindex(suffix)])


def test_normalize_removes_accents_and_case():
    assert builder.normalize("AÇÃO Á é") == "acao a e"


def test_format_phone_brazil_and_other():
    assert builder.format_phone("5511999998888") == "+55 (11) 99999-8888"
    assert builder.format_phone("14155550123") == "+14155550123"


def test_phone_keys_ninth_digit():
    assert builder.phone_keys("5511988887777")[1] == builder.phone_keys("551188887777")[1]


def test_norm_phone_adds_country_code():
    assert builder.norm_phone("(11) 99999-8888") == "5511999998888"
    assert builder.norm_phone("+1 415 555 0123") == "14155550123"


def test_vcf_quoted_printable_and_ninth_digit(tmp_path):
    vcf = tmp_path / "c.vcf"
    vcf.write_text("BEGIN:VCARD\nFN;ENCODING=QUOTED-PRINTABLE:Jo=C3=A3o\nTEL:(11) 98888-7777\nEND:VCARD\n",
                   encoding="utf-8")
    contacts = builder.load_contacts([vcf])
    assert builder.contact_name(contacts, "5511988887777") == "João"
    assert builder.contact_name(contacts, "551188887777") == "João"
    assert builder.contact_name(contacts, "551188887776") is None


def test_google_csv_multiple_phones(tmp_path):
    path = tmp_path / "g.csv"
    path.write_text("First Name,Last Name,Phone 1 - Label,Phone 1 - Value\n"
                    "Ana,Costa,Mobile,+55 11 97777-6666 ::: +55 11 3000-1000\n", encoding="utf-8")
    contacts = builder.load_contacts([path])
    assert builder.contact_name(contacts, "5511977776666") == "Ana Costa"
    assert builder.contact_name(contacts, "551130001000") == "Ana Costa"


def test_wa_db_phone_and_lid(tmp_path):
    path = tmp_path / "wa.db"
    con = sqlite3.connect(path)
    con.execute("CREATE TABLE wa_contacts (jid TEXT, display_name TEXT, wa_name TEXT)")
    con.execute("INSERT INTO wa_contacts VALUES ('5511971234567@s.whatsapp.net', 'Pedro', 'push')")
    con.execute("INSERT INTO wa_contacts VALUES ('9988776655@lid', NULL, 'Pessoa Lid')")
    con.commit()
    con.close()
    contacts = builder.load_contacts([path])
    assert builder.contact_name(contacts, "5511971234567") == "Pedro"
    assert builder.contact_name(contacts, None, "9988776655") == "Pessoa Lid"


def test_squash_ignores_apostrophe_and_case():
    assert builder.squash("Relatório d'Água.pdf") == builder.squash("RELATÓRIO D_ÁGUA.PDF")


def test_resolver_cascade(demo):
    resolver = builder.MediaResolver(demo["media"].parent)
    media = "Media/WhatsApp Business Documents/"
    assert resolver.resolve(media + "Orçamento_Demo.pdf", None, None)[1] == "exato"
    assert resolver.resolve(media + "Relatório d'Água.pdf", None, None)[1] == "nome normalizado"
    assert resolver.resolve(media + "DOC-20260106-WA0005", None, None)[1] == "sem extensão"
    assert resolver.resolve(media + "inexistente.pdf", 10, "x") is None


def test_resolver_hash_and_name(demo):
    resolver = builder.MediaResolver(demo["media"].parent)
    target = demo["media"] / "WhatsApp Business Documents" / "Sent" / "arquivo_renomeado_xyz.pdf"
    found = resolver.resolve("Media/WhatsApp Business Documents/Sent/outro_nome.pdf",
                             target.stat().st_size, gerar_demo.sha256_b64(target))
    assert found[1] == "hash"
    by_name = resolver.resolve_name("Orçamento_Demo.pdf", None)
    assert by_name is not None and by_name[0].endswith("Orçamento_Demo.pdf")


def test_classify_missing():
    assert "oculta" in builder.classify_missing("Media/.Statuses/x.jpg", 10)
    assert "vazio" in builder.classify_missing("Media/WhatsApp Business Images/x.jpg", 0)
    assert "não está" in builder.classify_missing("Media/WhatsApp Business Images/x.jpg", 10)


def test_builder_outputs(built, demo):
    chats = read_js(built / "data" / "chats.js", "window.CHATS=", ";window.META")
    assert len(chats) == demo["chats"]
    titles = {chat["title"] for chat in chats}
    assert {"Ana Demonstração", "Bruno Exemplo", "Carla Fictícia", "Equipe Demonstração"} <= titles
    assert sum(chat["count"] for chat in chats) == demo["messages"] - 0
    for name in ("index.html", "style.css", "app.js", "relatorio.txt", "midias_ausentes.csv"):
        assert (built / name).exists(), name


def test_builder_media_links_and_missing(built):
    chat1 = read_js(built / "data" / "chat_2.js", "window.__chat(2,", ");")
    docs = [m for m in chat1 if m["y"] == "d"]
    resolved = [m for m in docs if m.get("f") and not m.get("nf")]
    assert len(resolved) == 3
    assert any(m["f"].endswith("Relatório d_Água.pdf") for m in resolved)
    missing = [m for m in chat1 if m.get("nf")]
    assert len(missing) == 2
    with open(built / "midias_ausentes.csv", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle, delimiter=";"))
    assert len(rows) == 3  # cabeçalho + 2 mensagens sem arquivo


def test_builder_ad_poll_quote(built):
    chat1 = read_js(built / "data" / "chat_1.js", "window.__chat(1,", ");")
    ad = next(m for m in chat1 if m.get("ad"))
    assert ad["ad"]["t"] == "Converse conosco" and (built / ad["ad"]["th"]).exists()
    assert any(m.get("q") for m in chat1)
    assert any(m["y"] == "del" for m in chat1)
    assert any(m.get("e") for m in chat1)
    chat3 = read_js(built / "data" / "chat_3.js", "window.__chat(3,", ");")
    poll = next(m for m in chat3 if m["y"] == "p")
    assert poll["o"] == [["10h", 3], ["14h", 1]]
