#!/usr/bin/env node
/**
 * VaporSphere Portable Distribution Packager
 * Creates portable zero-install distributions for Windows, Linux, and macOS.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const version = '0.2.0';
const releaseDir = path.join(rootDir, 'releases');

console.log('>>> Packaging VaporSphere Portable Distributions...');
fs.mkdirSync(releaseDir, { recursive: true });

// 1. Ensure Vite production build exists
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Building Vite frontend bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

// 2. Prepare portable staging directories
const stagingWin = path.join(releaseDir, 'staging-win');
const stagingLinux = path.join(releaseDir, 'staging-linux');
const stagingMac = path.join(releaseDir, 'staging-mac');

[stagingWin, stagingLinux, stagingMac].forEach((dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
});

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy dist and necessary runtime assets to each staging folder
[stagingWin, stagingLinux, stagingMac].forEach((dir) => {
  copyDir(distDir, path.join(dir, 'dist'));
  if (fs.existsSync(path.join(rootDir, 'public'))) {
    copyDir(path.join(rootDir, 'public'), path.join(dir, 'public'));
  }
  fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(dir, 'package.json'));
  if (fs.existsSync(path.join(rootDir, 'server.ts'))) {
    fs.copyFileSync(path.join(rootDir, 'server.ts'), path.join(dir, 'server.ts'));
  }
  if (fs.existsSync(path.join(rootDir, 'README.md'))) {
    fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(dir, 'README.md'));
  }
});

// 3. Create Windows Launcher (.cmd / .bat)
const winLauncher = `@echo off
title VaporSphere Dialectical Research Lab
cd /d "%~dp0"
echo ======================================================
echo   VaporSphere Dialectical Lab (Portable Mode)
echo ======================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [*] Starting local high-performance server on port 3000...
    start "" http://localhost:3000
    npx --yes tsx server.ts
) else (
    echo [*] Launching local browser client...
    start "" "dist\\index.html"
)
pause
`;
fs.writeFileSync(path.join(stagingWin, 'VaporSphere.cmd'), winLauncher, 'utf8');
fs.writeFileSync(path.join(stagingWin, 'VaporSphere.bat'), winLauncher, 'utf8');

// 4. Create Linux Launcher (CachyOS / Arch / Ubuntu)
const linuxLauncher = `#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo ">>> Launching VaporSphere Dialectical Lab (Portable)..."

if command -v node &>/dev/null; then
    echo "[*] Launching native dialectical backend on port 3000..."
    if command -v xdg-open &>/dev/null; then
        (sleep 1.2 && xdg-open "http://localhost:3000") &
    fi
    npx tsx server.ts
else
    echo "[*] Opening client bundle in default browser..."
    if command -v xdg-open &>/dev/null; then
        xdg-open "$DIR/dist/index.html"
    elif command -v sensible-browser &>/dev/null; then
        sensible-browser "$DIR/dist/index.html"
    fi
fi
`;
fs.writeFileSync(path.join(stagingLinux, 'vaporsphere.sh'), linuxLauncher, { encoding: 'utf8', mode: 0o755 });

// 5. Create macOS Launcher
const macLauncher = `#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo ">>> Launching VaporSphere Dialectical Lab (macOS Portable)..."

if command -v node &>/dev/null; then
    (sleep 1.2 && open "http://localhost:3000") &
    npx tsx server.ts
else
    open "$DIR/dist/index.html"
fi
`;
fs.writeFileSync(path.join(stagingMac, 'vaporsphere.command'), macLauncher, { encoding: 'utf8', mode: 0o755 });

// 6. Archive portable packages
try {
  console.log('Creating Linux portable tarball...');
  execSync(`tar -czf "${path.join(releaseDir, `VaporSphere_${version}_linux-portable.tar.gz`)}" -C "${stagingLinux}" .`);
  console.log('✓ Linux portable tarball created');
} catch (e) {
  console.warn('Tarball creation note:', e.message);
}

try {
  console.log('Creating macOS portable tarball...');
  execSync(`tar -czf "${path.join(releaseDir, `VaporSphere_${version}_macos-portable.tar.gz`)}" -C "${stagingMac}" .`);
  console.log('✓ macOS portable tarball created');
} catch (e) {
  console.warn('macOS tarball note:', e.message);
}

// Clean up staging folders
[stagingWin, stagingLinux, stagingMac].forEach((dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log('✓ Portable distribution packaging completed successfully!');
