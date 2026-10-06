# Demonstração (dados 100% fictícios)

Nada aqui vem de conversas reais. O gerador cria um banco SQLite sintético, mídias falsas e uma lista de contatos fictícia
para testar o fluxo, produzir as capturas de tela do guia e rodar os testes.

```powershell
uv run python demo/gerar_demo.py                       # cria demo/saida/
uv run wacrypttools --db demo/saida/msgstore.db --media demo/saida/Media `
    --out demo/saida/pendrive --contacts demo/saida/contatos.csv --copy-media
start demo/saida/pendrive/index.html
```

A demonstração cobre: conversa iniciada por anúncio, resposta citada, foto, áudio, figurinha, documento, mensagem apagada e
editada, localização, chamada, enquete, grupo, contato sem telefone e os casos de vínculo de mídia (nome com apóstrofo trocado,
documento sem extensão, arquivo achado pelo conteúdo, mídia ausente e mídia nunca baixada).

`node demo/capturar.mjs` regenera as imagens de `docs/img/` (precisa de Node 22+ e Google Chrome).
