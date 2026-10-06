# 3. Chave e descriptografia

Aqui o backup criptografado (`msgstore.db.crypt15`) vira um banco de dados comum (`msgstore.db`).

## Caminho fácil: o assistente

Dê duplo clique em **`iniciar.bat`**. Ele:

1. localiza `msgstore.db.crypt15`, `wa.db.crypt15` e a pasta `Media` dentro da pasta que você indicar;
2. pede a chave (digitada ou lida de um print) e confere se ela tem 64 caracteres válidos;
3. descriptografa e mostra quantas mensagens existem no banco.

Se a chave tiver 1 ou 2 caracteres errados, a ferramenta tenta corrigir sozinha e avisa.

## Caminho manual

### 3.1 Informar a chave

A chave são 64 caracteres (`0-9` e `a-f`). Há três formas de usá-la:

**a) Digitar a chave direto** (sem espaços, em uma linha):

```powershell
uv run wadecrypt 1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff msgstore.db.crypt15 msgstore.db
```

> A chave acima é só um **exemplo**. Use a sua, **sem espaços**. Se você copiou "1111 2222 3333 …" com espaços, junte tudo.

**b) Criar um arquivo de chave** (recomendado: você guarda o arquivo e não precisa digitar de novo). Aqui os espaços podem ficar:

```powershell
uv run wacreatekey --hex "1111 2222 3333 4444 5555 6666 7777 8888 9999 aaaa bbbb cccc dddd eeee ffff 0000"
uv run wadecrypt encrypted_backup.key msgstore.db.crypt15 msgstore.db
```

Isso cria `encrypted_backup.key`. Guarde esse arquivo em local seguro (**fora do pendrive**).

**c) Ler a chave de um print da tela** (precisa do Tesseract, veja o [capítulo 2](02-instalar-no-computador.md)):

```powershell
uv run wadecrypt "C:\Users\voce\Downloads\print_da_chave.png" msgstore.db.crypt15 msgstore.db
```

- Use o **print original**. Uma **foto da tela** tirada com outro celular (inclinada, com reflexo) **não é lida**: nesse caso a
  ferramenta avisa "could not read all of them" e você digita a chave.
- Recortar o print só na área da chave ajuda.

### 3.2 Conferir o resultado

```powershell
uv run python -c "import sqlite3; c=sqlite3.connect('file:msgstore.db?mode=ro',uri=True); print(c.execute('select count(*) from message').fetchone()[0], 'mensagens')"
```

Deve mostrar o número de mensagens (por exemplo `75149 mensagens`). O arquivo `msgstore.db` costuma ter dezenas de MB.

### 3.3 Descriptografar os contatos (não pule este passo)

Descriptografe também o `wa.db.crypt15` que você copiou da pasta `Backups` — ele contém os nomes dos contatos.
Use a **mesma chave**:

```powershell
uv run wadecrypt encrypted_backup.key wa.db.crypt15 wa.db
```

> **WhatsApp Business:** o `wa.db` do WA Business costuma estar vazio. Mesmo assim descriptografe-o — e use
> também o `.vcf` e o CSV que você exportou no capítulo 1. O [capítulo 4](04-nomes-dos-contatos.md) explica como combinar as fontes.

## Opções úteis do `wadecrypt`

| Opção | Efeito |
|---|---|
| `-y` | Sobrescreve o arquivo de saída se ele já existir (por padrão a ferramenta se recusa) |
| `-v` | Mostra detalhes (útil para pedir ajuda) |
| `-f` | Grava a saída mesmo se a verificação falhar (**não recomendado**: o resultado pode estar corrompido) |

## Erros comuns

| O que aparece | Significado | Solução |
|---|---|---|
| `Authentication tag mismatch: MAC check failed` | Chave errada, ou arquivo `.crypt15` incompleto/corrompido | Reconfira a chave (O/0, l/1, B/8) e copie o `.crypt15` de novo do celular |
| `The key file specified does not exist, and it is not a valid key either … 79 characters` | Você digitou a chave com espaços no `wadecrypt` | Junte os 64 caracteres, ou use `wacreatekey` |
| `Could not read the key from the screenshot` | O print está pequeno, borrado ou é uma foto da tela | Use o print original, ou digite a chave |
| `output file already exists` | O `msgstore.db` já existe | Acrescente `-y` |
| A ferramenta "demorou" e depois funcionou | Ela corrigiu 1 ou 2 caracteres errados da chave | Anote a chave certa do celular (veja o aviso do assistente) |

> **Backup antigo (`crypt14`) ou de WhatsApp muito novo?** Use `uv run wainfo msgstore.db.crypt15` para ver o formato e a
> versão do WhatsApp que gerou o arquivo. O projeto `wa-crypt-tools` é atualizado quando o WhatsApp muda o formato.

Próximo: [4. Nomes dos contatos](04-nomes-dos-contatos.md)
