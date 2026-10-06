# WhatsApp Portable Viewer

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

> **Full step-by-step guide (Brazilian Portuguese): [README.pt-BR.md](README.pt-BR.md)**
> The guide covers everything from creating the backup on the phone to building the USB stick.

## Quick start (English)

1. On the phone, enable **end-to-end encrypted backup with the 64-digit key** and save the key (WhatsApp shows it once).
2. Copy `msgstore.db.crypt15`, the `Backups` folder (`wa.db.crypt15`) and the `Media` folder to your PC.
3. Install [Git](https://git-scm.com/download/win) and [uv](https://docs.astral.sh/uv/). Run `iniciar.bat` (Windows), or by hand:

```powershell
uv sync
uv run wadecrypt <64-hex-key-without-spaces> msgstore.db.crypt15 msgstore.db
uv run wacrypttools --db msgstore.db --media Media --out pendrive
.\criar-pendrive.ps1 -Drive E
```

The old root / ABE / legacy-APK methods are obsolete: since ~2022 WhatsApp offers the 64-digit key and the
crypt15 format is publicly documented.

## Credits and licenses

This project is MIT-licensed. Decryption is done by the excellent
[wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools) by ElDavoo (GPL-3.0, used as an external tool).
See [docs/creditos.md](docs/creditos.md) and [docs/comparacao.md](docs/comparacao.md) for related projects
such as [WhatsApp-Chat-Exporter](https://github.com/KnugiHK/WhatsApp-Chat-Exporter).

## Privacy

Your chats belong to you and to the people you talked to. Never publish your key, your `msgstore.db`, your
`Media` folder or the generated viewer. See [docs/seguranca-e-privacidade.md](docs/seguranca-e-privacidade.md).
All screenshots in this repository use a **100% fictional** demo (`demo/gerar_demo.py`).
