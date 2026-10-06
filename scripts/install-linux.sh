#!/usr/bin/env bash
# ==============================================================================
# VaporSphere - Linux Installation Script (First-Class CachyOS & Arch Support)
# Supports: Dynamic GitHub Release asset discovery, AppImage, deb, and local fallback
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/<user>/<repo>/main/scripts/install-linux.sh | bash
# Or:
#   ./scripts/install-linux.sh [owner/repo]
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
RESET="\033[0m"

echo -e "${CYAN}${BOLD}>>> VaporSphere Linux Installer (CachyOS / Arch / Ubuntu / Fedora)${RESET}"
echo -e "Target Repository: ${BOLD}${REPO_INPUT}${RESET}"

# Detect distribution
DISTRO="generic"
DISTRO_LIKE="generic"
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

# 2. Package Manager Dependency Resolution
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
        sudo apt-get install -y -qq libwebkit2gtk-4.1-0 libayatana-appindicator3-1 libssl3 curl || true
    fi
elif [[ "${DISTRO}" == "fedora" ]]; then
    echo -e "\n[Fedora Environment Detected]"
    if command -v sudo &>/dev/null && command -v dnf &>/dev/null; then
        sudo dnf install -y webkit2gtk4.1 libayatana-appindicator openssl curl || true
    fi
fi

mkdir -p "${INSTALL_DIR}" "${DESKTOP_DIR}" "${ICON_DIR}"
TARGET_PATH="${INSTALL_DIR}/${BIN_NAME}"

# 3. Query GitHub API for Real Assets
echo -e "\n[*] Querying GitHub Releases for ${BOLD}${REPO_INPUT}${RESET}..."
RELEASE_JSON="$(curl -s "https://api.github.com/repos/${REPO_INPUT}/releases/latest" 2>/dev/null || true)"

DOWNLOADED=false

if [[ -n "${RELEASE_JSON}" && "${RELEASE_JSON}" != *"Not Found"* ]]; then
    # Look for AppImage URL in release assets
    APPIMAGE_URL="$(echo "${RELEASE_JSON}" | grep -o 'https://[^"]*\.AppImage' | head -n 1 || true)"
    if [[ -n "${APPIMAGE_URL}" ]]; then
        echo -e "Found release asset: ${CYAN}${APPIMAGE_URL}${RESET}"
        if curl -fL --progress-bar "${APPIMAGE_URL}" -o "${TARGET_PATH}"; then
            chmod +x "${TARGET_PATH}"
            DOWNLOADED=true
            echo -e "${GREEN}✓ Successfully downloaded VaporSphere AppImage binary.${RESET}"
        fi
    fi
fi

# Fallback: check if local app bundle exists or create local runner
if [ "$DOWNLOADED" = false ]; then
    echo -e "${YELLOW}Notice: Release AppImage binary not yet published on GitHub for '${REPO_INPUT}'.${RESET}"
    echo -e "Configuring local launcher wrapper..."
    cat << 'EOF' > "${TARGET_PATH}"
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Starting VaporSphere Dialectical Lab..."
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
if [ -f "$(dirname "$0")/../src-tauri/icons/128x128@2x.png" ]; then
    cp "$(dirname "$0")/../src-tauri/icons/128x128@2x.png" "${ICON_DIR}/vaporsphere.png" 2>/dev/null || true
elif [ -f "$(dirname "$0")/../public/favicon.ico" ]; then
    cp "$(dirname "$0")/../public/favicon.ico" "${ICON_DIR}/vaporsphere.png" 2>/dev/null || true
fi

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
