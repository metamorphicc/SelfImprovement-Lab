@echo off
setlocal
cd /d "%~dp0"
cmd /c npm run build:desktop:bundle
if errorlevel 1 (
  echo Installer build failed.
  exit /b 1
)

if not exist dist mkdir dist
set "INSTALLER_FOUND="
for /r "apps\desktop\src-tauri\target\release\bundle\nsis" %%F in (*-setup.exe) do (
  copy /Y "%%~fF" "dist\SelfImprovementLabs-0.1.0-Setup.exe" > nul
  set "INSTALLER_FOUND=1"
)

if not defined INSTALLER_FOUND (
  echo NSIS installer was not found.
  exit /b 1
)

echo Built dist\SelfImprovementLabs-0.1.0-Setup.exe
