# 1. Preparar o celular

Você vai fazer três coisas neste capítulo — todas com o celular em mãos:

- **(A)** ligar o **backup criptografado com a chave de 64 dígitos** e **guardar a chave**
- **(B)** **exportar os contatos** do celular (garante que os nomes apareçam no visualizador)
- **(C)** **copiar os arquivos** do celular para o computador

> **Atenção:** a chave de 64 dígitos é mostrada **uma única vez**. Se você perdê-la, o backup deixa de ser abrível.
> Tire um **print da tela** (não uma foto do celular com outro aparelho) e anote em papel também.

## A. Ativar o backup com a chave de 64 dígitos

Os nomes dos menus podem mudar um pouco conforme a versão do aplicativo. O caminho costuma ser:

1. Abra o **WhatsApp** (ou **WhatsApp Business**).
2. Toque nos três pontinhos **⋮** → **Configurações**.
3. **Conversas** → **Backup de conversas**.
4. **Backup criptografado de ponta a ponta** → **Ativar** (se já estiver ativo, escolha **Alterar**/**Desativar** e ative de novo).
5. Escolha **"Usar chave de criptografia de 64 dígitos"** (às vezes em **Mais opções**) e toque em **Gerar chave**.
6. A tela **"Sua chave de criptografia"** mostra 64 caracteres em 4 linhas de 4 grupos:

   ```
   1111 2222 3333 4444
   5555 6666 7777 8888
   9999 aaaa bbbb cccc
   dddd eeee ffff 0000        ← exemplo FICTÍCIO
   ```

7. **Tire um print da tela agora** (botões de volume e energia juntos) e **anote a chave em papel**. Só depois toque em **Continuar**.
8. Confirme a criação do backup criptografado.

**Não use** as opções de **senha** nem de **chave de acesso (passkey)**: essas não podem ser abertas por ferramentas externas.

> A chave só tem os caracteres `0-9` e `a-f`. Cuidado: o número **zero (0)** e a letra **O** são diferentes; o mesmo vale para `1` e `l`, `8` e `B`.

## B. Exportar os contatos do celular

Faça isso **antes** de desconectar o celular. Leva menos de 5 minutos e garante que os nomes apareçam no visualizador.

> **Por que fazer agora?** O banco de conversas (`msgstore.db`) guarda só os telefones, não os nomes. Os nomes ficam
> na agenda do celular. No **WhatsApp Business** isso é especialmente importante: o arquivo de contatos do WhatsApp
> (`wa.db`) frequentemente está vazio, e sem a exportação todas as conversas aparecem só com número.

### B.1 Exportar do app Contatos (VCF)

1. Abra o app **Contatos** no Android.
2. Toque em ⋮ (menu) → **Gerenciar contatos** → **Importar/exportar contatos** → **Exportar**.
3. O arquivo (normalmente `contacts.vcf`) é salvo no celular, geralmente em **Downloads** ou na raiz do armazenamento interno.
4. Com o celular conectado ao computador via cabo (modo **Transferência de arquivos**), localize o arquivo no Explorador de Arquivos e copie-o para a **mesma pasta do backup** (onde está o `msgstore.db.crypt15`).

### B.2 Baixar do Google Contatos (CSV)

Se sua agenda está sincronizada com o Google (conta Gmail), faça também:

1. No computador, acesse [contacts.google.com](https://contacts.google.com).
2. Menu ⋮ → **Exportar** → **Google CSV** → **Exportar**.
3. Salve o arquivo na **mesma pasta do backup** (onde está o `msgstore.db.crypt15`).

> Usar as duas fontes juntas é melhor: contatos que estão só no celular aparecem pelo VCF; os que estão só no Google, pelo CSV.

## C. Fazer um backup novo e copiar os arquivos

1. No mesmo menu (**Backup de conversas**), toque em **Fazer backup**. Aguarde terminar. Isso cria um `msgstore.db.crypt15` atualizado.
2. Conecte o celular ao computador com o cabo USB, deslize a barra de notificações e escolha **Transferência de arquivos**.
3. No computador, abra o celular no Explorador de Arquivos → **Armazenamento interno**.
4. Vá para a pasta correspondente ao seu aplicativo:

   | Aplicativo | Pasta |
   |---|---|
   | WhatsApp | `Android\media\com.whatsapp\WhatsApp\` |
   | WhatsApp Business | `Android\media\com.whatsapp.w4b\WhatsApp Business\` |

5. Copie **estas pastas** (inteiras) para uma pasta nova no computador, por exemplo `C:\Backup-WhatsApp`:

   | Pasta/arquivo | Para quê |
   |---|---|
   | `Databases\msgstore.db.crypt15` | **As conversas** (obrigatório) |
   | `Backups\` (contém `wa.db.crypt15`) | **Nomes dos contatos** (recomendado) |
   | `Media\` | Fotos, áudios, vídeos e documentos |

   Se existirem vários arquivos `msgstore-AAAA-MM-DD...crypt15`, o mais recente é o `msgstore.db.crypt15`; os com data
   são backups diários antigos. Arquivos `msgstore-increment-*` são incrementais e não são necessários.

6. **Mostre os arquivos ocultos.** Algumas pastas de `Media` começam com ponto (`.Statuses`) e ficam escondidas.
   No Explorador de Arquivos do Windows: **Exibir → Mostrar → Itens ocultos**. Copie-as também, se existirem.
7. **Copie também a pasta `.Shared`** (se existir). No **WhatsApp Business**, ela fica na raiz do aplicativo, **fora** de `Media`:

   ```
   Android\media\com.whatsapp.w4b\WhatsApp Business\.Shared\
   ```

   Copie-a para **dentro** da pasta `Media` no computador:

   ```
   C:\Backup-WhatsApp\Media\.Shared\
   ```

   > **Por quê?** O banco de dados registra esses arquivos com caminho `.Shared/...` relativo à pasta `Media`.
   > Se a pasta não estiver lá, o gerador lista esses arquivos como "pasta oculta ausente" no relatório.

8. A cópia da pasta `Media` pode levar muito tempo (são milhares de arquivos). Deixe o celular conectado e desbloqueado.

### Como saber se a cópia veio completa

Compare o número de arquivos e o tamanho da pasta `Media` no celular e no computador (botão direito → **Propriedades**).
Se forem diferentes, copie de novo.

## D. Se o seu celular não mostra a pasta `Android/media`

Em alguns celulares a pasta fica em `Android/media` apenas depois de abrir pelo aplicativo **Arquivos** do próprio
fabricante. Se mesmo assim a pasta `Databases` não aparecer, confirme que o backup foi criado (passo C.1) e que o backup
criptografado está ativo. Veja [Problemas comuns](09-problemas-comuns.md).

## Checklist antes de seguir

- [ ] Tenho a chave de 64 dígitos (print e anotação em papel)
- [ ] Tenho `msgstore.db.crypt15` no computador
- [ ] Tenho a pasta `Backups` (com `wa.db.crypt15`), se possível
- [ ] Tenho a pasta `Media`, incluindo pastas ocultas (`.Statuses`)
- [ ] Se for WhatsApp Business: copiei `.Shared` para dentro de `Media` no computador
- [ ] Exportei os contatos do celular como `.vcf` (app Contatos)
- [ ] Baixei os contatos do Google como CSV (contacts.google.com) — se usar Google

Próximo: [2. Instalar no computador](02-instalar-no-computador.md)
