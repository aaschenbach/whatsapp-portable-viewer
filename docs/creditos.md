# Créditos e licenças

## Ferramentas que tornam isto possível

- **[wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools)**, de **ElDavoo** e colaboradores (licença **GPL-3.0**).
  Faz toda a parte de criptografia: `wadecrypt`, `wacreatekey`, `wainfo`, leitura da chave por imagem (OCR) e correção de
  dígitos errados. Este projeto o usa **como ferramenta externa** (instalada pelo `uv` direto do repositório) e **não
  contém código dele**. Se você ficou com dúvida sobre o formato dos backups, a documentação do projeto é a melhor referência.
- **[WhatsApp-Chat-Exporter](https://github.com/KnugiHK/WhatsApp-Chat-Exporter)**, de **KnugiHK** (licença **MIT**): inspiração e
  alternativa; a documentação dele sobre `wa.db` e exportação de contatos em vCard ajudou a orientar o capítulo de contatos.
- **[uv](https://docs.astral.sh/uv/)** (Astral): gerenciador de Python e dependências.
- **Pillow**, **pytest**, **ruff**: ferramentas de desenvolvimento e da demonstração.

## Discussão que motivou este guia

A comunidade do Reddit [r/DataHoarder](https://www.reddit.com/r/DataHoarder/comments/a7c0yq/full_whatsapp_chat_export_40000_messages/?tl=pt-br)
registrou que os métodos antigos (root, "ABE", APK legado, `wav_create_table`) estão obsoletos desde que o WhatsApp passou a oferecer a
**chave de criptografia de 64 dígitos** e o formato `crypt15` ficou documentado. O texto desta documentação é original; a discussão é apenas
citada como referência.

## Licença deste projeto

[MIT](../LICENSE). Você pode usar, copiar, modificar e distribuir, mantendo o aviso de copyright.

## Aviso

Este projeto **não é afiliado** ao WhatsApp nem à Meta. "WhatsApp" é marca registrada de seus titulares. O software é fornecido
"como está", sem garantias; **mantenha sempre uma cópia do backup criptografado e da chave**.
