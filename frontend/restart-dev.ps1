# Script để restart dev server với cache cleared
Write-Host "Stopping any running Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Clearing cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue

Write-Host "Starting dev server..." -ForegroundColor Green
npm start

