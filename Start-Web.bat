@echo off
setlocal
cd /d "%~dp0"
echo Starting Next.js web app...
echo.
echo Open this URL in your browser:
echo http://localhost:3000
echo.
cmd /c npm run dev:web
