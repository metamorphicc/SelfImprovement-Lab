@echo off
setlocal
cd /d "%~dp0"

cmd /c npm run typecheck
if errorlevel 1 (
  echo Typecheck failed.
  exit /b 1
)

call Build-Desktop.bat
if errorlevel 1 exit /b 1

call Build-Installer.bat
if errorlevel 1 exit /b 1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Compress-Archive -Path 'dist\SelfImprovementLabs.exe','README.md' -DestinationPath 'dist\SelfImprovementLabs-0.1.0-Portable.zip' -Force; " ^
  "$files = Get-Item 'dist\SelfImprovementLabs.exe','dist\SelfImprovementLabs-0.1.0-Setup.exe','dist\SelfImprovementLabs-0.1.0-Portable.zip'; " ^
  "$files | Get-FileHash -Algorithm SHA256 | ForEach-Object { '{0}  {1}' -f $_.Hash, $_.Path.Split('\')[-1] } | Set-Content -Encoding ASCII 'dist\SHA256SUMS.txt'"

if errorlevel 1 (
  echo Release archive or checksums failed.
  exit /b 1
)

echo.
echo Release artifacts:
echo   dist\SelfImprovementLabs.exe
echo   dist\SelfImprovementLabs-0.1.0-Setup.exe
echo   dist\SelfImprovementLabs-0.1.0-Portable.zip
echo   dist\SHA256SUMS.txt
