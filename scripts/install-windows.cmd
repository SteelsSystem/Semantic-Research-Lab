@echo off
:: ==============================================================================
:: VaporSphere - Windows Batch .EXE Installer
:: Can be run directly by double-clicking in File Explorer or from Command Prompt
:: ==============================================================================

setlocal enabledelayedexpansion

echo ======================================================
echo   VaporSphere Dialectical Lab - Windows .EXE Setup
echo ======================================================
echo.

set REPO_OWNER=vaporsphere
set REPO_NAME=vaporsphere
set VERSION=0.2.0
set EXE_NAME=VaporSphere_%VERSION%_x64-setup.exe
set DOWNLOAD_URL=https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/v%VERSION%/%EXE_NAME%
set TEMP_DIR=%TEMP%\VaporSphereSetup

if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
set TARGET_EXE=%TEMP_DIR%\%EXE_NAME%

echo [*] Downloading VaporSphere Windows .EXE Setup Installer...
echo     URL: %DOWNLOAD_URL%
echo.

:: Try curl first (built into Windows 10/11)
where curl >nul 2>&1
if %ERRORLEVEL% equ 0 (
    curl -fL --progress-bar "%DOWNLOAD_URL%" -o "%TARGET_EXE%"
) else (
    :: Fallback to PowerShell Invoke-WebRequest
    powershell -NoProfile -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TARGET_EXE%' -UseBasicParsing"
)

if exist "%TARGET_EXE%" (
    echo.
    echo [*] Launching VaporSphere .EXE Installer...
    start "" "%TARGET_EXE%"
    echo [v] Setup wizard launched. Follow the on-screen steps to complete installation.
) else (
    echo.
    echo [!] Release binary could not be downloaded automatically.
    echo     Please visit: https://github.com/%REPO_OWNER%/%REPO_NAME%/releases
)

echo.
pause
