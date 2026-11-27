@echo off
echo ========================================================
echo   Starting Sentinel Geo-Fence Safety & Compliance Engine
echo ========================================================
start "Sentinel Backend" cmd /c "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "Sentinel Frontend" cmd /c "%~dp0start_frontend.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5173/
echo Services started.
