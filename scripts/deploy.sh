#!/bin/bash
# =============================================================
# Manual Deploy Script — Use this to deploy without Jenkins
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh <your-azure-vm-public-ip>
#
# Example:
#   ./scripts/deploy.sh 20.1.2.3
# =============================================================

set -e

VM_IP="${1}"

if [ -z "$VM_IP" ]; then
  echo "Error: Azure VM IP is required."
  echo "Usage: ./scripts/deploy.sh <azure-vm-public-ip>"
  exit 1
fi

VITE_API_URL="http://${VM_IP}:30500"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=============================="
echo " Deploying Mini Portal"
echo " VM IP: $VM_IP"
echo " API URL: $VITE_API_URL"
echo "=============================="

cd "$PROJECT_DIR"

# ---------- Step 1: Build Docker images ----------
echo ""
echo "[1/4] Building Docker images..."

docker build \
  -t mini-portal-backend:latest \
  ./backend

docker build \
  --build-arg VITE_API_URL="$VITE_API_URL" \
  -t mini-portal-frontend:latest \
  ./frontend

echo "Images built successfully."

# ---------- Step 2: Import into K3s containerd ----------
# K3s uses containerd — Docker images must be explicitly imported.
echo ""
echo "[2/4] Importing images into K3s containerd..."

docker save mini-portal-backend:latest  | sudo k3s ctr images import -
docker save mini-portal-frontend:latest | sudo k3s ctr images import -

echo "Images imported into K3s."

# Verify import
echo "Imported images:"
sudo k3s ctr images list | grep mini-portal

# ---------- Step 3: Apply Kubernetes manifests ----------
echo ""
echo "[3/4] Applying Kubernetes manifests..."

sudo kubectl apply -f k8s/namespace.yaml
sudo kubectl apply -f k8s/secrets.yaml
sudo kubectl apply -f k8s/mongodb-pvc.yaml
sudo kubectl apply -f k8s/mongodb-deployment.yaml
sudo kubectl apply -f k8s/backend-deployment.yaml
sudo kubectl apply -f k8s/frontend-deployment.yaml
sudo kubectl apply -f k8s/hpa.yaml

# ---------- Step 4: Wait and verify ----------
echo ""
echo "[4/4] Waiting for pods to be ready..."

sudo kubectl rollout status deployment/mongodb  -n mini-portal --timeout=120s
sudo kubectl rollout status deployment/backend  -n mini-portal --timeout=120s
sudo kubectl rollout status deployment/frontend -n mini-portal --timeout=120s

echo ""
echo "=============================="
echo " Deployment Complete!"
echo "=============================="
echo ""
sudo kubectl get pods     -n mini-portal
echo ""
sudo kubectl get services -n mini-portal
echo ""
echo "  Frontend : http://${VM_IP}:30080"
echo "  Backend  : http://${VM_IP}:30500"
echo ""
