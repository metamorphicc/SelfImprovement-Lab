@echo off
setlocal
cd /d "%~dp0"
cmd /c npm run build:desktop
if errorlevel 1 (
  echo Desktop build failed.
  exit /b 1
)
if not exist dist mkdir dist
copy /Y "apps\desktop\src-tauri\target\release\self-improvement-labs.exe" "dist\SelfImprovementLabs.exe" > nul
echo Built dist\SelfImprovementLabs.exe
