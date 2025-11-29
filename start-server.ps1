# PowerShell script to start a local web server
Write-Host "Starting local web server..." -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser and go to: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
try {
    python --version | Out-Null
    Write-Host "Using Python HTTP server..." -ForegroundColor Cyan
    python -m http.server 8000
} catch {
    # Try Node.js if available
    try {
        node --version | Out-Null
        Write-Host "Using Node.js HTTP server..." -ForegroundColor Cyan
        npx -y http-server -p 8000 -c-1
    } catch {
        Write-Host "ERROR: Neither Python nor Node.js found!" -ForegroundColor Red
        Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
        Write-Host "Or install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
    }
}








