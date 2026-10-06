#!/usr/bin/env bash
# ==============================================================================
# VaporSphere - Linux Installation Script (First-Class CachyOS & Arch Support)
# ==============================================================================

set -euo pipefail

REPO_OWNER="vaporsphere"
REPO_NAME="vaporsphere"
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

echo -e "${CYAN}${BOLD}>>> VaporSphere Linux Installer (CachyOS / Arch / Ubuntu / Fedora)${RESET}"

# Detect distribution
DISTRO="generic"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO="${ID:-generic}"
    DISTRO_LIKE="${ID_LIKE:-generic}"
fi

# Detect CPU Microarchitecture Level for CachyOS performance
CPU_LEVEL="x86-64"
if grep -q "avx512" /proc/cpuinfo 2>/dev/null; then
    CPU_LEVEL="x86-64-v4"
elif grep -q "avx2" /proc/cpuinfo 2>/dev/null; then
    CPU_LEVEL="x86-64-v3"
elif grep -q "sse4_2" /proc/cpuinfo 2>/dev/null; then
    CPU_LEVEL="x86-64-v2"
fi

echo -e "OS: ${BOLD}${DISTRO}${RESET} | Architecture: $(uname -m) | CPU Microarch: ${CYAN}${CPU_LEVEL}${RESET}"

# 1. Package Manager Dependency Resolution
if [[ "${DISTRO}" == "cachyos" || "${DISTRO}" == "arch" || "${DISTRO_LIKE}" =~ arch ]]; then
    echo -e "\n${GREEN}[CachyOS / Arch Linux Native Environment Detected]${RESET}"
    echo -e "Checking native dependencies via pacman..."
    PACKAGES="webkit2gtk-4.1 libayatana-appindicator openssl curl"
    if command -v pacman &>/dev/null; then
        if command -v sudo &>/dev/null; then
            echo -e "Installing required system libraries (requires sudo):"
            sudo pacman -S --needed --noconfirm ${PACKAGES} || true
        else
            echo -e "${YELLOW}Please ensure you have: ${PACKAGES}${RESET}"
        fi
    fi
elif [[ "${DISTRO}" == "ubuntu" || "${DISTRO}" == "debian" || "${DISTRO_LIKE}" =~ debian ]]; then
    echo -e "\n[Debian / Ubuntu Environment Detected]"
    if command -v sudo &>/dev/null && command -v apt-get &>/dev/null; then
        sudo apt-get update -qq || true
        sudo apt-get install -y -qq libwebkit2gtk-4.1-0 libayatana-appindicator3-1 libssl3 curl
    fi
elif [[ "${DISTRO}" == "fedora" ]]; then
    echo -e "\n[Fedora Environment Detected]"
    if command -v sudo &>/dev/null && command -v dnf &>/dev/null; then
        sudo dnf install -y webkit2gtk4.1 libayatana-appindicator openssl curl || true
    fi
fi

# 2. Setup Directories
mkdir -p "${INSTALL_DIR}" "${DESKTOP_DIR}" "${ICON_DIR}"

# 3. Retrieve Latest Release
LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.0")
if [[ -z "${LATEST_TAG}" || "${LATEST_TAG}" == "null" ]]; then
    LATEST_TAG="v0.2.0"
fi

APPIMAGE_NAME="VaporSphere_${LATEST_TAG#v}_amd64.AppImage"
APPIMAGE_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${LATEST_TAG}/${APPIMAGE_NAME}"
TARGET_PATH="${INSTALL_DIR}/${BIN_NAME}"

echo -e "Fetching latest release binary (${LATEST_TAG})..."
if curl -fL --progress-bar "${APPIMAGE_URL}" -o "${TARGET_PATH}"; then
    chmod +x "${TARGET_PATH}"
    echo -e "${GREEN}✓ Successfully downloaded VaporSphere AppImage binary.${RESET}"
else
    echo -e "${YELLOW}Notice: Release bundle not yet uploaded on GitHub Releases.${RESET}"
    echo -e "Creating local launcher script for immediate use..."
    cat << 'EOF' > "${TARGET_PATH}"
#!/usr/bin/env bash
echo "Starting VaporSphere..."
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v sensible-browser &>/dev/null; then
    sensible-browser "http://localhost:3000" &
fi
EOF
    chmod +x "${TARGET_PATH}"
fi

# 4. Desktop Integration (.desktop file)
cat << EOF > "${DESKTOP_DIR}/vaporsphere.desktop"
[Desktop Entry]
Name=VaporSphere Dialectical Lab
GenericName=Dialectical AI Research Tool
Comment=Personal-Use Socratic Dialectics & OKLab Particle Acoustics
Exec=${TARGET_PATH} %U
Icon=vaporsphere
Terminal=false
Type=Application
Categories=Science;AudioVideo;Development;Education;
StartupWMClass=vaporsphere-desktop
Keywords=socratic;dialectics;ai;gemini;dsp;oklab;cachyos;
EOF
chmod +x "${DESKTOP_DIR}/vaporsphere.desktop"

# Icon installation
curl -sL "https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/public/favicon.ico" -o "${ICON_DIR}/vaporsphere.png" 2>/dev/null || true

if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "${DESKTOP_DIR}" 2>/dev/null || true
fi

echo -e "\n${GREEN}${BOLD}✓ VaporSphere is installed and ready on Linux!${RESET}"
echo -e "Executable location: ${CYAN}${TARGET_PATH}${RESET}"
echo -e "Desktop menu entry:  ${BOLD}${DESKTOP_DIR}/vaporsphere.desktop${RESET}"
echo ""
echo -e "Launch it from application launcher or terminal:"
echo -e "  ${CYAN}${BIN_NAME}${RESET}"
echo ""
