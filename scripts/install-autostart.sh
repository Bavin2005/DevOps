#!/bin/bash
# =============================================================
# Install a systemd service that ensures all K8s deployments
# are healthy after every VM boot.
#
# Run ONCE on the Azure VM:
#   chmod +x scripts/install-autostart.sh
#   sudo ./scripts/install-autostart.sh
# =============================================================

set -e

# Resolve the project directory (one level up from scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Installing mini-portal-autostart systemd service..."
echo "Project directory: $PROJECT_DIR"

# Write the systemd unit
cat > /etc/systemd/system/mini-portal-autostart.service << EOF
[Unit]
Description=Mini Enterprise Portal — K8s Deployment Autostart
After=network-online.target k3s.service
Wants=network-online.target
Requires=k3s.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash ${PROJECT_DIR}/scripts/fix-after-restart.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mini-portal-autostart.service

echo ""
echo "Done! Service installed and enabled."
echo "It will run automatically on every VM boot."
echo ""
echo "To check its status after next reboot:"
echo "  sudo systemctl status mini-portal-autostart"
echo "  sudo journalctl -u mini-portal-autostart -n 50"
