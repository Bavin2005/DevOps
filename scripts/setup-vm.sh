#!/bin/bash
# =============================================================
# Azure VM Setup Script — Run this ONCE after creating your VM
# Tested on Ubuntu 22.04 LTS and Ubuntu 24.04 LTS (Noble)
#
# Usage:
#   chmod +x scripts/setup-vm.sh
#   ./scripts/setup-vm.sh
# =============================================================

set -e

echo "=============================="
echo " Mini Enterprise Portal Setup"
echo "=============================="

# ---------- 1. System update ----------
echo ""
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https software-properties-common

# ---------- 2. Install Docker ----------
echo ""
echo "[2/5] Installing Docker..."

# Remove old versions if any
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

sudo install -m 0755 -d /etc/apt/keyrings

# Download Docker GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker $USER

echo "Docker installed: $(docker --version)"

# ---------- 3. Install K3s ----------
echo ""
echo "[3/5] Installing K3s (lightweight Kubernetes)..."
curl -sfL https://get.k3s.io | sh -

# Give current user kubectl access without sudo
mkdir -p $HOME/.kube
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $USER:$USER $HOME/.kube/config

# Persist KUBECONFIG for future sessions
grep -qxF 'export KUBECONFIG=$HOME/.kube/config' $HOME/.bashrc || \
  echo 'export KUBECONFIG=$HOME/.kube/config' >> $HOME/.bashrc

export KUBECONFIG=$HOME/.kube/config

echo "K3s installed: $(sudo k3s --version | head -1)"

# ---------- 4. Install Jenkins ----------
echo ""
echo "[4/5] Installing Jenkins..."

# Java is required before Jenkins
sudo apt-get install -y fontconfig openjdk-17-jre
echo "Java version: $(java -version 2>&1 | head -1)"

# Clean up any broken previous Jenkins repo/key
sudo rm -f /etc/apt/sources.list.d/jenkins.list
sudo rm -f /usr/share/keyrings/jenkins-keyring.asc

# Download Jenkins GPG key using wget (more reliable than curl|tee on Ubuntu 24.04)
sudo wget -q -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Verify the key was downloaded (must be > 1KB)
KEY_SIZE=$(stat -c%s /usr/share/keyrings/jenkins-keyring.asc 2>/dev/null || echo 0)
if [ "$KEY_SIZE" -lt 1000 ]; then
  echo "ERROR: Jenkins GPG key download failed or is empty (size: ${KEY_SIZE} bytes)"
  echo "Check your internet connection and try again."
  exit 1
fi
echo "Jenkins GPG key downloaded successfully (${KEY_SIZE} bytes)"

# Add Jenkins repo
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y jenkins

# Allow Jenkins to use docker and kubectl without password prompts
sudo usermod -aG docker jenkins

# Grant Jenkins passwordless sudo for kubectl and k3s only
echo "jenkins ALL=(ALL) NOPASSWD: /usr/local/bin/kubectl, /usr/local/bin/k3s, /usr/bin/kubectl" | \
  sudo tee /etc/sudoers.d/jenkins-k8s > /dev/null
sudo chmod 440 /etc/sudoers.d/jenkins-k8s

sudo systemctl enable jenkins
sudo systemctl start jenkins

# Wait for Jenkins to come up
echo "Waiting for Jenkins to start..."
sleep 10
sudo systemctl is-active --quiet jenkins && \
  echo "Jenkins is running" || \
  echo "ERROR: Jenkins failed to start — run: sudo journalctl -u jenkins -n 50"

# ---------- 5. Open firewall ports ----------
echo ""
echo "[5/5] Configuring firewall..."
sudo ufw allow 22      comment 'SSH'
sudo ufw allow 8080    comment 'Jenkins'
sudo ufw allow 30080   comment 'Frontend NodePort'
sudo ufw allow 30500   comment 'Backend NodePort'
sudo ufw --force enable

echo ""
echo "=============================="
echo " Setup Complete!"
echo "=============================="
echo ""
echo "IMPORTANT: Run 'newgrp docker' or log out and back in"
echo "           for the docker group change to take effect."
echo ""
echo "Jenkins initial admin password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "Jenkins URL : http://$(curl -s ifconfig.me 2>/dev/null || echo '<vm-public-ip>'):8080"
echo ""
echo "Ports open  : 8080 (Jenkins)  30080 (Frontend)  30500 (Backend)"
echo ""
echo "REMINDER: Also open these ports in Azure Portal"
echo "          → VM → Networking → Add inbound port rule"
