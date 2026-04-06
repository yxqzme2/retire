# ─────────────────────────────────────────────────────────────────────────────
# RetireVision — Push to Docker Hub
#
# Prerequisites:
#   1. Run .\deploy\build.ps1 -Registry yourname first
#   2. docker login
#
# Usage:
#   .\deploy\push-to-dockerhub.ps1 -Username yourname
#   .\deploy\push-to-dockerhub.ps1 -Username yourname -Tag v1.1
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,

    [string]$Tag           = "latest",
    [string]$LocalRegistry = "retirevision"
)

$ErrorActionPreference = "Stop"

$local  = "${LocalRegistry}/retirevision:${Tag}"
$remote = "${Username}/retirevision:${Tag}"

Write-Host ""
Write-Host "▶  Tagging $local → $remote" -ForegroundColor Yellow
docker tag $local $remote
if ($LASTEXITCODE -ne 0) { Write-Error "Tag failed"; exit 1 }

Write-Host "▶  Pushing to Docker Hub..." -ForegroundColor Yellow
docker push $remote
if ($LASTEXITCODE -ne 0) { Write-Error "Push failed"; exit 1 }

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Pushed: $remote" -ForegroundColor Green
Write-Host ""
Write-Host "  Update my-retire.xml Repository field to:" -ForegroundColor White
Write-Host "    $remote" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
