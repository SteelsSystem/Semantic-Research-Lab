#!/usr/bin/env bash
# ==============================================================================
# VaporSphere - macOS Installation Script (Apple Silicon & Intel)
# Supports: Dynamic GitHub Release DMG discovery, quarantine bypass, and CLI link
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/<user>/<repo>/main/scripts/install-macos.sh | bash
# Or:
#   ./scripts/install-macos.sh [owner/repo]
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

APP_NAME="VaporSphere.app"
BIN_NAME="vaporsphere"
TARGET_DIR="/Applications"
CLI_DIR="/usr/local/bin"
USER_CLI_DIR="${HOME}/.local/bin"

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}>>> VaporSphere macOS Installer${RESET}"
echo -e "Target Repository: ${BOLD}${REPO_INPUT}${RESET}"

ARCH="$(uname -m)"
echo -e "System: macOS ($(sw_vers -productVersion 2>/dev/null || echo "Darwin")) | Architecture: ${BOLD}${ARCH}${RESET}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

# 2. Query GitHub Releases for Published DMG Asset
echo -e "\n[*] Checking GitHub Releases for ${BOLD}${REPO_INPUT}${RESET}..."
RELEASE_JSON="$(curl -s "https://api.github.com/repos/${REPO_INPUT}/releases/latest" 2>/dev/null || true)"

DMG_URL=""
if [[ -n "${RELEASE_JSON}" && "${RELEASE_JSON}" != *"Not Found"* ]]; then
    DMG_URL="$(echo "${RELEASE_JSON}" | grep -o 'https://[^"]*\.dmg' | head -n 1 || true)"
fi

INSTALLED=false

if [[ -n "${DMG_URL}" ]]; then
    DMG_PATH="${TMP_DIR}/VaporSphere.dmg"
    echo -e "Downloading ${BOLD}${DMG_URL}${RESET}..."
    if curl -fL --progress-bar "${DMG_URL}" -o "${DMG_PATH}"; then
        echo -e "Mounting disk image..."
        MOUNT_DIR=$(mktemp -d /Volumes/VaporSphere_XXXX)
        hdiutil attach "${DMG_PATH}" -mountpoint "${MOUNT_DIR}" -quiet -nobrowse

        echo -e "Installing into ${TARGET_DIR}..."
        rm -rf "${TARGET_DIR}/${APP_NAME}"
        cp -R "${MOUNT_DIR}/${APP_NAME}" "${TARGET_DIR}/"
        hdiutil detach "${MOUNT_DIR}" -quiet

        echo -e "Clearing macOS quarantine attributes..."
        xattr -dr com.apple.quarantine "${TARGET_DIR}/${APP_NAME}" 2>/dev/null || true

        # Create CLI symlink
        if [ -d "${CLI_DIR}" ] && [ -w "${CLI_DIR}" ]; then
            ln -sf "${TARGET_DIR}/${APP_NAME}/Contents/MacOS/vaporsphere" "${CLI_DIR}/${BIN_NAME}"
        else
            mkdir -p "${USER_CLI_DIR}"
            ln -sf "${TARGET_DIR}/${APP_NAME}/Contents/MacOS/vaporsphere" "${USER_CLI_DIR}/${BIN_NAME}"
        fi
        INSTALLED=true
    fi
fi

if [ "$INSTALLED" = true ]; then
    echo -e "\n${GREEN}${BOLD}✓ VaporSphere Successfully Installed on macOS!${RESET}"
    echo -e "Location: ${BOLD}${TARGET_DIR}/${APP_NAME}${RESET}"
    echo -e "You can launch VaporSphere from ${CYAN}Spotlight, Launchpad, or Terminal via '${BIN_NAME}'${RESET}\n"
else
    echo -e "${YELLOW}Notice: Prebuilt DMG release not yet found for ${REPO_INPUT}.${RESET}"
    echo -e "You can launch the local web client with: open http://localhost:3000"
    open "http://localhost:3000" 2>/dev/null || true
fi
