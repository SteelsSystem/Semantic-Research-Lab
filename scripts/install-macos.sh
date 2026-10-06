#!/usr/bin/env bash
# ==============================================================================
# VaporSphere - macOS Installation Script (Apple Silicon & Intel)
# ==============================================================================

set -euo pipefail

REPO_OWNER="vaporsphere"
REPO_NAME="vaporsphere"
APP_NAME="VaporSphere.app"
BIN_NAME="vaporsphere"
TARGET_DIR="/Applications"
CLI_DIR="/usr/local/bin"
USER_CLI_DIR="${HOME}/.local/bin"

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}>>> VaporSphere macOS Installer${RESET}"

ARCH="$(uname -m)"
echo -e "System: macOS ($(sw_vers -productVersion 2>/dev/null || echo "Darwin")) | Architecture: ${BOLD}${ARCH}${RESET}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.0")
if [[ -z "${LATEST_TAG}" || "${LATEST_TAG}" == "null" ]]; then
    LATEST_TAG="v0.2.0"
fi

DMG_NAME="VaporSphere_${LATEST_TAG#v}_universal.dmg"
DMG_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${LATEST_TAG}/${DMG_NAME}"
DMG_PATH="${TMP_DIR}/VaporSphere.dmg"

echo -e "Downloading ${BOLD}${DMG_NAME}${RESET} (${LATEST_TAG})..."

if curl -fL --progress-bar "${DMG_URL}" -o "${DMG_PATH}"; then
    echo -e "Mounting disk image..."
    MOUNT_DIR=$(mktemp -d /Volumes/VaporSphere_XXXX)
    hdiutil attach "${DMG_PATH}" -mountpoint "${MOUNT_DIR}" -quiet -nobrowse

    echo -e "Installing into ${TARGET_DIR}..."
    rm -rf "${TARGET_DIR}/${APP_NAME}"
    cp -R "${MOUNT_DIR}/${APP_NAME}" "${TARGET_DIR}/"
    hdiutil detach "${MOUNT_DIR}" -quiet

    echo -e "Bypassing macOS Gatekeeper quarantine restrictions..."
    xattr -dr com.apple.quarantine "${TARGET_DIR}/${APP_NAME}" 2>/dev/null || true

    # Create CLI symlink
    if [ -d "${CLI_DIR}" ] && [ -w "${CLI_DIR}" ]; then
        ln -sf "${TARGET_DIR}/${APP_NAME}/Contents/MacOS/vaporsphere" "${CLI_DIR}/${BIN_NAME}"
    else
        mkdir -p "${USER_CLI_DIR}"
        ln -sf "${TARGET_DIR}/${APP_NAME}/Contents/MacOS/vaporsphere" "${USER_CLI_DIR}/${BIN_NAME}"
    fi

    echo -e "\n${GREEN}${BOLD}✓ VaporSphere Successfully Installed on macOS!${RESET}"
    echo -e "Location: ${BOLD}${TARGET_DIR}/${APP_NAME}${RESET}"
    echo -e "You can launch VaporSphere from ${CYAN}Spotlight, Launchpad, or Terminal via '${BIN_NAME}'${RESET}\n"
else
    echo -e "${YELLOW}Notice: Prebuilt DMG release not found. Opening web client or building locally...${RESET}"
    open "http://localhost:3000" 2>/dev/null || true
fi
