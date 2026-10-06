#!/usr/bin/env bash
# ==============================================================================
# VaporSphere Dialectical Lab - Universal 1-Line Multi-Platform Installer
# Supports: Linux (CachyOS, Arch, Debian, Ubuntu, Fedora), macOS, Windows WSL
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/<user>/<repo>/main/scripts/install.sh | bash
# Or:
#   ./scripts/install.sh [owner/repo]
# ==============================================================================

set -euo pipefail

# 1. Resolve Target Repository Dynamically
REPO_INPUT="${1:-${VAPORSPHERE_REPO:-${GITHUB_REPOSITORY:-}}}"
if [[ -z "${REPO_INPUT}" ]] && command -v git &>/dev/null; then
    GIT_ORIGIN="$(git config --get remote.origin.url 2>/dev/null || true)"
    if [[ "${GIT_ORIGIN}" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)? ]]; then
        REPO_INPUT="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    fi
fi

if [[ -z "${REPO_INPUT}" ]]; then
    REPO_INPUT="vaporsphere/vaporsphere"
fi

BIN_NAME="vaporsphere"
INSTALL_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "  __     __                     ____        _                   "
echo "  \ \   / /_ _ _ __   ___  _ __/ ___| _ __ | |__   ___ _ __ ___ "
echo "   \ \ / / _\` | '_ \ / _ \| '__\___ \| '_ \| '_ \ / _ \ '__/ _ \\"
echo "    \ V / (_| | |_) | (_) | |   ___) | |_) | | | |  __/ | |  __/"
echo "     \_/ \__,_| .__/ \___/|_|  |____/| .__/|_| |_|\___|_|  \___|"
echo "              |_|                    |_|                        "
echo -e "${RESET}"
echo -e "${BOLD}VaporSphere Dialectical Research Lab - Universal Installer${RESET}"
echo -e "Target Repository: ${CYAN}${BOLD}${REPO_INPUT}${RESET}"
echo "------------------------------------------------------------------"

OS_TYPE="$(uname -s)"
ARCH_TYPE="$(uname -m)"

# ------------------------------------------------------------------------------
# 1. macOS Flow
# ------------------------------------------------------------------------------
if [[ "${OS_TYPE}" == "Darwin" ]]; then
    echo -e "${CYAN}[macOS Detected]${RESET} Architecture: ${ARCH_TYPE}"
    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "${TMP_DIR}"' EXIT

    RELEASE_JSON="$(curl -s "https://api.github.com/repos/${REPO_INPUT}/releases/latest" 2>/dev/null || true)"
    DMG_URL=""
    if [[ -n "${RELEASE_JSON}" && "${RELEASE_JSON}" != *"Not Found"* ]]; then
        DMG_URL="$(echo "${RELEASE_JSON}" | grep -o 'https://[^"]*\.dmg' | head -n 1 || true)"
    fi

    if [[ -n "${DMG_URL}" ]]; then
        echo -e "Downloading ${CYAN}${DMG_URL}${RESET}..."
        curl -fL --progress-bar "${DMG_URL}" -o "${TMP_DIR}/VaporSphere.dmg"
        MOUNT_DIR=$(mktemp -d /Volumes/VaporSphere_XXXX)
        hdiutil attach "${TMP_DIR}/VaporSphere.dmg" -mountpoint "${MOUNT_DIR}" -quiet -nobrowse
        rm -rf "/Applications/VaporSphere.app"
        cp -R "${MOUNT_DIR}/VaporSphere.app" "/Applications/"
        hdiutil detach "${MOUNT_DIR}" -quiet
        xattr -dr com.apple.quarantine "/Applications/VaporSphere.app" 2>/dev/null || true

        mkdir -p "${INSTALL_DIR}"
        ln -sf "/Applications/VaporSphere.app/Contents/MacOS/vaporsphere" "${INSTALL_DIR}/${BIN_NAME}"
        echo -e "\n${GREEN}${BOLD}✓ Installation Complete!${RESET}"
        echo -e "Launch from ${BOLD}Spotlight / Applications${RESET} or run: ${CYAN}${BIN_NAME}${RESET}"
        exit 0
    else
        echo -e "${YELLOW}Notice: Prebuilt DMG release not yet uploaded to GitHub.${RESET}"
        open "http://localhost:3000" 2>/dev/null || true
        exit 0
    fi
fi

