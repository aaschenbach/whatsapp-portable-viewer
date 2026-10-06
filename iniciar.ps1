# Assistente: backup do WhatsApp -> visualizador offline -> pendrive.
# Rode com duplo clique em iniciar.bat (ou: powershell -File iniciar.ps1).
param(
    [string]$Backup,        # pasta com os arquivos copiados do celular
    [string]$Key,           # chave de 64 caracteres (aceita espacos)
    [string]$KeyImage,      # print da tela com a chave (leitura por OCR)
    [string]$Contacts,      # wa.db, .vcf ou .csv (opcional)
    [string]$Drive,         # letra do pendrive
    [string]$OutDir,        # pasta onde o visualizador e gerado (padrao: pendrive)
    [string]$PlainDb,       # usa um msgstore.db ja descriptografado (testes/demonstracao)
    [switch]$NonInteractive,
    [switch]$SkipPendrive
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location -LiteralPath $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $PSScriptRoot 'pendrive' }

$logDir = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir ("iniciar-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".log")

function Write-Log([string]$text) { Add-Content -LiteralPath $logFile -Value $text -Encoding UTF8 }
function Say([string]$text, [string]$color = 'White') { Write-Host $text -ForegroundColor $color; Write-Log $text }
function Step([string]$number, [string]$title) { Say ''; Say "=== Passo $number - $title ===" 'Cyan' }
function Ok([string]$text) { Say "  [OK] $text" 'Green' }
function Warn([string]$text) { Say "  [!] $text" 'Yellow' }
function Fail([string]$text, [string]$help) {
    Say "  [ERRO] $text" 'Red'
    if ($help) { Say "         $help" 'Yellow' }
    Say "  O registro desta execucao esta em: $logFile" 'Gray'
    exit 1
}
function Ask([string]$question, [string]$default = '') {
    if ($NonInteractive) { return $default }
    $suffix = ''
    if ($default) { $suffix = " [$default]" }
    $answer = Read-Host "$question$suffix"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    return $answer.Trim().Trim('"')
}
function Confirm-Yes([string]$question, [bool]$default = $true) {
    if ($NonInteractive) { return $default }
    $hint = 'S/n'
    if (-not $default) { $hint = 's/N' }
    $answer = Read-Host "$question ($hint)"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    return $answer.Trim().ToLower().StartsWith('s')
}
function Refresh-Path {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machine;$user"
    $tess = 'C:\Program Files\Tesseract-OCR'
    if ((Test-Path $tess) -and ($env:Path -notlike "*$tess*")) { $env:Path += ";$tess" }
}
function Run-Tool([string[]]$toolArgs) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & uv run @toolArgs 2>&1 | ForEach-Object { "$_" }
    $code = $LASTEXITCODE
    $ErrorActionPreference = $previous
    $clean = ($output -join "`n") -replace '\x1b\[[0-9;]*m', ''
    Write-Log ($clean -replace '[0-9a-fA-F]{64}', '<chave-oculta>')
    return @{ Code = $code; Text = $clean }
}

function Run-Tool-Live([string[]]$toolArgs) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $lines = [System.Collections.Generic.List[string]]::new()
    & uv run @toolArgs 2>&1 | ForEach-Object {
        $line = "$_" -replace '\x1b\[[0-9;]*m', ''
        $lines.Add($line)
        Say "  $line" 'Gray'
    }
    $code = $LASTEXITCODE
    $ErrorActionPreference = $previous
    $clean = $lines -join "`n"
    Write-Log ($clean -replace '[0-9a-fA-F]{64}', '<chave-oculta>')
    return @{ Code = $code; Text = $clean }
}

Say 'WhatsApp Backup Viewer - assistente' 'Cyan'
Say 'Este assistente transforma o backup do seu WhatsApp em um visualizador que abre sem internet,'
Say 'e copia tudo para um pendrive. Nada e enviado para a internet; tudo acontece neste computador.'

