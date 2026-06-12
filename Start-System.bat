@echo off
setlocal
cd /d "%~dp0"
if not exist "dist\SelfImprovementLabs.exe" (
  if exist "dist\SelfImprovementLabs-preview.exe" (
    start "" "%~dp0dist\SelfImprovementLabs-preview.exe"
    exit /b 0
  ) else (
    call Build-Desktop.bat
    if errorlevel 1 exit /b 1
  )
)
start "" "%~dp0dist\SelfImprovementLabs.exe"
