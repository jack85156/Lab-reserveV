@echo off
echo Starting local web server...
echo.
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try py launcher first (Windows standard)
py -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    REM Try python command
    python -m http.server 8000 2>nul
    if %errorlevel% neq 0 (
        REM Try Python 2
        python -m SimpleHTTPServer 8000 2>nul
        if %errorlevel% neq 0 (
            echo.
            echo ERROR: Python not found!
            echo Please install Python from https://www.python.org/
            echo.
            pause
        )
    )
)





