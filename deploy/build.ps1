# ─────────────────────────────────────────────────────────────────────────────
# RetireVision — Build Single Combined Docker Image
# Run from the project root: .\deploy\build.ps1
#
# Builds one image containing both the React frontend (nginx) and the
# FastAPI backend (uvicorn), managed by supervisord.
#
# After building:
#   Push to Docker Hub  →  .\deploy\push-to-dockerhub.ps1 -Username yourname
#   Export as tar file  →  .\deploy\export-images.ps1
# ─────────────────────────────────────────────────────────────────────────────

param(
    [string]$Tag      = "latest",
    [string]$Registry = "retirevision"   # your Docker Hub username or local tag prefix
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RetireVision — Docker Build" -ForegroundColor Cyan
Write-Host "  Image : ${Registry}/retirevision:${Tag}" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

docker build `
    --file "$ProjectRoot\Dockerfile.combined" `
    --build-arg VITE_API_URL=/api `
    --tag "${Registry}/retirevision:${Tag}" `
    "$ProjectRoot"

if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Build complete!" -ForegroundColor Green
Write-Host "  Image: ${Registry}/retirevision:${Tag}" -ForegroundColor White
Write-Host ""
Write-Host "  Next:" -ForegroundColor White
Write-Host "    Push  →  .\deploy\push-to-dockerhub.ps1 -Username $Registry -Tag $Tag" -ForegroundColor Gray
Write-Host "    Export→  .\deploy\export-images.ps1 -Registry $Registry -Tag $Tag" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
