# 2. Instalar no computador

Você só faz isto **uma vez**. É preciso internet.

## Windows (caminho fácil)

1. **Baixe o projeto.** Na página do repositório no GitHub, clique em **Code → Download ZIP**. Extraia o ZIP em uma pasta
   simples, **sem espaços nem acentos no caminho**, por exemplo `C:\WhatsAppViewer`.
   (Se você usa Git: `git clone <endereço-do-repositório>`.)
2. **Instale o Git** (necessário para que o `uv` baixe o `wa-crypt-tools` do GitHub). O instalador está em
   [git-scm.com/download/win](https://git-scm.com/download/win). Use as opções padrão. Para verificar: abra o PowerShell
   e execute `git --version`.
3. **Instale o `uv`** (ele instala o Python sozinho). Abra o menu Iniciar, digite **PowerShell**, abra e cole:

   ```powershell
   winget install --id=astral-sh.uv -e
   ```

   Feche e abra o PowerShell de novo depois de instalar. Teste com `uv --version` (deve mostrar um número).

   > O assistente `iniciar.bat` também oferece instalar o `uv` para você.
4. **(Opcional) Instale o Tesseract**, só se for ler a chave de um print:

   ```powershell
   winget install --id=UB-Mannheim.TesseractOCR -e
   ```

5. Dentro da pasta do projeto, dê **duplo clique em `iniciar.bat`** (veja o [capítulo 3](03-chave-e-descriptografia.md)).
   Na primeira vez ele baixa o Python e as bibliotecas (alguns minutos).

### Se o Windows bloquear o `iniciar.bat`

Aparece "O Windows protegeu o computador" (SmartScreen) quando o arquivo vem da internet. Clique em **Mais informações →
Executar assim mesmo**. O código é aberto: você pode ler `iniciar.ps1` antes. Ele não envia nada para a internet.

## Preparar manualmente (qualquer sistema)

```powershell
cd C:\WhatsAppViewer
uv sync
```

Isso cria um ambiente isolado com tudo o que é preciso. O principal é o
**[wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools)** (GPL-3.0), de ElDavoo, que fornece os comandos
`wadecrypt`, `wacreatekey` e `wainfo`. Ele é baixado diretamente do GitHub pelo `uv` (conforme declarado em
`pyproject.toml`) — **é necessário ter internet nessa etapa**. Para conferir:

```powershell
uv run wadecrypt --help
uv run wacrypttools --help
```

### macOS / Linux

Instale o `uv` (`curl -LsSf https://astral.sh/uv/install.sh | sh`), rode `uv sync` e use os comandos dos capítulos
seguintes (troque `\` por `/`). O assistente `iniciar.bat` e o `criar-pendrive.ps1` são para Windows; no macOS/Linux
copie as pastas manualmente, mantendo `index.html`, `style.css`, `app.js`, `data/` e `Media/` lado a lado, e confira com
`diff -r` ou `rsync --checksum`.

## Problemas na instalação

| Mensagem | O que fazer |
|---|---|
| `uv não é reconhecido como comando` | Feche e abra o PowerShell; se persistir, reinstale o `uv` |
| `winget não é reconhecido` | Atualize o Windows ou instale o `uv` pelo site oficial (docs.astral.sh/uv) |
| `git não é reconhecido` / `error: could not find git` | Instale o Git (git-scm.com/download/win) e reabra o PowerShell |
| Falha ao baixar pacotes | Verifique a internet/antivírus/proxy e tente de novo |
| `failed to open file README.md` | A pasta do projeto está incompleta: baixe o ZIP inteiro de novo |

Próximo: [3. Chave e descriptografia](03-chave-e-descriptografia.md)
