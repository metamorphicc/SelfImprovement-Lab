@echo off
setlocal
cd /d "%~dp0"
cmd /c npm run build:desktop:bundle
