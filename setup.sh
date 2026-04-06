#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# RetireVision — One-time setup script
# Run this once from the Unraid terminal to build the image.
# After this, manage the container through the Unraid Docker GUI.
#
# Usage:
#   bash /mnt/user/Downloads/retire/setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  Building RetireVision image..."
echo ""

docker build \
  -f "$SCRIPT_DIR/Dockerfile.combined" \
  -t retirevision:latest \
  "$SCRIPT_DIR"

echo ""
echo "  Done! Image is ready."
echo ""
echo "  Next: add my-retire.xml in Unraid → Docker → Add Container → paste XML"
echo ""
