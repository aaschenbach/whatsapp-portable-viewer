# Segurança e privacidade

## O que é sensível

| Item | Por quê | Cuidado |
|---|---|---|
| **Chave de 64 dígitos** e `encrypted_backup.key` | Quem a tiver, com o `.crypt15`, lê **todas** as suas conversas | Guarde em local seguro (papel em cofre, gerenciador de senhas). Nunca no pendrive nem em repositório público |
| `msgstore.db.crypt15` | Backup criptografado (seguro **sem** a chave) | Guarde cópias; sem a chave ele é ilegível |
| `msgstore.db`, `wa.db` | Conversas e contatos **em texto aberto** | Apague quando não precisar; não envie por e-mail/nuvem pública |
| **O pendrive final** | Contém as conversas **sem criptografia** e as mídias | Trate como documento confidencial; veja abaixo |
| Prints de conversas e da chave | Expõem dados de terceiros e a chave | Não publique em issues, fóruns ou redes sociais |

## Este projeto não envia seus dados

Tudo roda **no seu computador**. O assistente, o conversor e o visualizador não enviam nada para a internet. A internet é usada
apenas para baixar o Python e as bibliotecas (e, opcionalmente, ao clicar em links como o mapa de uma localização ou o link de um anúncio).
Você pode conferir lendo `iniciar.ps1`, `criar-pendrive.ps1` e `src/wacrypttools/`.

## Proteger o pendrive

- Guarde-o como guardaria um HD com documentos pessoais.
- Para proteção real, use **BitLocker To Go** (Windows Pro/Enterprise) ou criptografia equivalente: o pendrive pede uma senha ao
  conectar. O visualizador funciona normalmente depois de desbloqueado.
- Ao descartar ou emprestar, **formate de forma completa** (não "rápida") ou destrua o pendrive.

## Conversas têm dados de outras pessoas

Mensagens, fotos e documentos incluem informações de terceiros (clientes, pacientes, familiares). No Brasil a **LGPD** (Lei
13.709/2018) se aplica a dados pessoais, inclusive dados sensíveis como saúde. Se o backup tem conversas **de trabalho ou de
clientes**, avalie a base legal, o prazo de guarda e quem pode ter acesso, e consulte o responsável pela proteção de dados da
sua organização. Este projeto é uma ferramenta; a responsabilidade pelo uso dos dados é de quem o usa.

Use apenas **os seus próprios backups**, em aparelhos e contas que você tem direito de acessar.

## Antes de publicar qualquer coisa no GitHub

- Nunca versione: `msgstore.db*`, `wa.db*`, `*.crypt15`, `encrypted_backup.key`, `Media/`, `pendrive/`, `*.vcf`, `contatos*.csv`, `logs/`.
  O `.gitignore` deste repositório já cobre isso, mas **confira o `git status`** antes de cada commit.
- Em prints e exemplos, use somente os dados fictícios da pasta `demo/`.
- Se você publicou uma chave por engano: **gere uma nova chave** no celular (desative e ative de novo o backup criptografado) e apague o histórico
  do repositório; trocar a chave invalida os backups antigos criptografados com ela.
