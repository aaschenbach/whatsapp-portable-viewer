# 4. Nomes dos contatos

## Por que preparar os contatos antes

O banco de conversas (`msgstore.db`) guarda **telefones** e nomes de grupos, mas **não os nomes dos seus contatos**.
Sem uma fonte de nomes, o visualizador mostra `+55 (11) 99999-8888` em vez de "Maria Silva".

**Recomendação: traga as três fontes.** O gerador combina tudo automaticamente e usa o melhor nome disponível para cada contato.

| Fonte | O que é | Quando ajuda mais |
|---|---|---|
| `wa.db` | Banco interno do WhatsApp | WhatsApp pessoal (no WA Business costuma estar vazio) |
| `.vcf` | Agenda exportada do celular | Contatos que estão só no celular |
| CSV Google | Agenda exportada do Google | Contatos sincronizados com o Gmail |

> **WhatsApp Business:** o `wa.db` quase sempre está vazio. Se você usar só ele, o gerador mostrará
> `Contatos carregados: 0` e todos ficam com número. **Traga obrigatoriamente o `.vcf` ou o CSV.**

## O que fazer (já explicado no capítulo 1)

Se você seguiu o capítulo 1, já tem tudo:

- **`wa.db.crypt15`** — copiado da pasta `Backups` do celular
- **`.vcf`** — exportado do app Contatos
- **CSV** — baixado de contacts.google.com

Se pulou algum, volte ao [capítulo 1, seção B](01-preparar-o-celular.md#b-exportar-os-contatos-do-celular) e faça agora.

## Como o assistente usa os contatos

O `iniciar.bat` encontra automaticamente na pasta do backup:

- `wa.db` (descriptografa e usa)
- qualquer arquivo `*.vcf`
- qualquer arquivo CSV cujo nome comece com `contatos` ou `contacts` (ex: `contacts.csv` do Google, `contatos.csv`)

Você não precisa fazer nada além de deixar os arquivos na pasta certa.

## Modo manual

```powershell
uv run wacrypttools --db msgstore.db --media Media --out pendrive --contacts wa.db contatos.vcf contatos.csv
```

Pode listar quantas fontes quiser. Se não usar `--contacts` e existir um `wa.db` ao lado do `msgstore.db`, ele é usado sozinho.

## Como o programa casa telefone e nome

- Compara o número completo com o código do país.
- No Brasil, tolera o **nono dígito**: `+55 11 98888-7777` e `+55 11 8888-7777` são o mesmo contato.
- Números sem código do país (10 ou 11 dígitos) são assumidos como brasileiros (`+55`).
- Contatos que o WhatsApp esconde com identificador interno (`@lid`) aparecem como **"Contato LID …1234"** se o banco não tiver o telefone — isso não tem solução pelo `.vcf`.

No fim da geração, o relatório informa **quantas conversas individuais ganharam nome** (`relatorio.txt`).

## Privacidade

Listas de contatos têm dados pessoais de terceiros. Não as publique nem as envie por e-mail sem cuidado. Os arquivos `wa.db`,
`*.vcf` e `contatos*.csv` já estão no `.gitignore`.

Próximo: [5. Gerar o visualizador](05-gerar-o-visualizador.md)