# ---------------------------------------------------------------- 1
Step 1 'Conferindo o computador'
Refresh-Path
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Warn 'O programa "uv" (que instala o Python sozinho) nao esta instalado.'
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Fail 'Nao encontrei o winget para instalar o uv.' 'Instale manualmente: https://docs.astral.sh/uv/getting-started/installation/ e rode este assistente de novo.'
    }
    if (-not (Confirm-Yes 'Posso instalar o uv agora?')) { Fail 'O uv e necessario.' 'Instale-o e rode de novo.' }
    & winget install --id=astral-sh.uv -e --accept-source-agreements --accept-package-agreements | Out-Null
    Refresh-Path
    if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
        Fail 'O uv foi instalado, mas este terminal ainda nao o enxerga.' 'Feche esta janela, abra o iniciar.bat de novo.'
    }
}
Ok 'uv encontrado.'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail 'O Git nao esta instalado. Ele e necessario para baixar o wa-crypt-tools do GitHub.' 'Instale em https://git-scm.com/download/win (opcoes padrao), feche esta janela e abra o iniciar.bat de novo.'
}
Ok 'git encontrado.'
Say '  Preparando o Python e as ferramentas (pode baixar alguns arquivos na primeira vez)...'
$ErrorActionPreference = 'Continue'
$syncOutput = @(& uv sync 2>&1 | ForEach-Object { "$_" })
$syncCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
Write-Log ($syncOutput -join "`n")
if ($syncCode -ne 0) {
    $syncOutput | Select-Object -Last 6 | ForEach-Object { Say "    $_" 'Gray' }
    Fail 'Nao consegui preparar as ferramentas (uv sync).' 'Confira a internet, se o Git esta instalado (git --version) e se a pasta do projeto esta completa (baixe o ZIP inteiro) e rode de novo.'
}
Ok 'Ferramentas prontas.'

# ---------------------------------------------------------------- 2
Step 2 'Localizando os arquivos do backup'
$plainMode = [bool]$PlainDb
$workDb = Join-Path $PSScriptRoot 'msgstore.db'
$mediaDir = $null
$crypt = $null
$waCrypt = $null
$vcards = @()

if (-not $Backup) {
    Say '  Informe a pasta onde voce copiou os arquivos do celular (a que tem o msgstore.db.crypt15).'
    Say '  Dica: arraste a pasta para esta janela e aperte Enter. Apenas Enter usa a pasta do projeto.'
    $Backup = Ask '  Pasta do backup' $PSScriptRoot
}
if (-not (Test-Path -LiteralPath $Backup -PathType Container)) { Fail "A pasta nao existe: $Backup" 'Confira o caminho e rode de novo.' }
$Backup = (Resolve-Path -LiteralPath $Backup).Path

function Find-First([string]$pattern) {
    Get-ChildItem -LiteralPath $Backup -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
if ($plainMode) {
    $workDb = (Resolve-Path -LiteralPath $PlainDb).Path
    Ok "Usando banco ja descriptografado: $workDb"
} else {
    $crypt = Find-First 'msgstore.db.crypt15'
    if (-not $crypt) { $crypt = Find-First 'msgstore*.crypt15' }
    if (-not $crypt) { Fail 'Nao encontrei o arquivo msgstore.db.crypt15 nessa pasta.' 'Ele fica no celular em Android/media/com.whatsapp(.w4b)/.../Databases. Veja docs/01-preparar-o-celular.md.' }
    Ok "Banco criptografado: $($crypt.FullName)"
    $waCrypt = Find-First 'wa.db.crypt15'
    if ($waCrypt) { Ok "Contatos (wa.db): $($waCrypt.FullName)" } else { Warn 'wa.db.crypt15 nao encontrado: as conversas aparecerao pelo telefone, sem o nome do contato.' }
}
$mediaCandidate = Get-ChildItem -LiteralPath $Backup -Recurse -Directory -Filter 'Media' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($mediaCandidate) { $mediaDir = $mediaCandidate.FullName; Ok "Pasta de midias: $mediaDir" }
else { Warn 'Pasta Media nao encontrada: o visualizador mostrara so o texto (sem fotos, audios e documentos).' }
$vcards = @(Get-ChildItem -LiteralPath $Backup -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -eq '.vcf' -or ($_.Extension -eq '.csv' -and ($_.Name -like 'contatos*' -or $_.Name -like 'contacts*')) })
foreach ($file in $vcards) { Ok "Lista de contatos: $($file.FullName)" }
if ($Contacts) { $vcards += Get-Item -LiteralPath $Contacts }

