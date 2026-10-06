# ==============================================================================
# VaporSphere - Windows PowerShell Installation Script
# Supports: Dynamic GitHub Release discovery, NSIS .EXE, MSI, and Portable setups
# Usage:
#   irm https://raw.githubusercontent.com/<user>/<repo>/main/scripts/install-windows.ps1 | iex
# Or:
#   powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Repo "owner/repo"
# ==============================================================================

param (
    [string]$Repo = $env:GITHUB_REPOSITORY,
    [string]$Tag = "",
    [switch]$ForceLocal
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Continue"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  VaporSphere Dialectical Lab - Windows .EXE Installer " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve Target GitHub Repository Dynamically
if (-not $Repo) {
    if ($env:VAPORSPHERE_REPO) {
        $Repo = $env:VAPORSPHERE_REPO
    } else {
        try {
            $gitOrigin = git config --get remote.origin.url 2>$null
            if ($gitOrigin -match "github\.com[:/]([^/]+)/([^/.]+?)(\.git)?$") {
                $Repo = "$($Matches[1])/$($Matches[2])"
            }
        } catch {}
    }
}

if (-not $Repo) {
    $Repo = "vaporsphere/vaporsphere"
}

Write-Host "Target GitHub Repository: $Repo" -ForegroundColor DarkGray

$InstallDir = "$env:LOCALAPPDATA\Programs\VaporSphere"
$TempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "VaporSphereSetup_" + [System.Guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

$Installed = $false

try {
    # 2. Query GitHub Releases API for Real Published Assets
    Write-Host "Querying GitHub Releases for $Repo..." -ForegroundColor Yellow
    $ApiUrl = if ($Tag) {
        "https://api.github.com/repos/$Repo/releases/tags/$Tag"
    } else {
        "https://api.github.com/repos/$Repo/releases/latest"
    }

    $Release = $null
    try {
        $Release = Invoke-RestMethod -Uri $ApiUrl -Method Get -Headers @{ "User-Agent" = "VaporSphere-Installer" }
    } catch {
        Write-Host "Notice: Could not retrieve release metadata from $ApiUrl ($($_.Exception.Message))" -ForegroundColor DarkYellow
    }

    if ($Release -and $Release.assets) {
        Write-Host "Found release: $($Release.name) ($($Release.tag_name))" -ForegroundColor Green

        # Look for Windows NSIS Setup .exe
        $ExeAsset = $Release.assets | Where-Object { $_.name -like "*setup.exe" -or $_.name -like "*.exe" } | Select-Object -First 1
        # Look for MSI
        $MsiAsset = $Release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
        # Look for portable ZIP
        $ZipAsset = $Release.assets | Where-Object { $_.name -like "*win*.zip" -or $_.name -like "*windows*.zip" -or $_.name -like "*.zip" } | Select-Object -First 1

        if ($ExeAsset) {
            Write-Host "Downloading Windows Setup Wizard: $($ExeAsset.name)..." -ForegroundColor Cyan
            $ExePath = Join-Path $TempDir $ExeAsset.name
            Invoke-WebRequest -Uri $ExeAsset.browser_download_url -OutFile $ExePath -UseBasicParsing
            if (Test-Path $ExePath) {
                Write-Host "Launching installer: $($ExeAsset.name)..." -ForegroundColor Green
                Start-Process -FilePath $ExePath -Wait
                $Installed = $true
            }
        } elseif ($MsiAsset) {
            Write-Host "Downloading MSI package: $($MsiAsset.name)..." -ForegroundColor Cyan
            $MsiPath = Join-Path $TempDir $MsiAsset.name
            Invoke-WebRequest -Uri $MsiAsset.browser_download_url -OutFile $MsiPath -UseBasicParsing
            if (Test-Path $MsiPath) {
                Write-Host "Installing MSI package: $($MsiAsset.name)..." -ForegroundColor Green
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$MsiPath`" /quiet /norestart" -Wait
                $Installed = $true
            }
        } elseif ($ZipAsset) {
            Write-Host "Downloading portable ZIP package: $($ZipAsset.name)..." -ForegroundColor Cyan
            $ZipPath = Join-Path $TempDir $ZipAsset.name
            Invoke-WebRequest -Uri $ZipAsset.browser_download_url -OutFile $ZipPath -UseBasicParsing
            if (Test-Path $ZipPath) {
                Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
                $Installed = $true
            }
        }
    }

    # 3. Fallback: If no pre-built GitHub release exists yet, handle locally
    if (-not $Installed) {
        Write-Host ""
        Write-Host "GitHub release binary is not yet published for $Repo." -ForegroundColor Yellow
        Write-Host "Configuring local application environment..." -ForegroundColor DarkGray

        $LocalDist = Join-Path (Split-Path -Parent $PSScriptRoot) "dist\index.html"
        if (-not (Test-Path $LocalDist)) {
            $LocalDist = Join-Path $PWD "dist\index.html"
        }

        # Create Desktop Shortcut
        $WshShell = New-Object -ComObject WScript.Shell
        $DesktopShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "VaporSphere.lnk")
        $Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)

        if (Test-Path $LocalDist) {
            $Shortcut.TargetPath = $LocalDist
            $Shortcut.Description = "VaporSphere Dialectical Research Lab"
            $Shortcut.Save()
            Write-Host "✓ Created Desktop Shortcut: VaporSphere" -ForegroundColor Green
            Write-Host "Launching local application..." -ForegroundColor Cyan
            Start-Process $LocalDist
            $Installed = $true
        } else {
            Write-Host "To build the release locally:" -ForegroundColor White
            Write-Host "  1. npm install" -ForegroundColor Cyan
            Write-Host "  2. npm run build" -ForegroundColor Cyan
            Write-Host "  3. npm run tauri build" -ForegroundColor Cyan
            Write-Host "To trigger GitHub releases, push to GitHub with the updated release workflow." -ForegroundColor White
        }
    }

    if ($Installed) {
        Write-Host ""
        Write-Host "======================================================" -ForegroundColor Cyan
        Write-Host "  ✓ VaporSphere Setup Completed Successfully!           " -ForegroundColor Green
        Write-Host "======================================================" -ForegroundColor Cyan
    }

} finally {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}
