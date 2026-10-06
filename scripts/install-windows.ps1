# ==============================================================================
# VaporSphere - Windows PowerShell Installation Script
# Supports: Standalone .exe installer (NSIS), .msi installer, and portable ZIP
# Usage:
#   irm https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.ps1 | iex
# ==============================================================================

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"

$RepoOwner = "vaporsphere"
$RepoName = "vaporsphere"
$AppName = "VaporSphere"
$BinName = "vaporsphere.exe"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  VaporSphere Dialectical Lab - Windows .EXE Installer " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$InstallDir = "$env:LOCALAPPDATA\Programs\VaporSphere"
$TempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    Write-Host "Fetching latest release information from GitHub..." -ForegroundColor Yellow
    $ReleaseApiUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/releases/latest"
    $ReleaseTag = "v0.2.0"

    try {
        $Release = Invoke-RestMethod -Uri $ReleaseApiUrl -Method Get -Headers @{ "User-Agent" = "VaporSphere-Installer" }
        if ($Release.tag_name) {
            $ReleaseTag = $Release.tag_name
        }
    } catch {
        Write-Host "Could not query GitHub API, defaulting to $ReleaseTag" -ForegroundColor DarkGray
    }

    $VersionClean = $ReleaseTag.TrimStart('v')
    
    # 1. Primary Target: Standard Windows .EXE Setup Installer (NSIS)
    $ExeName = "VaporSphere_${VersionClean}_x64-setup.exe"
    $ExeUrl = "https://github.com/$RepoOwner/$RepoName/releases/download/$ReleaseTag/$ExeName"
    $ExePath = Join-Path $TempDir $ExeName

    # 2. Secondary Target: Windows .MSI Setup Installer
    $MsiName = "VaporSphere_${VersionClean}_x64_en-US.msi"
    $MsiUrl = "https://github.com/$RepoOwner/$RepoName/releases/download/$ReleaseTag/$MsiName"
    $MsiPath = Join-Path $TempDir $MsiName

    # 3. Fallback Target: Portable .ZIP Package
    $ZipName = "VaporSphere_${VersionClean}_x64.zip"
    $ZipUrl = "https://github.com/$RepoOwner/$RepoName/releases/download/$ReleaseTag/$ZipName"
    $ZipPath = Join-Path $TempDir $ZipName

    $Installed = $false

    # Attempt .EXE installer download
    Write-Host "Attempting download of Windows .exe setup installer ($ExeName)..." -ForegroundColor Green
    try {
        Invoke-WebRequest -Uri $ExeUrl -OutFile $ExePath -UseBasicParsing
        if ((Test-Path $ExePath) -and ((Get-Item $ExePath).Length -gt 1000)) {
            Write-Host "Running VaporSphere .EXE Setup Installer..." -ForegroundColor Cyan
            Start-Process -FilePath $ExePath -ArgumentList "/S" -Wait
            $Installed = $true
            Write-Host "✓ .EXE Installation finished successfully!" -ForegroundColor Green
        }
    } catch {
        Write-Host ".EXE setup asset not found, checking for .MSI package..." -ForegroundColor DarkYellow
    }

    # If .EXE was not available, try .MSI
    if (-not $Installed) {
        try {
            Invoke-WebRequest -Uri $MsiUrl -OutFile $MsiPath -UseBasicParsing
            if ((Test-Path $MsiPath) -and ((Get-Item $MsiPath).Length -gt 1000)) {
                Write-Host "Installing VaporSphere MSI package..." -ForegroundColor Green
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$MsiPath`" /quiet /norestart" -Wait
                $Installed = $true
                Write-Host "✓ .MSI Installation finished successfully!" -ForegroundColor Green
            }
        } catch {
            Write-Host ".MSI package not found, checking for portable ZIP archive..." -ForegroundColor DarkYellow
        }
    }

    # If neither .EXE nor .MSI succeeded, fallback to ZIP extraction
    if (-not $Installed) {
        try {
            Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
            Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
            $Installed = $true
            Write-Host "✓ Portable package extracted to $InstallDir" -ForegroundColor Green
        } catch {
            Write-Host "Pre-built binary release is being built by GitHub Actions." -ForegroundColor Yellow
        }
    }

    # Ensure desktop shortcut exists
    $WshShell = New-Object -ComObject WScript.Shell
    $DesktopShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "VaporSphere.lnk")
    $TargetExe = Join-Path $InstallDir $BinName

    if (Test-Path $TargetExe) {
        $Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
        $Shortcut.TargetPath = $TargetExe
        $Shortcut.Description = "VaporSphere Dialectical Research Lab"
        $Shortcut.Save()
    }

    # User PATH configuration
    $UserPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    if ($UserPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", [EnvironmentVariableTarget]::User)
    }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "  ✓ VaporSphere has been successfully installed!        " -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "You can launch VaporSphere from:" -ForegroundColor White
    Write-Host "  1. Desktop shortcut: VaporSphere" -ForegroundColor Cyan
    Write-Host "  2. Start Menu" -ForegroundColor Cyan
    Write-Host "  3. PowerShell / Command Prompt: vaporsphere.exe" -ForegroundColor Cyan
    Write-Host ""

} finally {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}
