# 6. Montar o pendrive

## Escolha um bom pendrive

| Requisito | Por quê |
|---|---|
| **8 GB ou mais** (a cópia costuma ter 1 a 5 GB) | A pasta `Media` pode ser grande |
| De **marca conhecida**, comprado em loja confiável | Pendrives muito baratos ou de marca desconhecida podem ter **capacidade falsa** |
| Formatado em **exFAT** (ou NTFS) | exFAT funciona no Windows e no Mac; FAT32 limita arquivos a 4 GB |

### Cuidado: pendrive falso ou defeituoso

Alguns pendrives dizem ter 8 GB mas guardam bem menos, e **perdem ou corrompem dados em silêncio** quando passam do limite
real. Durante o desenvolvimento deste projeto, um desses pendrives parecia perfeito, mas **apenas 449 de 5.151 arquivos
ficaram íntegros**. A cópia "terminou sem erro" e só a conferência por hash revelou o problema.

Por isso a cópia deste projeto **sempre confere cada arquivo por SHA-256** depois de copiar. Se aparecer
**"FALHA … o pendrive parece defeituoso"**, troque de pendrive. Para testar um pendrive suspeito: h2testw
(Windows) ou [f3](https://github.com/AltraMayor/f3) (Linux/macOS).

## Formatar (exFAT)

> **A formatação apaga tudo o que está no pendrive.** Confira se não há nada importante.

1. Conecte o pendrive. No Explorador de Arquivos, clique com o botão direito nele → **Formatar…**
2. **Sistema de arquivos:** `exFAT`.
3. Para um pendrive suspeito, **desmarque "Formatação rápida"** (a completa leva mais tempo e já pode revelar defeitos).
4. **Iniciar**.

## Copiar e conferir

### Com o assistente

O `iniciar.bat` lista os pendrives, pergunta a letra e faz a cópia verificada.

### Manualmente

Na pasta do projeto (troque `E` pela letra do pendrive):

```powershell
.\criar-pendrive.ps1 -Drive E -MediaPath "C:\Backup-WhatsApp\Media"
```

Ou, com o atalho do Windows: `criar-pendrive.bat E` (usa a pasta `Media` na raiz do projeto).

O script:

1. recusa a unidade do sistema (`C:`) e confere o espaço livre;
2. copia `index.html`, `style.css`, `app.js`, `data` e `Media`;
3. **confere o SHA-256 de todos os arquivos** e recopia o que estiver diferente;
4. se ainda houver diferença, avisa que o pendrive é suspeito e termina com erro (código 2).

A cópia de ~1,6 GB leva de 8 a 15 minutos em um pendrive comum. Não retire o pendrive antes de aparecer
**"Pendrive pronto e verificado"**.

### Cópia manual (sem o script)

Copie para a **raiz** do pendrive, lado a lado: `index.html`, `style.css`, `app.js`, a pasta `data` e a pasta `Media`.
Os caminhos são relativos, então `index.html` e `Media` precisam estar na mesma pasta. Depois **confira**: no Explorador,
compare o tamanho e a quantidade de arquivos de `Media` na origem e no pendrive; o ideal é rodar o script, que confere por hash.

## Estrutura final do pendrive

```
E:\
  index.html
  style.css
  app.js
  data\       (conversas e índice de busca)
  Media\      (fotos, áudios, vídeos, documentos)
```

**Não copie** para o pendrive: `msgstore.db`, `wa.db`, `*.crypt15`, `encrypted_backup.key`. Eles são sensíveis e desnecessários.

## Testar

Abra `E:\index.html` com duplo clique (de preferência em **outro computador**, para garantir que não depende de nada
instalado). Veja o [capítulo 7](07-usando-o-visualizador.md).

---

## Instalar no computador

Se quiser acessar o backup **sem precisar do pendrive** (ou caso o pendrive se perca ou estrague), instale o backup em uma pasta do computador.

> O backup pode ocupar vários GB (o mesmo tamanho dos arquivos no pendrive). Verifique o espaço livre antes.

### Verificar espaço livre

| SO | Como verificar |
|---|---|
| **Windows** | Explorador de Arquivos → clique com botão direito no disco `C:` → Propriedades |
| **macOS** | Clique na maçã () → Sobre este Mac → Armazenamento |
| **Linux** | Gerenciador de arquivos → botão direito na pasta Home → Propriedades |

### Instalação manual (recomendada para leigos)

> **Importante:** se já existir uma pasta de instalação anterior, **apague-a completamente** antes de copiar. Isso garante que não sobrem arquivos de uma versão antiga que poderiam confundir o visualizador.

**Windows:**
1. Abra o Explorador de Arquivos e clique no pendrive no painel esquerdo.
2. Selecione todos os arquivos (Ctrl+A) → copie (Ctrl+C).
3. Abra `Documentos`, apague a pasta `Backup WhatsApp` se ela existir, crie-a novamente e cole (Ctrl+V).
4. Clique duas vezes em `index.html` para abrir.
5. Atalho: botão direito em `index.html` → *Enviar para* → *Área de trabalho (criar atalho)*.

**macOS:**
1. Abra o Finder e clique no pendrive no painel esquerdo.
2. Selecione todos (Cmd+A) → copie (Cmd+C).
3. Abra `Documentos`, apague a pasta `Backup WhatsApp` se existir (arraste para a lixeira), crie-a novamente e cole (Cmd+V).
4. Clique duas vezes em `index.html`.
5. Atalho: segure Cmd+Alt e arraste `index.html` para a área de trabalho.

**Linux:**
1. Abra o gerenciador de arquivos e clique no pendrive.
2. Selecione todos (Ctrl+A) → copie (Ctrl+C).
3. Abra `Documentos`, apague a pasta `Backup WhatsApp` se existir, crie-a novamente e cole (Ctrl+V).
4. Clique duas vezes em `index.html`.
5. Atalho: botão direito em `index.html` → *Criar link* ou *Enviar para área de trabalho*.

### Instalação automática com script (opção avançada)

O menu ☰ dentro do visualizador oferece scripts para cada sistema operacional. Eles:

- copiam **apenas os arquivos do backup** (não o pendrive inteiro — outros arquivos pessoais no pendrive ficam intocados);
- **verificam o espaço livre** antes de copiar e interrompem com aviso claro se não houver espaço suficiente;
- **apagam a instalação anterior** após pedir confirmação, garantindo que não sobrem arquivos antigos;
- criam um atalho na área de trabalho automaticamente.

| SO | Script | Observação |
|---|---|---|
| Windows | `.bat` | Ao executar, o Windows pode exibir *"Windows protegeu seu PC"* — clique em *Mais informações* → *Executar assim mesmo* |
| macOS | `.sh` | Abra o Terminal, arraste o arquivo baixado para a janela e pressione Enter |
| Linux | `.sh` | Abra o terminal e execute `bash instalar-backup-whatsapp.sh` |

Próximo: [7. Usando o visualizador](07-usando-o-visualizador.md)