# ---------------------------------------------------------------- 3
if (-not $plainMode) {
    Step 3 'Chave de criptografia'
    $keyFile = Join-Path $PSScriptRoot 'encrypted_backup.key'
    $keyHex = $null
    $keyArg = $null
    $useExisting = $false
    if ((Test-Path $keyFile) -and -not $Key -and -not $KeyImage) {
        $useExisting = Confirm-Yes '  Ja existe um encrypted_backup.key aqui. Usar esse arquivo?'
    }
    if ($useExisting) { $keyArg = $keyFile }
    else {
        if (-not $Key -and -not $KeyImage -and -not $NonInteractive) {
            Say '  Como voce quer informar a chave de 64 caracteres?'
            Say '    1) Digitar a chave'
            Say '    2) Ler a chave de um print da tela (precisa ser o print original, nao foto)'
            $choice = Ask '  Escolha 1 ou 2' '1'
            if ($choice -eq '2') { $KeyImage = Ask '  Caminho do print (arraste o arquivo para ca)' '' }
        }
        if ($KeyImage) {
            if (-not (Get-Command tesseract -ErrorAction SilentlyContinue)) {
                Warn 'Para ler a imagem preciso do Tesseract.'
                if ((Get-Command winget -ErrorAction SilentlyContinue) -and (Confirm-Yes '  Instalar o Tesseract agora?')) {
                    & winget install --id=UB-Mannheim.TesseractOCR -e --accept-source-agreements --accept-package-agreements | Out-Null
                    Refresh-Path
                }
            }
            if (-not (Test-Path -LiteralPath $KeyImage)) { Fail "Nao encontrei o print: $KeyImage" 'Confira o caminho do arquivo.' }
            $keyArg = (Resolve-Path -LiteralPath $KeyImage).Path
        } else {
            $attempt = 0
            while (-not $keyHex) {
                $attempt++
                if (-not $Key) {
                    Say '  Digite a chave (pode ter espacos). Ex.: 1111 2222 3333 ... (16 grupos de 4)'
                    $Key = Ask '  Chave' ''
                }
                $clean = ($Key -replace '[\s-]', '')
                if ($clean -match '^[0-9a-fA-F]{64}$') { $keyHex = $clean.ToLower() }
                else {
                    $bad = ([regex]::Matches($clean, '[^0-9a-fA-F]') | ForEach-Object { $_.Value }) -join ' '
                    $detail = "Tem $($clean.Length) caracteres (precisa ter 64)."
                    if ($bad) { $detail += " Caracteres invalidos: $bad (a chave so tem 0-9 e a-f; a letra O costuma ser zero)." }
                    Say "  [!] $detail" 'Yellow'
                    $Key = $null
                    if ($NonInteractive -or $attempt -ge 3) { Fail 'Chave invalida.' 'Confira a chave no celular ou no print e rode de novo.' }
                }
            }
            $keyArg = $keyHex
        }
    }

    # ------------------------------------------------------------ 4
    Step 4 'Descriptografando o backup'
    Say '  Isso pode levar alguns segundos...'
    $r = Run-Tool @('wadecrypt', '-v', '-y', $keyArg, $crypt.FullName, $workDb)
    if ($r.Code -ne 0) {
        ($r.Text -split "`n") | Where-Object { $_ -match 'mismatch|Could not|does not|invalid|corrupt' } | Select-Object -First 3 |
            ForEach-Object { Say "    $_" 'Gray' }
        Fail 'Nao foi possivel descriptografar o backup.' 'Quase sempre e um caractere errado na chave (O/0, l/1, B/8) ou o arquivo foi copiado incompleto. Veja docs/09-problemas-comuns.md.'
    }
    $finalKey = $keyHex
    if ($r.Text -match 'It was a digit or two out; ([0-9a-f]{64}) works') {
        $finalKey = $Matches[1]
        Warn 'A chave digitada tinha 1 ou 2 caracteres errados. A ferramenta corrigiu sozinha e o backup abriu.'
        Warn 'Confira a chave correta contra o celular, pois o arquivo encrypted_backup.key sera gravado com a versao corrigida.'
    }
    if ($finalKey) {
        $k = Run-Tool @('wacreatekey', '-y', '-o', $keyFile, '--hex', $finalKey)
        if ($k.Code -eq 0) { Ok 'Arquivo de chave salvo (encrypted_backup.key). Guarde-o fora do pendrive.' }
        else { Warn 'Nao consegui salvar encrypted_backup.key (nao afeta o resultado).' }
    }
    $ErrorActionPreference = 'Continue'
    $count = (& uv run python -c "import sqlite3,sys; c=sqlite3.connect('file:'+sys.argv[1]+'?mode=ro',uri=True); print(c.execute('select count(*) from message').fetchone()[0])" $workDb 2>$null)
    $ErrorActionPreference = 'Stop'
    Ok "Backup descriptografado. Mensagens no banco: $count"
    if ($waCrypt) {
        $waDb = Join-Path $PSScriptRoot 'wa.db'
        $waKey = $keyFile
        if (-not (Test-Path $waKey)) { $waKey = $keyArg }
        $r = Run-Tool @('wadecrypt', '-y', $waKey, $waCrypt.FullName, $waDb)
        if ($r.Code -eq 0) { Ok 'Contatos (wa.db) descriptografados.'; $vcards += Get-Item $waDb }
        else { Warn 'Nao consegui abrir o wa.db; seguindo sem nomes de contatos.' }
    }
}

