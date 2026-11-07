# TaskMind ローカルサーバー起動スクリプト (PowerShell)
# 使用例: .\start-taskmind.ps1 または .\start-taskmind.bat (ダブルクリック可)
# ポート 8080 で http://localhost:8080/ を公開する
param(
    [int]$Port = 8080
)
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $scriptDir

if (-not (Test-Path -LiteralPath (Join-Path $scriptDir 'index.html'))) {
    Write-Host "index.html が見つかりません: $scriptDir" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python が見つかりません。python.org からインストールするか、py ランチャーをインストールしてください。" -ForegroundColor Red
    exit 1
}

$python = (Get-Command python).Source
if (-not $python) { $python = 'python' }

$url = "http://localhost:$Port/"

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "ポート $Port は使用中です($($existing.OwningProcess))。ブラウザで $url を開きます。" -ForegroundColor Yellow
    Start-Process $url
    exit 0
}
if (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue) {
    Write-Host "ポート $Port が他プロセスに使用されています。" -ForegroundColor Yellow
}

Write-Host "TaskMind サーバー起動中: $url" -ForegroundColor Cyan
Write-Host "停止するには Ctrl+C" -ForegroundColor DarkGray
try {
    Start-Process $url -ErrorAction SilentlyContinue
} catch {}

& $python -m http.server $Port --directory $scriptDir
