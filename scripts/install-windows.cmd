@echo off
:: ==============================================================================
:: VaporSphere - Windows Batch .EXE Installer & Setup Assistant
:: Supports: Automatic GitHub Release .exe detection, direct download, and local setup
:: Usage:
::   install-windows.cmd [owner/repo]
:: ==============================================================================

setlocal enabledelayedexpansion

echo ======================================================
echo   VaporSphere Dialectical Lab - Windows .EXE Setup
echo ======================================================
echo.

:: 1. Dynamic Repository Detection
set REPO_SLUG=%~1
if "%REPO_SLUG%"=="" set REPO_SLUG=%VAPORSPHERE_REPO%
if "%REPO_SLUG%"=="" set REPO_SLUG=%GITHUB_REPOSITORY%

if "%REPO_SLUG%"=="" (
    :: Check if git remote origin is available locally
    for /f "tokens=*" %%i in ('git config --get remote.origin.url 2^>nul') do set GIT_URL=%%i
    if not "!GIT_URL!"=="" (
        for /f "tokens=2 delims=:" %%a in ("!GIT_URL!") do (
            set PART=%%a
            set REPO_SLUG=!PART:.git=!
        )
        if "!REPO_SLUG!"=="" (
            for /f "tokens=4,5 delims=/" %%a in ("!GIT_URL!") do (
                set REPO_SLUG=%%a/%%b
                set REPO_SLUG=!REPO_SLUG:.git=!
            )
        )
    )
)

if "%REPO_SLUG%"=="" set REPO_SLUG=vaporsphere/vaporsphere

echo [*] Target Repository: !REPO_SLUG!
set TEMP_DIR=%TEMP%\VaporSphereSetup_%RANDOM%
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

:: 2. Query GitHub Releases dynamically via PowerShell for real downloadable .exe assets
set PS_SCRIPT=%TEMP_DIR%\fetch_release.ps1
(
echo $Repo = "!REPO_SLUG!"
echo $TempDir = "!TEMP_DIR!"
echo Write-Host "[*] Querying GitHub API for latest releases of $Repo..." -ForegroundColor Cyan
echo [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
echo $ApiUrl = "https://api.github.com/repos/$Repo/releases/latest"
echo try {
echo     $Release = Invoke-RestMethod -Uri $ApiUrl -Method Get -Headers @{ 'User-Agent' = 'VaporSphere-Installer' } -ErrorAction Stop
echo     $ExeAsset = $Release.assets ^| Where-Object { $_.name -like '*setup.exe' -or $_.name -like '*.exe' } ^| Select-Object -First 1
echo     if ($ExeAsset) {
echo         Write-Host "[v] Found release installer asset: $($ExeAsset.name)" -ForegroundColor Green
echo         $TargetFile = Join-Path $TempDir $ExeAsset.name
echo         Invoke-WebRequest -Uri $ExeAsset.browser_download_url -OutFile $TargetFile -UseBasicParsing
echo         Write-Host "[*] Launching installer: $($ExeAsset.name)..." -ForegroundColor Green
echo         Start-Process -FilePath $TargetFile -Wait
echo         exit 0
echo     } else {
echo         Write-Host "[!] No .exe installer asset found in latest release of $Repo." -ForegroundColor Yellow
echo     }
echo } catch {
echo     Write-Host "[!] Could not fetch from GitHub Releases: $_" -ForegroundColor DarkYellow
echo }
echo exit 1
) > "%PS_SCRIPT%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
set PS_RESULT=%ERRORLEVEL%

if %PS_RESULT% equ 0 (
    echo.
    echo ======================================================
    echo   [v] VaporSphere Windows Installation Finished!
    echo ======================================================
    goto cleanup
)

:: 3. Graceful Fallback if release asset is not yet published on GitHub
echo.
echo [*] Release executable not yet published on GitHub Releases for '!REPO_SLUG!'.
echo [*] Checking local environment for immediate startup...

if exist "%~dp0..\dist\index.html" (
    echo [v] Local application bundle detected!
    echo [*] Creating Desktop Shortcut...
    powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'VaporSphere.lnk')); $s.TargetPath = '%~dp0..\dist\index.html'; $s.Description = 'VaporSphere Dialectical Research Lab'; $s.Save()"
    echo [*] Opening VaporSphere in default browser...
    start "" "%~dp0..\dist\index.html"
) else (
    echo [*] To build the Windows installer locally, run:
    echo       npm install
    echo       npm run build
    echo       npm run tauri build
    echo [*] Or push your code with a tag (e.g. git tag v0.2.0 ^&^& git push --tags)
    echo     to trigger the automated Windows GitHub Release workflow.
)

:cleanup
rmdir /s /q "%TEMP_DIR%" 2>nul
echo.
pause
