# Comparação com outras ferramentas

Este projeto não substitui as ferramentas abaixo: cada uma tem um objetivo diferente, e muitas se complementam.
Escolha conforme a sua necessidade — ou use mais de uma.

## Visão geral

| | **WhatsApp Backup Viewer** (este) | **whatsapp-backup-tools** | **WhatsApp-Chat-Exporter** | **DB Browser for SQLite** | **wa-crypt-tools** |
|---|---|---|---|---|---|
| O que faz | Gera um **visualizador offline** para pendrive, com busca | Organiza a mídia em pastas + **WebUI local** com busca | Exporta conversas para **HTML/JSON** (e outros formatos) | Abre o banco de dados e permite consultas **SQL** | **Descriptografa** `.crypt12/14/15` (e recriptografa) |
| Descriptografa? | Usa o wa-crypt-tools | Não (precisa do banco já aberto) | Sim (crypt12/14/15, com extras opcionais) | Não | **Sim** (é a função dele) |
| iOS | Não | **Sim** | **Sim** | Só se você já tiver o banco | Não |
| Entrega | Uma pasta pronta (`index.html` + `data` + `Media`), portátil | WebUI local + pastas organizadas por contato/ano | Arquivos HTML/JSON por conversa | Visão de tabelas | O arquivo `.db` |
| Busca amigável | Sim (nome, telefone, texto, data) | Sim (full-text na WebUI) | Depende do modelo HTML | Só via SQL | Não |
| Verifica a cópia no pendrive | **Sim, por SHA-256** | Não (objetivo diferente) | Não | Não | Não |
| Relatório de mídias ausentes | Sim, com motivos por arquivo | CSV de auditoria para duplicatas/ausentes | Não | Não | Não |
| Processamento incremental | Não | **Sim** (detecta renomeações de contatos) | Não | Não | Não |
| Chamadas e enquetes | Sim | Não renderizados | Parcial | Via SQL | Não |
| Anúncios (Click-to-WhatsApp) | Sim | Não documentado | Não | Via SQL | Não |
| Licença | MIT | GPL-3.0 | MIT | GPL/MPL | GPL-3.0 |

## Quando usar cada uma

- **Quero guardar tudo em um pendrive e abrir em qualquer computador, sem instalar nada:** este projeto.
- **Quero uma WebUI local bem polida, com a mídia organizada por contato e por ano, e meu backup é do Android ou do iPhone:**
  [whatsapp-backup-tools](https://github.com/auanasgheps/whatsapp-backup-tools) (disponível também no PyPI:
  `pip install whatsapp-backup-tools`). Projeto muito bem feito, com mais de 570 testes, suporte a iOS e
  processamento incremental sofisticado — incluindo detecção automática de renomeações de contatos entre execuções.
  Recomendado especialmente para quem usa iPhone ou quer a mídia organizada em pastas.
- **Preciso de um arquivo HTML/JSON por conversa, para arquivar ou processar:** [WhatsApp-Chat-Exporter](https://github.com/KnugiHK/WhatsApp-Chat-Exporter).
  Suporta iPhone, tem muitas opções de exportação e uma comunidade ativa.
- **Quero fazer consultas SQL no banco:** [DB Browser for SQLite](https://sqlitebrowser.org).
- **Só quero descriptografar:** [wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools) (inclusive com janela gráfica, `wagui`).
  É a ferramenta de referência para o formato `.crypt15` — este projeto a usa como dependência.
- **Análise forense completa:** o autor do wa-crypt-tools sugere o projeto [whapa](https://github.com/B16f00t/whapa).

## E se eu tiver dois backups de períodos diferentes?

Se você trocou de celular ou quer consolidar backups de datas distintas em um único banco, o projeto
[whatsapp-database-merger](https://github.com/natario1/whatsapp-database-merger) implementa uma abordagem elegante:
remapeia as primary keys de cada banco e atualiza todas as referências em cascata antes de mesclar.
Vale conhecer a ideia. Atenção: o projeto não é atualizado desde 2022 e o esquema do WhatsApp mudou
bastante desde então — teste com cuidado e mantenha cópias dos originais.

## Dá para combinar

O banco `msgstore.db` que você descriptografa aqui serve também para o `whatsapp-backup-tools`,
o `WhatsApp-Chat-Exporter` e o `DB Browser`. Nada impede de gerar o pendrive com este projeto
**e** ao mesmo tempo organizar a mídia em pastas com o `whatsapp-backup-tools` ou exportar
HTML/JSON com o outro.
