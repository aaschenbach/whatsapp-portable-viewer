# 0. Visão geral

## O que este projeto faz

```
 CELULAR                    COMPUTADOR                                         PENDRIVE
 ─────────                  ──────────                                         ────────
 Backup criptografado  ──►  1. descriptografa (chave de 64 dígitos)       ──►  index.html
 (msgstore.db.crypt15)      2. lê o banco de dados (SQLite)                    data/  (conversas)
 + pasta Media              3. liga cada mensagem ao seu arquivo de mídia      Media/ (fotos, áudios...)
 + wa.db (contatos)         4. gera páginas HTML/JS estáticas                  confere tudo por hash
```

O resultado é uma pasta de arquivos comuns. **Não há servidor, não há programa para instalar e não precisa de
internet** para abrir. Qualquer navegador moderno (Chrome, Edge, Firefox) funciona.

## O que você precisa

| Item | Detalhe |
|---|---|
| Celular Android | com o WhatsApp ou WhatsApp Business que você quer salvar |
| Cabo USB | para copiar os arquivos do celular para o computador |
| Computador Windows 10/11 | o assistente `iniciar.bat` é para Windows (veja os capítulos para macOS/Linux) |
| Internet | só na instalação (para baixar o Python e as ferramentas) |
| Pendrive | **8 GB ou mais**, de boa procedência, em exFAT (veja o [capítulo 6](06-montar-o-pendrive.md)) |
| Espaço no computador | cerca de 3 vezes o tamanho da pasta `Media` |

## Quanto tempo leva

| Etapa | Tempo típico |
|---|---|
| Preparar o celular e copiar os arquivos | 15 a 40 min (depende do tamanho de `Media`) |
| Instalar no computador (uma vez) | 5 a 10 min |
| Descriptografar e gerar | 1 a 3 min |
| Copiar e conferir o pendrive (1,6 GB) | 8 a 15 min |

## O que NÃO dá para fazer

- **Sem a chave de 64 dígitos não existe como abrir o backup.** Nem o WhatsApp consegue.
- Backups protegidos só por **senha** ou por **chave de acesso (passkey)** não podem ser abertos por estas ferramentas.
  Use a opção da **chave de 64 dígitos**.
- Mídias que **nunca foram baixadas no celular** não existem no backup (o visualizador mostra um aviso nelas).
- Este projeto **não envia mensagens**: é somente leitura.
- iPhone não é coberto aqui (o formato do backup é outro).

## Dois caminhos

- **Caminho fácil:** [capítulos 1 e 2](01-preparar-o-celular.md) e depois o **assistente `iniciar.bat`**. Ele faz os
  capítulos 3 a 6 sozinho, explicando cada passo.
- **Caminho manual:** siga os capítulos em ordem. Útil se algo der errado ou se você usa macOS/Linux.

Próximo: [1. Preparar o celular](01-preparar-o-celular.md)
