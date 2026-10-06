#!/usr/bin/env bash
# ==============================================================================
# VaporSphere Dialectical Lab - Universal 1-Line Installer
# Supports: Linux (CachyOS, Arch, Debian, Ubuntu, Fedora, AppImage), macOS, Windows (WSL)
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install.sh | bash
# ==============================================================================

set -euo pipefail

REPO_OWNER="vaporsphere"
REPO_NAME="vaporsphere"
APP_NAME="VaporSphere"
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
echo -e "${CYAN}Target Host:${RESET} Standalone Native Desktop (Tauri v2 + Local DSP Engine)"
echo "------------------------------------------------------------------"

OS_TYPE="$(uname -s)"
ARCH_TYPE="$(uname -m)"

# ------------------------------------------------------------------------------
# 1. macOS Installation Flow
# ------------------------------------------------------------------------------
if [[ "${OS_TYPE}" == "Darwin" ]]; then
    echo -e "${CYAN}[macOS Detected]${RESET} Architecture: ${ARCH_TYPE}"
    echo -e "Starting automated macOS desktop bundle installation..."

    # Delegate to dedicated macOS installer or download DMG
    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "${TMP_DIR}"' EXIT

    LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.0")
    if [[ -z "${LATEST_TAG}" || "${LATEST_TAG}" == "null" ]]; then
        LATEST_TAG="v0.2.0"
    fi

    DMG_NAME="VaporSphere_${LATEST_TAG#v}_universal.dmg"
    DMG_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${LATEST_TAG}/${DMG_NAME}"

    echo -e "Downloading ${BOLD}${DMG_NAME}${RESET} (${LATEST_TAG})..."
    if curl -fL --progress-bar "${DMG_URL}" -o "${TMP_DIR}/VaporSphere.dmg"; then
        echo -e "Mounting disk image..."
        MOUNT_DIR=$(mktemp -d /Volumes/VaporSphere_XXXX)
        hdiutil attach "${TMP_DIR}/VaporSphere.dmg" -mountpoint "${MOUNT_DIR}" -quiet -nobrowse

        echo -e "Installing to /Applications..."
        rm -rf "/Applications/VaporSphere.app"
        cp -R "${MOUNT_DIR}/VaporSphere.app" "/Applications/"
        hdiutil detach "${MOUNT_DIR}" -quiet

        echo -e "Removing macOS quarantine gatekeeper attribute..."
        xattr -dr com.apple.quarantine "/Applications/VaporSphere.app" 2>/dev/null || true

        mkdir -p "${INSTALL_DIR}"
        ln -sf "/Applications/VaporSphere.app/Contents/MacOS/vaporsphere" "${INSTALL_DIR}/${BIN_NAME}"

        echo -e "\n${GREEN}${BOLD}✓ Installation Complete!${RESET}"
        echo -e "You can launch VaporSphere from ${BOLD}Spotlight / Launchpad / Applications${RESET} or run:"
        echo -e "${CYAN}  ${BIN_NAME}${RESET}\n"
        exit 0
    else
        echo -e "${YELLOW}Notice: Pre-built release binary not yet published on GitHub.${RESET}"
        echo -e "Falling back to local development build via Node + Tauri CLI..."
        if ! command -v git &>/dev/null || ! command -v npm &>/dev/null; then
            echo -e "${RED}Error: Git and Node.js are required to build from source.${RESET}"
            exit 1
        fi
        git clone "https://github.com/${REPO_OWNER}/${REPO_NAME}.git" "${HOME}/VaporSphere"
        cd "${HOME}/VaporSphere"
        npm install
        npm run build
        echo -e "${GREEN}✓ Ready! Run 'npm run dev' to launch.${RESET}"
        exit 0
    fi
fi

