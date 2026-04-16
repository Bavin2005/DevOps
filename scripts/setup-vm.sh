#!/bin/bash
# =============================================================
# Azure VM Setup Script — Run this ONCE after creating your VM
# Ubuntu 22.04 LTS recommended
#
# Usage:
#   chmod +x scripts/setup-vm.sh
#   ./scripts/setup-vm.sh
# =============================================================

set -e  # Exit immediately if any command fails

echo "=============================="
echo " Mini Enterprise Portal Setup"
echo "=============================="

# ---------- 1. System update ----------
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ---------- 2. Install Docker ----------
echo "[2/5] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker $USER

echo "Docker installed: $(docker --version)"

# ---------- 3. Install K3s ----------
echo "[3/5] Installing K3s (lightweight Kubernetes)..."
curl -sfL https://get.k3s.io | sh -

# Give current user access to kubectl without sudo
mkdir -p $HOME/.kube
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $USER:$USER $HOME/.kube/config
echo 'export KUBECONFIG=$HOME/.kube/config' >> $HOME/.bashrc

echo "K3s installed: $(sudo k3s --version | head -1)"

# ---------- 4. Install Jenkins ----------
echo "[4/5] Installing Jenkins..."
sudo apt-get install -y openjdk-17-jdk

curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y jenkins

# Allow Jenkins to run docker and kubectl without password prompts
sudo usermod -aG docker jenkins
echo "jenkins ALL=(ALL) NOPASSWD: /usr/local/bin/kubectl, /usr/local/bin/k3s" | \
  sudo tee /etc/sudoers.d/jenkins-k8s

sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "Jenkins installed and running on port 8080"

# ---------- 5. Open firewall ports ----------
echo "[5/5] Configuring UFW firewall..."
sudo ufw allow 22      # SSH
sudo ufw allow 8080    # Jenkins
sudo ufw allow 30080   # Frontend (NodePort)
sudo ufw allow 30500   # Backend  (NodePort)
sudo ufw --force enable

echo ""
echo "=============================="
echo " Setup Complete!"
echo "=============================="
echo ""
echo "IMPORTANT: Log out and back in for docker group to take effect."
echo ""
echo "Jenkins initial password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "Jenkins URL: http://$(curl -s ifconfig.me):8080"
echo ""
echo "Also open these ports in Azure VM NSG (Network Security Group):"
echo "  - 8080  (Jenkins)"
echo "  - 30080 (Frontend)"
echo "  - 30500 (Backend)"
