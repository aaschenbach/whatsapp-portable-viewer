# Copia o visualizador (pasta "pendrive") e a pasta Media para um pendrive e VERIFICA a copia por SHA-256.
# Uso (na raiz do projeto): .\criar-pendrive.ps1 -Drive E [-MediaPath "C:\caminho\Media"]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Drive,
    [string]$MediaPath,
    [string]$ViewerPath
)

$ErrorActionPreference = 'Stop'

function Get-Sha([string]$path) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $stream = [System.IO.File]::OpenRead($path)
    try { return [System.BitConverter]::ToString($sha.ComputeHash($stream)) }
    finally { $stream.Dispose(); $sha.Dispose() }
}

function Get-FolderBytes([string]$path) {
    $sum = (Get-ChildItem -LiteralPath $path -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum
    if ($null -eq $sum) { return 0 }
    return $sum
}

function Copy-Folder([string]$source, [string]$target, [string]$mode = '/E') {
    robocopy $source $target $mode /R:2 /W:2 /NFL /NDL /NP /NJH /NJS | Out-Null
    if ($LASTEXITCODE -ge 8) {
        Write-Host "Falha ao copiar '$source' (robocopy codigo $LASTEXITCODE)." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Sanitiza um caminho relativo: segmentos iniciados por '.' viram '_' + resto (ex: .Shared → _Shared).
function Get-SanitizedRelative([string]$relative) {
    $parts = $relative -split '[\\\/]'
    $sanitized = $parts | ForEach-Object { if ($_.StartsWith('.')) { '_' + $_.Substring(1) } else { $_ } }
    return $sanitized -join '\'
}

# Retorna os arquivos de $source que faltam em $target ou diferem (tamanho/SHA-256).
# Aplica sanitização de nomes iniciados por '.' ao construir o caminho no destino.
function Test-Copy([string]$source, [string]$target) {
    $bad = New-Object System.Collections.Generic.List[string]
    $prefix = (Resolve-Path -LiteralPath $source).Path.TrimEnd('\') + '\'
    foreach ($file in Get-ChildItem -LiteralPath $source -Recurse -File -Force) {
        $relative = $file.FullName.Substring($prefix.Length)
        $sanitized = Get-SanitizedRelative $relative
        $copy = Join-Path $target $sanitized
        if (-not (Test-Path -LiteralPath $copy -PathType Leaf)) { $bad.Add($relative); continue }
        if ((Get-Item -LiteralPath $copy -Force).Length -ne $file.Length) { $bad.Add($relative); continue }
        if ((Get-Sha $file.FullName) -ne (Get-Sha $copy)) { $bad.Add($relative) }
    }
    return $bad
}

$letter = $Drive.Trim().TrimEnd(':', '\').ToUpper()
if ($letter -notmatch '^[A-Z]$') {
    Write-Host "Letra de unidade invalida: '$Drive'. Exemplo: E ou E:" -ForegroundColor Red
    exit 1
}
if ($letter -eq $env:SystemDrive.Substring(0, 1).ToUpper()) {
    Write-Host "A unidade $letter`: e a unidade do sistema. Informe a letra do pendrive." -ForegroundColor Red
    exit 1
}

$root = (Get-Location).Path
if ($ViewerPath) { $viewer = (Resolve-Path -LiteralPath $ViewerPath).Path } else { $viewer = Join-Path $root 'pendrive' }
if (-not $MediaPath) { $MediaPath = Join-Path $viewer 'Media' }

$required = @(
    (Join-Path $root 'pyproject.toml'), (Join-Path $viewer 'index.html'), (Join-Path $viewer 'style.css'),
    (Join-Path $viewer 'app.js'), (Join-Path $viewer 'data'), $MediaPath
)
foreach ($item in $required) {
    if (-not (Test-Path -LiteralPath $item)) {
        Write-Host "Nao encontrei '$item'. Rode este script da raiz do projeto, depois de gerar o visualizador (uv run wacrypttools ...)." -ForegroundColor Red
        exit 1
    }
}
$MediaPath = (Resolve-Path -LiteralPath $MediaPath).Path

$dest = "$letter`:\"
if (-not (Test-Path $dest)) {
    Write-Host "A unidade $dest nao foi encontrada. Conecte o pendrive e confira a letra." -ForegroundColor Red
    exit 1
}
$driveInfo = New-Object System.IO.DriveInfo($letter)
if (-not $driveInfo.IsReady) {
    Write-Host "A unidade $dest nao esta pronta." -ForegroundColor Red
    exit 1
}

$files = 'index.html', 'style.css', 'app.js'
$needed = (Get-FolderBytes $MediaPath) + (Get-FolderBytes (Join-Path $viewer 'data'))
foreach ($f in $files) { $needed += (Get-Item (Join-Path $viewer $f)).Length }
$neededGb = [math]::Round($needed / 1GB, 2)
$freeGb = [math]::Round($driveInfo.AvailableFreeSpace / 1GB, 2)
Write-Host "Destino: $dest ($($driveInfo.DriveFormat), $($driveInfo.DriveType)) - livre: $freeGb GB - necessario: $neededGb GB"
if ($driveInfo.AvailableFreeSpace -lt $needed) {
    Write-Host "Espaco insuficiente no pendrive." -ForegroundColor Red
    exit 1
}

Write-Host "Copiando arquivos do visualizador..."
foreach ($f in $files) { Copy-Item -LiteralPath (Join-Path $viewer $f) -Destination $dest -Force }

Write-Host "Copiando data..."
Copy-Folder (Join-Path $viewer 'data') (Join-Path $dest 'data') '/MIR'

Write-Host "Copiando Media para o pendrive (arquivos novos ou alterados)..."
$mediaFiles = @(Get-ChildItem -LiteralPath $MediaPath -Recurse -File -Force)
$total = $mediaFiles.Count
$mediaDest = Join-Path $dest 'Media'
$count = 0
$copied = 0
$skipped = 0
$lastPct = -1
foreach ($file in $mediaFiles) {
    $relative = $file.FullName.Substring($MediaPath.TrimEnd('\').Length + 1)
    $target = Join-Path $mediaDest $relative
    $targetDir = Split-Path $target
    if (-not (Test-Path -LiteralPath $targetDir)) { New-Item -ItemType Directory -Force -Path $targetDir | Out-Null }
    if ((Test-Path -LiteralPath $target) -and (Get-Item -LiteralPath $target -Force).Length -eq $file.Length) {
        $skipped++
    } else {
        Copy-Item -LiteralPath $file.FullName -Destination $target -Force
        $copied++
    }
    $count++
    if ($total -gt 0) {
        $pct = [int]($count * 100 / $total)
        if ($pct -ne $lastPct) {
            $lastPct = $pct
            Write-Host "`r  $pct% ($count de $total arquivos)" -NoNewline
        }
    }
}
Write-Host "`r  100% — $copied copiados, $skipped ja existiam.          "

Write-Host "Verificando a copia (SHA-256 de todos os arquivos)..."
$failures = New-Object System.Collections.Generic.List[string]
foreach ($f in $files) {
    $copy = Join-Path $dest $f
    if (-not (Test-Path -LiteralPath $copy) -or (Get-Sha (Join-Path $viewer $f)) -ne (Get-Sha $copy)) { $failures.Add($f) }
}
foreach ($relative in (Test-Copy (Join-Path $viewer 'data') (Join-Path $dest 'data'))) { $failures.Add("data\$relative") }

Write-Host "  Verificando Media..." -NoNewline
$mediaToCheck = @(Get-ChildItem -LiteralPath $MediaPath -Recurse -File -Force)
$mediaTotal = $mediaToCheck.Count
$mediaChecked = 0
$mediaLastPct = -1
$prefix = (Resolve-Path -LiteralPath $MediaPath).Path.TrimEnd('\') + '\'
foreach ($file in $mediaToCheck) {
    $relative = $file.FullName.Substring($prefix.Length)
    $sanitized = Get-SanitizedRelative $relative
    $copy = Join-Path (Join-Path $dest 'Media') $sanitized
    if (-not (Test-Path -LiteralPath $copy -PathType Leaf)) { $failures.Add("Media\$relative") }
    elseif ((Get-Item -LiteralPath $copy -Force).Length -ne $file.Length) { $failures.Add("Media\$relative") }
    elseif ((Get-Sha $file.FullName) -ne (Get-Sha $copy)) { $failures.Add("Media\$relative") }
    $mediaChecked++
    $pct = [int]($mediaChecked * 100 / $mediaTotal)
    if ($pct -ne $mediaLastPct) {
        $mediaLastPct = $pct
        Write-Host "`r  Verificando Media... $pct% ($mediaChecked de $mediaTotal)" -NoNewline
    }
}
Write-Host "`r  Verificação Media: 100% — $mediaTotal arquivos verificados.          "

function Resolve-Source([string]$relative) {
    if ($relative.StartsWith('Media\')) { return Join-Path $MediaPath $relative.Substring(6) }
    return Join-Path $viewer $relative
}

if ($failures.Count -gt 0) {
    Write-Host "Recopiando $($failures.Count) arquivo(s) com problema..." -ForegroundColor Yellow
    foreach ($relative in $failures) {
        $destRelative = if ($relative.StartsWith('Media\')) { 'Media\' + (Get-SanitizedRelative $relative.Substring(6)) } else { $relative }
        $to = Join-Path $dest $destRelative
        New-Item -ItemType Directory -Force -Path (Split-Path $to) | Out-Null
        try { Copy-Item -LiteralPath (Resolve-Source $relative) -Destination $to -Force } catch { }
    }
    $still = New-Object System.Collections.Generic.List[string]
    foreach ($relative in $failures) {
        $destRelative = if ($relative.StartsWith('Media\')) { 'Media\' + (Get-SanitizedRelative $relative.Substring(6)) } else { $relative }
        $to = Join-Path $dest $destRelative
        if (-not (Test-Path -LiteralPath $to) -or (Get-Sha (Resolve-Source $relative)) -ne (Get-Sha $to)) { $still.Add($relative) }
    }
    if ($still.Count -gt 0) {
        Write-Host "FALHA: $($still.Count) arquivo(s) continuam diferentes do original em $dest" -ForegroundColor Red
        $still | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        Write-Host "O pendrive parece defeituoso ou com capacidade falsa. Teste-o (h2testw / f3), rode 'chkdsk $letter`: /f' ou use outro." -ForegroundColor Red
        exit 2
    }
}

Write-Host "Pendrive pronto e verificado em $dest. Abra ${dest}index.html para testar." -ForegroundColor Green
exit 0
