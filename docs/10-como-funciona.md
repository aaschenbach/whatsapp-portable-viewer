# 10. Como funciona por dentro

Para quem quer entender, auditar ou contribuir.

## Visão do fluxo

```
msgstore.db.crypt15 ──(wa-crypt-tools: wadecrypt)──► msgstore.db (SQLite)
                                                        │
wa.db / .vcf / .csv ──► nomes                           │  src/wacrypttools/builder.py
Media/ ──► vínculo de mídia ────────────────────────────┘
                                                        ▼
                    pendrive/  index.html  style.css  app.js
                               data/chats.js   (lista de conversas + metadados)
                               data/chat_<id>.js (mensagens de cada conversa)
                               data/fulltext.js  (índice de busca; carregado sob demanda)
                               data/thumbs/*.jpg (miniaturas de anúncios)
                               relatorio.txt  midias_ausentes.csv
```

## Por que arquivos `.js` e não ler o `.db` no navegador

Páginas abertas por duplo clique (`file://`) não podem fazer `fetch` de outros arquivos nem carregar WASM de um disco local.
Já `<script src>` e `<img src>` relativos funcionam. Por isso o conversor transforma os dados em arquivos `.js` e o
visualizador os carrega injetando tags `<script>`. Resultado: **nenhum servidor**.

## Tabelas do WhatsApp usadas

| Tabela | Uso |
|---|---|
| `chat`, `jid`, `jid_map` | Conversas, telefones e a ligação entre identificadores `@lid` e telefones |
| `message` | Mensagens (`timestamp` em milissegundos, `message_type`) |
| `message_media` | Caminho, tipo, nome, tamanho e **hash SHA-256** de cada mídia |
| `message_quoted`, `message_quoted_media` | Respostas e a mídia citada |
| `message_location`, `message_vcard` | Localizações e contatos compartilhados |
| `message_revoked`, `message_edit_info` | Mensagens apagadas e editadas |
| `message_call_log`, `call_log` | Chamadas |
| `message_poll_option` | Opções de enquetes |
| `message_external_ad_content` | Anúncios que originaram a conversa (título, texto, link, miniatura) |

O esquema muda entre versões do WhatsApp; o conversor consulta só o que precisa.

## Tipos de mensagem (`message_type`)

| Código | Significado | Código | Significado |
|---|---|---|---|
| 0 | texto | 15 | apagada |
| 1 | imagem | 20 | figurinha |
| 2 | áudio/nota de voz | 55 | anúncio (cartão) |
| 3 | vídeo | 90 | chamada |
| 4 | contato | 7, 36 | avisos do sistema |
| 5 | localização | 11, 99 | internos, ocultados |
| 9 | documento | 13 | GIF |

## Vínculo de mídia (`MediaResolver`)

Para cada mídia o conversor tenta, em ordem: caminho exato → nome normalizado (apóstrofos/acentos) → sem extensão → extensão
diferente → **SHA-256 + tamanho** → nome do documento. A busca por conteúdo calcula o hash só dos arquivos com o mesmo
tamanho. Veja os testes em `tests/test_builder.py`.

## Formato dos dados (`data/chat_<id>.js`)

`window.__chat(<id>, [ {...}, ... ])`, com campos curtos por mensagem:

| Campo | Significado | Campo | Significado |
|---|---|---|---|
| `i` | id | `f` | caminho do arquivo (relativo) |
| `m` | enviada por mim (0/1) | `nf` | arquivo não disponível |
| `t` | horário (ms) | `n`, `mt`, `sz` | nome, tipo MIME, tamanho |
| `y` | tipo (`t`,`i`,`a`,`v`,`d`,`s`,`g`,`l`,`c`,`k`,`p`,`x`,`del`) | `q` | mensagem citada |
| `x` | texto/legenda | `ad` | dados do anúncio |
| `s` | remetente (grupos) | `e`, `st` | editada, favorita |

## Verificação da cópia

`criar-pendrive.ps1` copia com `robocopy` e depois calcula o SHA-256 de **cada arquivo** na origem e no destino. Diferenças são
recopiadas uma vez; se persistirem, o script falha (código 2). O `robocopy` sozinho pula arquivos "iguais" por tamanho e data
e **não detecta** corrupção silenciosa, por isso a verificação é separada.

## Segurança do código

- O banco é aberto em modo **somente leitura** (`mode=ro`).
- Todo texto vindo do banco entra na página por `textContent`/nós de texto, nunca por `innerHTML` (sem injeção de HTML).
- Links externos usam `rel="noopener noreferrer"`.

## Desenvolvimento

```powershell
uv sync
uv run pytest -q
uv run ruff check .
node --check src/wacrypttools/web/app.js
uv run python demo/gerar_demo.py     # dados fictícios para testar
node demo/capturar.mjs                # regenera as capturas de tela (Chrome)
```
