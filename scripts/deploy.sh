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

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=============================="
echo " Deploying Mini Portal"
echo "=============================="

cd "$PROJECT_DIR"

# ---------- Step 1: Build Docker images ----------
echo ""
echo "[1/4] Building Docker images..."

docker build \
  -t mini-portal-backend:latest \
  ./backend

docker build \
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