# ------------------------------------------------------------------------------
# 2. Linux Installation Flow (with CachyOS & Arch First-Class Optimization)
# ------------------------------------------------------------------------------
if [[ "${OS_TYPE}" == "Linux" ]]; then
    DISTRO="unknown"
    if [[ -f /etc/os-release ]]; then
        DISTRO=$(grep -E '^ID=' /etc/os-release | cut -d= -f2 | tr -d '"')
        DISTRO_LIKE=$(grep -E '^ID_LIKE=' /etc/os-release | cut -d= -f2 | tr -d '"' || true)
    fi

    echo -e "${CYAN}[Linux Detected]${RESET} Distribution: ${BOLD}${DISTRO}${RESET} | Arch: ${ARCH_TYPE}"

    # Special handling for CachyOS & Arch Linux
    if [[ "${DISTRO}" == "cachyos" || "${DISTRO}" == "arch" || "${DISTRO_LIKE}" =~ arch ]]; then
        echo -e "\n${CYAN}${BOLD}[CachyOS / Arch Linux Native Mode]${RESET}"
        echo -e "CachyOS provides high-performance x86-64-v3/v4 optimized kernels & libraries."

        # Check if yay or paru is available for AUR/local package management
        if command -v yay &>/dev/null || command -v paru &>/dev/null || command -v pacman &>/dev/null; then
            echo -e "Installing necessary runtime dependencies (webkit2gtk-4.1, libayatana-appindicator, openssl)..."
            if command -v sudo &>/dev/null; then
                sudo pacman -S --needed --noconfirm webkit2gtk-4.1 libayatana-appindicator openssl curl || true
            fi
        fi
    fi

    # Ubuntu / Debian dependency resolution
    if [[ "${DISTRO}" == "ubuntu" || "${DISTRO}" == "debian" || "${DISTRO_LIKE}" =~ debian ]]; then
        if command -v apt-get &>/dev/null && command -v sudo &>/dev/null; then
            echo -e "Ensuring Debian/Ubuntu runtime libraries are present..."
            sudo apt-get update -qq || true
            sudo apt-get install -y -qq libwebkit2gtk-4.1-0 libayatana-appindicator3-1 libssl3 curl || true
        fi
    fi

    # Download AppImage or standalone binary
    mkdir -p "${INSTALL_DIR}" "${DESKTOP_DIR}" "${ICON_DIR}"

    LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.0")
    if [[ -z "${LATEST_TAG}" || "${LATEST_TAG}" == "null" ]]; then
        LATEST_TAG="v0.2.0"
    fi

    APPIMAGE_NAME="VaporSphere_${LATEST_TAG#v}_amd64.AppImage"
    APPIMAGE_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${LATEST_TAG}/${APPIMAGE_NAME}"
    TARGET_BIN="${INSTALL_DIR}/${BIN_NAME}"

    echo -e "Downloading ${BOLD}${APPIMAGE_NAME}${RESET} to ${INSTALL_DIR}..."
    if curl -fL --progress-bar "${APPIMAGE_URL}" -o "${TARGET_BIN}"; then
        chmod +x "${TARGET_BIN}"
    else
        echo -e "${YELLOW}Notice: GitHub Release asset not found for ${LATEST_TAG}.${RESET}"
        echo -e "Installing local launcher wrapper..."
        cat << 'EOF' > "${TARGET_BIN}"
#!/usr/bin/env bash
echo "Launching VaporSphere Dialectical Lab..."
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:3000" &
fi
EOF
        chmod +x "${TARGET_BIN}"
    fi

    # Create FreeDesktop .desktop entry for Application Launcher / Rofi / Wofi / KDE / GNOME
    cat << EOF > "${DESKTOP_DIR}/vaporsphere.desktop"
[Desktop Entry]
Name=VaporSphere Dialectical Lab
Comment=Personal Dialectical Research & OKLab Acoustic Engine (Tauri v2)
Exec=${TARGET_BIN} %U
Icon=vaporsphere
Terminal=false
Type=Application
Categories=Science;AudioVideo;Development;Education;
StartupWMClass=vaporsphere-desktop
Keywords=socratic;dialectics;ai;gemini;dsp;oklab;
EOF
    chmod +x "${DESKTOP_DIR}/vaporsphere.desktop"

    # Install Application Icon
    curl -sL "https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/public/favicon.ico" -o "${ICON_DIR}/vaporsphere.png" 2>/dev/null || true

    # Update desktop database
    if command -v update-desktop-database &>/dev/null; then
        update-desktop-database "${DESKTOP_DIR}" 2>/dev/null || true
    fi

    echo -e "\n${GREEN}${BOLD}✓ Installation Successfully Completed!${RESET}"
    echo -e "VaporSphere has been installed to ${CYAN}${TARGET_BIN}${RESET}"
    echo -e "Integrated into your desktop menu: ${BOLD}${DESKTOP_DIR}/vaporsphere.desktop${RESET}"
    echo ""
    echo -e "Run it anytime from your terminal or launcher:"
    echo -e "${CYAN}  ${BIN_NAME}${RESET}"
    echo ""
    if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
        echo -e "${YELLOW}Note:${RESET} Ensure ${BOLD}${INSTALL_DIR}${RESET} is in your PATH. Add this to ~/.bashrc or ~/.zshrc:"
        echo -e "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
    exit 0
fi

# ------------------------------------------------------------------------------
# 3. Windows Fallback Message
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[Windows Detected]${RESET}"
echo -e "Please run the official PowerShell 1-liner in Windows Terminal or PowerShell:"
echo ""
echo -e "${CYAN}  irm https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/scripts/install-windows.ps1 | iex${RESET}"
echo ""
