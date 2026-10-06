# WhatsApp Portable Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-≥3.14-blue.svg)](https://www.python.org/)
[![uv](https://img.shields.io/badge/managed%20with-uv-7C3AED.svg)](https://docs.astral.sh/uv/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#quick-start-english)
[![Language](https://img.shields.io/badge/interface-pt--BR%20%7C%20en-orange.svg)](#language)

Decrypt your own **WhatsApp / WhatsApp Business** Android backup (`.crypt15`) and turn it into an
**offline, WhatsApp-Web-style viewer** that runs from a USB stick: no server, no internet, no install on
the machine that opens it.

![Conversation list and chat](docs/img/03-conversa-com-midias.png)

- Searchable chat list (by name, phone number or text), per-chat search, jump to date.
- Photos, voice notes, videos, documents, stickers, locations, polls, calls, quoted replies, ads.
- Contact names from `wa.db`, a `.vcf` or a Google Contacts `.csv`.
- A **media report** that tells you exactly which files could not be linked and why.
- A USB-copy step that **verifies every file by SHA-256** (it caught a fake-capacity stick during development).
- A one-click Windows assistant (`iniciar.bat`) for non-technical users.
- **English and Portuguese (pt-BR)** viewer interface — choose with `--lang en` or `--lang pt-BR`.

> **Full step-by-step guide (Brazilian Portuguese): [README.pt-BR.md](README.pt-BR.md)**
> The guide covers everything from creating the backup on the phone to building the USB stick.

---

## Quick start (English)

### Step 1 — Create an encrypted backup with the 64-digit key

On your phone, go to **WhatsApp → Settings → Chats → Chat backup → End-to-end encrypted backup**.
Choose **Use 64-digit encryption key**, tap **Create**, and **write down the 64 hex digits** — WhatsApp shows the key
only once.

> WhatsApp Business: Settings → Chats → Chat backup → End-to-end encrypted backup.

### Step 2 — Copy files to your PC

After the backup completes, copy from your phone (internal storage) to the PC:

| What | Where on the phone |
|---|---|
| `msgstore.db.crypt15` | `WhatsApp/Databases/` |
| `Backups/` folder | `WhatsApp/Backups/` (contains `wa.db.crypt15`) |
| `Media/` folder | `WhatsApp/Media/` — **include hidden sub-folders** |

Also export contacts: from the Contacts app as a `.vcf`, and from [contacts.google.com](https://contacts.google.com)
as a CSV. Without contacts, chats show only phone numbers (especially relevant for WhatsApp Business).

### Step 3 — Install prerequisites

1. Install [Git for Windows](https://git-scm.com/download/win).
2. Install [uv](https://docs.astral.sh/uv/) (run `winget install astral-sh.uv` in PowerShell, or see the uv docs).
3. Clone this repository (or download the ZIP):

```powershell
git clone https://github.com/aaschenbach/whatsapp-portable-viewer
cd whatsapp-portable-viewer
uv sync
```

### Step 4 — Decrypt the database

Replace `<64-hex-key>` with your actual key (no spaces):

```powershell
uv run wadecrypt <64-hex-key> msgstore.db.crypt15 msgstore.db
```

If you also want contact names from `wa.db`:

```powershell
uv run wadecrypt <64-hex-key> Backups/wa.db.crypt15 wa.db
```

### Step 5 — Generate the viewer

```powershell
uv run wacrypttools --db msgstore.db --media Media --out pendrive
```

For an English-language interface:

```powershell
uv run wacrypttools --db msgstore.db --media Media --out pendrive --lang en
```

Optional flags:

| Flag | Effect |
|---|---|
| `--contacts wa.db contacts.vcf contacts.csv` | Load contact names (auto-detected if `wa.db` is next to `msgstore.db`) |
| `--copy-media` | Copy the Media folder into the output (self-contained USB stick) |
| `--strict` | Exit with code 2 if any media file is missing |
| `--lang en` | English viewer interface |
| `--lang pt-BR` | Portuguese viewer interface (default) |

### Step 6 — Copy to USB stick (Windows)

```powershell
.\criar-pendrive.ps1 -Drive E
```

The script copies every file and **verifies the SHA-256 of each one**. It will report any
discrepancy (wrong size, corrupted copy, or a fake-capacity drive).

### Step 7 — Open the viewer

Double-click `index.html` in the USB stick (or in the output folder). No internet needed.

---

## Full guide index (pt-BR)

The complete step-by-step guide is in Portuguese:

0. [Overview](docs/00-visao-geral.md) — what it is, how long it takes, what you need
1. [Prepare the phone](docs/01-preparar-o-celular.md) — encrypted backup and file copy
2. [Install on PC](docs/02-instalar-no-computador.md)
3. [Key and decryption](docs/03-chave-e-descriptografia.md)
4. [Contact names](docs/04-nomes-dos-contatos.md)
5. [Generate the viewer](docs/05-gerar-o-visualizador.md)
6. [Build the USB stick](docs/06-montar-o-pendrive.md)
7. [Using the viewer](docs/07-usando-o-visualizador.md)
8. [Rebuild with a new backup](docs/08-novo-backup.md)
9. [Common problems](docs/09-problemas-comuns.md)
10. [How it works](docs/10-como-funciona.md)

---

## Language

The generated viewer supports two interface languages:

```powershell
# Portuguese (default)
uv run wacrypttools --db msgstore.db --media Media --out pendrive

# English
uv run wacrypttools --db msgstore.db --media Media --out pendrive --lang en
```

All UI strings, tooltips, menus and export labels change accordingly.

---

## Why not the old methods?

Old tutorials required *root access*, the "ABE" trick, a downgraded legacy APK, or guessed passwords.
**None of that is needed today.** Since ~2022 WhatsApp offers a **64-digit key** that you own, and the
`.crypt15` format is publicly documented. The old methods are obsolete.

---

## Credits and licenses

This project is MIT-licensed. Decryption is done by the excellent
[wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools) by ElDavoo (GPL-3.0, used as an external tool).
See [docs/creditos.md](docs/creditos.md) and [docs/comparacao.md](docs/comparacao.md) for related projects
such as [WhatsApp-Chat-Exporter](https://github.com/KnugiHK/WhatsApp-Chat-Exporter).

---

## Privacy

Your chats belong to you and to the people you talked to. Never publish your key, your `msgstore.db`, your
`Media` folder or the generated viewer. See [docs/seguranca-e-privacidade.md](docs/seguranca-e-privacidade.md).
All screenshots in this repository use a **100% fictional** demo (`demo/gerar_demo.py`).
