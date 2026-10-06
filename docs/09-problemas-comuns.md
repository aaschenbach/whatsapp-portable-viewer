# 9. Problemas comuns

Comece pelo **registro** do assistente: a pasta `logs\` guarda o que aconteceu em cada execução (sem a sua chave).

## Celular e cópia dos arquivos

| Sintoma | Causa provável | Solução |
|---|---|---|
| Não acho `msgstore.db.crypt15` | O backup não foi feito, ou o criptografado não está ativo | Faça um backup novo (capítulo 1); confira a pasta `Android\media\com.whatsapp(.w4b)\...\Databases` |
| Só vejo `msgstore.db.crypt14` | Backup antigo | O `wa-crypt-tools` abre `crypt14`, mas precisa do arquivo `key` do celular; o mais simples é ativar o backup criptografado e gerar um `crypt15` |
| A pasta `Android` não abre | Restrição do Android | Use o cabo com *Transferência de arquivos*; veja a seção C do capítulo 1 |
| A pasta `Media` copiou pela metade | Cabo/celular bloqueado | Copie de novo; deixe a tela desbloqueada |

## Instalação

Veja a tabela do [capítulo 2](02-instalar-no-computador.md).

| Sintoma | Causa provável | Solução |
|---|---|---|
| `git nao esta instalado` / `error: could not find git` | Git não instalado | Instale em git-scm.com/download/win e reabra o assistente |
| `uv sync` falha com mensagem sobre "github.com" | Sem internet ou Git ausente | Verifique a conexão; confirme que `git --version` funciona |

## Chave e descriptografia

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Tem N caracteres (precisa ter 64)` | Faltou ou sobrou algum caractere | Confira a chave grupo por grupo (16 grupos de 4) |
| `Caracteres inválidos: O` | Letra **O** no lugar do número **zero** (ou `l` no lugar de `1`) | Troque; a chave só tem `0-9` e `a-f` |
| `Authentication tag mismatch: MAC check failed` | Chave errada **ou** arquivo incompleto | Reconfira a chave; copie o `.crypt15` de novo |
| `A chave digitada tinha 1 ou 2 caracteres errados` | A ferramenta corrigiu sozinha | Compare com o celular e guarde a chave certa |
| `could not read all of them` (print) | O print não é legível (foto, pequeno, borrado) | Use o print original ou digite a chave |
| `Reading the key from the screenshot` fica parado | OCR leva alguns segundos | Aguarde; sem Tesseract instalado, o aviso pede para instalar |
| Esqueci a chave | — | **Não há como recuperar.** Nem o WhatsApp consegue. Ative um novo backup criptografado no celular e gere nova chave |

## Visualizador

| Sintoma | Causa | Solução |
|---|---|---|
| Todas as conversas só com telefone | Sem `wa.db`/lista de contatos, ou `wa.db` vazio (comum no WA Business) | Exporte os contatos do celular em `.vcf` ou CSV e use `--contacts`; veja o [capítulo 4](04-nomes-dos-contatos.md) |
| `Contatos carregados: 0 chaves de 1 fonte(s)` no relatório | `wa.db` existe mas está vazio — frequente no WhatsApp Business | Mesma solução acima: use `.vcf` ou CSV do Google Contatos |
| "Contato LID …1234" | O WhatsApp esconde o telefone desse contato | Fica assim se o banco não tiver o telefone; um `.vcf` não resolve esse caso |
| "Arquivo não disponível neste backup" | A mídia nunca foi baixada ou foi apagada | Consulte `midias_ausentes.csv` e o [capítulo 5](05-gerar-o-visualizador.md) |
| Foto/áudio não carrega, mas o arquivo existe | `Media` não está ao lado de `index.html` | Mantenha `index.html` e `Media` na mesma pasta |
| Áudio aparece mas não toca (erro ao carregar) | Versão antiga do visualizador — antes da correção, áudios da pasta `.Shared` não eram acessíveis pelo Chrome | Regere o visualizador com `uv run wacrypttools ...` e monte o pendrive novamente |
| Página em branco | Falta a pasta `data` ou o navegador é muito antigo | Copie tudo de novo; use Chrome/Edge/Firefox |
| Áudio não toca no Safari | Formato `.opus` não é suportado | Use Chrome, Edge ou Firefox |
| "Aviso do sistema" repetido | Registros internos do WhatsApp (criptografia, conta comercial) | Normal; não afeta as mensagens |

## Pendrive

| Sintoma | Causa | Solução |
|---|---|---|
| `FALHA: N arquivo(s) continuam diferentes` | Pendrive **defeituoso ou com capacidade falsa** | Use outro pendrive; teste o suspeito com h2testw (Windows) ou f3 |
| `Espaço insuficiente` | Pendrive pequeno demais | Use um maior |
| `A unidade C: é a unidade do sistema` | Letra errada | Use a letra do pendrive |
| `A unidade E:\ não foi encontrada` | Pendrive desconectado ou letra diferente | Confira a letra no Explorador de Arquivos |
| Cópia "terminou" mas faltam arquivos | Cópia sem verificação | Use `criar-pendrive`, que confere por hash |

## Como pedir ajuda

Abra uma *issue* no GitHub e inclua o **texto do erro** (do terminal ou de `logs\`). **Nunca** envie: sua chave de 64 dígitos,
`encrypted_backup.key`, `msgstore.db`, prints de conversas ou números de telefone reais. Troque por `XXXX`.
