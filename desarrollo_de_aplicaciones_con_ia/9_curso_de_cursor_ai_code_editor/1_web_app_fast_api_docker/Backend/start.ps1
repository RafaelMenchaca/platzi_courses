# Levanta los servicios (PostgreSQL + API) con Docker
# Ejecutar desde la carpeta Backend o con: .\start.ps1 desde Backend
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Iniciando servicios (db + api)..." -ForegroundColor Cyan
docker compose up --build
