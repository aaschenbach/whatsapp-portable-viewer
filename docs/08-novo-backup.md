# 8. Fazer de novo com um backup novo

Quando quiser atualizar o pendrive com conversas mais recentes:

1. **Celular:** abra *Backup de conversas* e toque em **Fazer backup** (capítulo 1, parte B). Se você **mudou a chave**, anote a nova.
2. **Computador:** copie o novo `msgstore.db.crypt15` (e `Backups\wa.db.crypt15`) por cima dos antigos. Da pasta `Media`, copie só
   o que for novo (o Windows pergunta se quer substituir ou ignorar os iguais).
3. **Rode o assistente** (`iniciar.bat`) de novo. Se o arquivo `encrypted_backup.key` ainda estiver na pasta, ele pergunta se pode
   reaproveitá-lo; responda **S**.
4. No pendrive, o assistente **substitui `data/`** (conversas novas) e **completa `Media/`**, conferindo tudo por hash.

## Pelo método manual

```powershell
uv run wadecrypt -y encrypted_backup.key msgstore.db.crypt15 msgstore.db
uv run wadecrypt -y encrypted_backup.key wa.db.crypt15 wa.db
uv run wacrypttools --db msgstore.db --media Media --out pendrive --contacts wa.db
.\criar-pendrive.ps1 -Drive E
```

## Dicas

- **Guarde a chave** (print e papel) e o `encrypted_backup.key`. Eles servem para todos os backups futuros enquanto você não trocar a chave.
- **Atualize o `wa-crypt-tools`** se o WhatsApp mudar o formato e o backup novo não abrir:

  ```powershell
  uv lock --upgrade-package wa-crypt-tools
  uv sync
  ```

  A página do projeto informa as versões do WhatsApp testadas.
- **Compare o relatório** (`pendrive\relatorio.txt`) do backup anterior com o novo: o número de mensagens deve ter aumentado.
- **Backups antigos:** mantenha uma cópia do `msgstore.db.crypt15` de cada data importante. O arquivo criptografado é o seu "original".

Próximo: [9. Problemas comuns](09-problemas-comuns.md)