# ------------------------------------------------------------------------------
# 2. Linux Flow (CachyOS / Arch / Ubuntu)
# ------------------------------------------------------------------------------
if [[ "${OS_TYPE}" == "Linux" ]]; then
    DISTRO="generic"
    DISTRO_LIKE="generic"
    if [[ -f /etc/os-release ]]; then
        DISTRO=$(grep -E '^ID=' /etc/os-release | cut -d= -f2 | tr -d '"')
        DISTRO_LIKE=$(grep -E '^ID_LIKE=' /etc/os-release | cut -d= -f2 | tr -d '"' || true)
    fi

    echo -e "${CYAN}[Linux Detected]${RESET} Distribution: ${BOLD}${DISTRO}${RESET} | Arch: ${ARCH_TYPE}"

    if [[ "${DISTRO}" == "cachyos" || "${DISTRO}" == "arch" || "${DISTRO_LIKE}" =~ arch ]]; then
        echo -e "${GREEN}[CachyOS / Arch Linux Native Mode]${RESET}"
        if command -v pacman &>/dev/null && command -v sudo &>/dev/null; then
            sudo pacman -S --needed --noconfirm webkit2gtk-4.1 libayatana-appindicator openssl curl || true
        fi
    elif [[ "${DISTRO}" == "ubuntu" || "${DISTRO}" == "debian" || "${DISTRO_LIKE}" =~ debian ]]; then
        if command -v apt-get &>/dev/null && command -v sudo &>/dev/null; then
            sudo apt-get update -qq || true
            sudo apt-get install -y -qq libwebkit2gtk-4.1-0 libayatana-appindicator3-1 libssl3 curl || true
        fi
    fi

    mkdir -p "${INSTALL_DIR}" "${DESKTOP_DIR}" "${ICON_DIR}"
    TARGET_BIN="${INSTALL_DIR}/${BIN_NAME}"

    RELEASE_JSON="$(curl -s "https://api.github.com/repos/${REPO_INPUT}/releases/latest" 2>/dev/null || true)"
    APPIMAGE_URL=""
    if [[ -n "${RELEASE_JSON}" && "${RELEASE_JSON}" != *"Not Found"* ]]; then
        APPIMAGE_URL="$(echo "${RELEASE_JSON}" | grep -o 'https://[^"]*\.AppImage' | head -n 1 || true)"
    fi

    if [[ -n "${APPIMAGE_URL}" ]]; then
        echo -e "Downloading ${CYAN}${APPIMAGE_URL}${RESET}..."
        curl -fL --progress-bar "${APPIMAGE_URL}" -o "${TARGET_BIN}"
        chmod +x "${TARGET_BIN}"
    else
        echo -e "${YELLOW}Notice: GitHub Release AppImage not yet published for ${REPO_INPUT}.${RESET}"
        cat << 'EOF' > "${TARGET_BIN}"
#!/usr/bin/env bash
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v sensible-browser &>/dev/null; then
    sensible-browser "http://localhost:3000" &
fi
EOF
        chmod +x "${TARGET_BIN}"
    fi

    # Create .desktop file
    cat << EOF > "${DESKTOP_DIR}/vaporsphere.desktop"
[Desktop Entry]
Name=VaporSphere Dialectical Lab
Comment=Personal Dialectical Research & OKLab Acoustic Engine
Exec=${TARGET_BIN} %U
Icon=vaporsphere
Terminal=false
Type=Application
Categories=Science;AudioVideo;Development;Education;
StartupWMClass=vaporsphere-desktop
Keywords=socratic;dialectics;ai;gemini;dsp;oklab;cachyos;
EOF
    chmod +x "${DESKTOP_DIR}/vaporsphere.desktop"

    echo -e "\n${GREEN}${BOLD}✓ Installation Successfully Completed!${RESET}"
    echo -e "Executable: ${CYAN}${TARGET_BIN}${RESET}"
    echo -e "Desktop Entry: ${BOLD}${DESKTOP_DIR}/vaporsphere.desktop${RESET}"
    exit 0
fi

# ------------------------------------------------------------------------------
# 3. Windows Instruction
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[Windows Detected]${RESET}"
echo -e "Run this in PowerShell to install:"
echo -e "${CYAN}  irm https://raw.githubusercontent.com/${REPO_INPUT}/main/scripts/install-windows.ps1 | iex${RESET}"
