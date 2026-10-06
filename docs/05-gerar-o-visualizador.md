# 5. Gerar o visualizador

## Comando

```powershell
uv run wacrypttools --db msgstore.db --media Media --out pendrive --contacts wa.db contatos.vcf contatos.csv
```

(O assistente `iniciar.bat` roda isto por você e passa os contatos automaticamente.)

> Substitua `contatos.vcf` e `contatos.csv` pelos nomes reais dos seus arquivos. Se não tiver um deles, omita-o.
> Coloque os arquivos de contatos na mesma pasta do `msgstore.db` antes de rodar.

| Opção | Para quê |
|---|---|
| `--db` | O banco descriptografado (`msgstore.db`) |
| `--media` | A pasta `Media` (ou a pasta que a contém). Serve para ligar cada mensagem ao seu arquivo e conferir o que falta |
| `--out` | Pasta de saída (padrão `pendrive`); o conteúdo antigo de `data` é recriado |
| `--contacts` | Fontes de nomes de contatos (`wa.db`, `.vcf`, `.csv`), veja o [capítulo 4](04-nomes-dos-contatos.md) |
| `--copy-media` | Copia a pasta `Media` para dentro da saída |
| `--strict` | Termina com erro (código 2) se alguma mídia ficar sem arquivo |

## O que sai na pasta `pendrive`

```
pendrive\
  index.html  style.css  app.js     o visualizador
  data\                             as conversas (um arquivo por conversa) + índice de busca
  relatorio.txt                     resumo do que foi feito
  midias_ausentes.csv               só existe se alguma mídia ficou sem arquivo
```

A pasta `Media` **não** é copiada para cá por padrão (ela pode ter vários GB); o próximo passo a coloca no pendrive.

## Lendo o `relatorio.txt`

```
Conversas: 1614
Mensagens exibidas: 75085
Mensagens ocultas (tipos internos sem conteúdo): 61
Conversas individuais com nome de contato: 1200 de 1645
Mensagens com mídia: 6273
  com arquivo vinculado: 5814
  SEM arquivo: 459
```

- **Mensagens ocultas** são registros internos do WhatsApp sem conteúdo para mostrar (por exemplo, "álbum" ou configuração).
- **Com arquivo vinculado:** a mensagem foi ligada a um arquivo real da pasta `Media`.
- **SEM arquivo:** a mensagem existe, mas não há arquivo correspondente. Aparece no visualizador como cartão
  "Arquivo não disponível neste backup".

### Como o programa procura cada mídia

Para cada mensagem com mídia, em ordem, até achar:

1. **Caminho exato** gravado no banco.
2. **Nome normalizado:** o celular troca caracteres como `'` por `_` ao copiar (`Relatório d'Água.pdf` → `Relatório d_Água.pdf`).
3. **Sem extensão:** o banco guarda `DOC-20260101-WA0001` e o arquivo é `DOC-20260101-WA0001.pdf`.
4. **Extensão diferente** (com o mesmo tamanho).
5. **Conteúdo idêntico:** o banco guarda o tamanho e o SHA-256 do arquivo; o programa acha o mesmo conteúdo, mesmo com outro nome ou pasta.
6. **Documentos sem caminho:** pelo nome original do documento.

O relatório lista tudo o que foi corrigido por cada método e o que **continua sem arquivo**, com o **motivo**.

### Motivos de mídia sem arquivo

| Motivo no relatório | O que significa | O que fazer |
|---|---|---|
| *sem caminho no banco e nenhum arquivo com o mesmo conteúdo* | A mídia **nunca foi baixada** no celular (comum em documentos de clientes, ou enviada por outro aparelho) | Nada: não há arquivo para recuperar |
| *pasta oculta '.Statuses' / '.Shared' ausente na cópia* | As pastas ocultas não foram copiadas | Mostre arquivos ocultos no celular/PC e copie-as |
| *arquivo não está na pasta Media* | Foi apagado do celular, ou ficou fora da cópia | Confira a cópia da pasta `Media`; se foi apagado, não há como recuperar |

A lista completa (conversa, data, tipo, arquivo, tamanho, motivo) está em `midias_ausentes.csv`, que abre no Excel.

## Anúncios

Conversas iniciadas por anúncio (Click-to-WhatsApp) mostram um **cartão** no início, com título, texto, miniatura e o link
da campanha (abrir o link exige internet). Isso ajuda a saber de qual campanha o contato veio.

## Testar sem expor seus dados

Para experimentar o processo com dados 100% fictícios:

```powershell
uv run python demo/gerar_demo.py
uv run wacrypttools --db demo/saida/msgstore.db --media demo/saida/Media --out demo/saida/pendrive --contacts demo/saida/contatos.csv --copy-media
```

Depois abra `demo/saida/pendrive/index.html`.

Próximo: [6. Montar o pendrive](06-montar-o-pendrive.md)