# ---------------------------------------------------------------- 5
Step 5 'Gerando o visualizador'
$build = @('wacrypttools', '--db', $workDb, '--out', $OutDir)
if ($mediaDir) { $build += @('--media', $mediaDir, '--copy-media') }
if ($vcards.Count -gt 0) { $build += '--contacts'; $build += ($vcards | ForEach-Object { $_.FullName }) }
$r = Run-Tool-Live $build
if ($r.Code -ne 0) { Fail 'Nao consegui gerar o visualizador.' 'Veja o registro e docs/09-problemas-comuns.md.' }
Ok "Visualizador gerado em: $OutDir (relatorio completo em relatorio.txt)"
if (Test-Path (Join-Path $OutDir 'midias_ausentes.csv')) {
    Warn 'Algumas midias nao tem arquivo (o visualizador mostra um aviso nelas). Lista em midias_ausentes.csv na pasta do visualizador.'
}

# ---------------------------------------------------------------- 6
Step 6 'Pendrive'
if ($SkipPendrive) { Warn 'Etapa do pendrive ignorada.' }
elseif (-not $mediaDir) { Warn 'Sem pasta Media nao ha o que copiar alem do texto; copie a pasta "pendrive" manualmente se quiser.' }
else {
    if (-not $Drive) {
        $removable = @(Get-Volume | Where-Object { $_.DriveType -eq 'Removable' -and $_.DriveLetter })
        if ($removable.Count -eq 0) { Warn 'Nenhum pendrive encontrado. Conecte um (8 GB ou mais) e rode de novo, ou copie a pasta "pendrive" depois.' }
        else {
            Say '  Pendrives encontrados:'
            foreach ($v in $removable) { Say ("    {0}:  {1}  {2}  {3:N1} GB" -f $v.DriveLetter, $v.FileSystemLabel, $v.FileSystem, ($v.Size / 1GB)) }
            Say '  ATENCAO: o conteudo antigo das pastas data e Media do pendrive sera atualizado.'
            $Drive = Ask '  Letra do pendrive (ou Enter para pular)' ''
        }
    }
    if ($Drive) {
        $ErrorActionPreference = 'Continue'
        # A Media ja foi copiada para $OutDir/Media pelo --copy-media; o criar-pendrive.ps1 a usa de la.
        # Sem pipe para preservar o -NoNewline dos pontinhos de progresso.
        & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'criar-pendrive.ps1') -Drive $Drive -ViewerPath $OutDir
        $copyCode = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        if ($copyCode -eq 0) { Ok 'Pendrive pronto e verificado.' }
        elseif ($copyCode -eq 2) { Fail 'O pendrive nao guardou os dados corretamente.' 'Ele parece defeituoso ou com capacidade falsa. Use outro (veja docs/06-montar-o-pendrive.md).' }
        else { Fail 'Falha ao copiar para o pendrive.' 'Veja a mensagem acima.' }
    }
}

# ---------------------------------------------------------------- 7
Step 7 'Concluido'
$index = Join-Path $OutDir 'index.html'
Ok "Abra o visualizador: $index"
$mediaReady = Test-Path (Join-Path $OutDir 'Media')
if (-not $mediaReady) { Warn 'A pasta Media nao esta dentro de "pendrive". Fotos, audios e videos nao aparacerao. Monte o pendrive para ver as midias.' }
if (-not $NonInteractive -and (Confirm-Yes '  Abrir agora no navegador?')) { Start-Process $index }
Say '  Para o pendrive: abra "index.html" na raiz dele com duplo clique.' 'Gray'
exit 0
