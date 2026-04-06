# ─────────────────────────────────────────────────────────────────────────────
# RetireVision — Export Image as .tar (No Docker Hub Required)
#
# Usage — export only (copy the tar to Unraid yourself):
#   .\deploy\export-images.ps1
#
# Usage — export AND auto-deploy to Unraid over SSH:
#   .\deploy\export-images.ps1 -Deploy -UnraidIP 192.168.1.100
# ─────────────────────────────────────────────────────────────────────────────

param(
    [string]$Registry   = "retirevision",
    [string]$Tag        = "latest",
    [switch]$Deploy,
    [string]$UnraidIP   = "",
    [string]$UnraidUser = "root"
)

$ErrorActionPreference = "Stop"
$OutputDir  = "$PSScriptRoot\images"
$TarFile    = "$OutputDir\retirevision.tar"
$Image      = "${Registry}/retirevision:${Tag}"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host ""
Write-Host "▶  Exporting $Image → retirevision.tar ..." -ForegroundColor Yellow
docker save --output $TarFile $Image
if ($LASTEXITCODE -ne 0) { Write-Error "Export failed"; exit 1 }

$size = [math]::Round((Get-Item $TarFile).Length / 1MB, 1)
Write-Host "✔  Saved ($($size) MB): $TarFile" -ForegroundColor Green

if ($Deploy) {
    if (-not $UnraidIP) { Write-Error "-UnraidIP is required with -Deploy"; exit 1 }

    Write-Host ""
    Write-Host "▶  Uploading to ${UnraidUser}@${UnraidIP} ..." -ForegroundColor Yellow
    scp $TarFile "${UnraidUser}@${UnraidIP}:/tmp/retirevision.tar"
    if ($LASTEXITCODE -ne 0) { Write-Error "SCP failed"; exit 1 }

    Write-Host "▶  Loading image on Unraid..." -ForegroundColor Yellow
    ssh "${UnraidUser}@${UnraidIP}" @"
docker load --input /tmp/retirevision.tar
rm /tmp/retirevision.tar
echo ''
echo 'Image loaded:'
docker images | grep retirevision
"@

    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  Done! Install my-retire.xml in Unraid CA" -ForegroundColor Green
    Write-Host "  then click Apply — no registry pull needed." -ForegroundColor White
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  Copy retirevision.tar to Unraid, then SSH in and run:" -ForegroundColor White
    Write-Host "    docker load --input /path/to/retirevision.tar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Or auto-deploy next time:" -ForegroundColor White
    Write-Host "    .\deploy\export-images.ps1 -Deploy -UnraidIP 192.168.1.x" -ForegroundColor Gray
}
Write-Host ""
