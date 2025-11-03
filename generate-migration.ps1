# generate-migration.ps1
# Script for generating new migrations in vocabulary-service

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName
)

Write-Host "Generating migration: $MigrationName" -ForegroundColor Cyan

# Check that we are in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Make sure you are in the vocabulary-service directory" -ForegroundColor Red
    exit 1
}

# Generate migration
try {
    Write-Host "Executing command: npm run migration:generate" -ForegroundColor Yellow
    npm run migration:generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Migration generated!" -ForegroundColor Green
        Write-Host "Check the file in src/migrations/ folder" -ForegroundColor Gray
    } else {
        Write-Host "ERROR: Migration generation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR occurred: $_" -ForegroundColor Red
}

# Show list of migrations
Write-Host "`nCurrent migrations:" -ForegroundColor Blue
Get-ChildItem -Path "src/migrations" -Filter "*.ts" | Sort-Object Name | ForEach-Object {
    Write-Host "   $($_.Name)" -ForegroundColor Gray
}

Write-Host "`nTo apply migration use: .\run-migration.ps1" -ForegroundColor Cyan
