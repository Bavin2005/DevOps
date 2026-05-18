#!/bin/bash
# =============================================================
# VM Restart Recovery Script
# Run this on your Azure VM after restarting it.
#
# Usage:
#   chmod +x scripts/fix-after-restart.sh
#   ./scripts/fix-after-restart.sh
# =============================================================

set -e

NAMESPACE="mini-portal"

echo "=============================================="
echo "  Mini Portal — VM Restart Recovery"
echo "=============================================="

# ── Step 1: Make sure K3s is running ──────────────────────────
echo ""
echo "[1/6] Checking K3s service..."
if ! sudo systemctl is-active --quiet k3s; then
  echo "  K3s is NOT running. Starting it..."
  sudo systemctl start k3s
  echo "  Waiting 20 seconds for K3s to be ready..."
  sleep 20
else
  echo "  K3s is running."
fi

# Export kubeconfig so kubectl works without sudo prefix
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# ── Step 2: Check node is Ready ───────────────────────────────
echo ""
echo "[2/6] Node status:"
sudo kubectl get nodes

# ── Step 3: Check all pods in the namespace ───────────────────
echo ""
echo "[3/6] Current pod status in namespace '${NAMESPACE}':"
sudo kubectl get pods -n "$NAMESPACE" -o wide 2>/dev/null || \
  echo "  Namespace '${NAMESPACE}' not found — will redeploy below."

# ── Step 4: Check for stuck/crashed pods and restart them ─────
echo ""
echo "[4/6] Checking for unhealthy pods..."

BAD_PODS=$(sudo kubectl get pods -n "$NAMESPACE" \
  --no-headers 2>/dev/null | \
  grep -vE "Running|Completed" | awk '{print $1}' || true)

if [ -z "$BAD_PODS" ]; then
  echo "  All pods are Running. Checking if deployments are available..."
  FRONTEND_READY=$(sudo kubectl get deployment frontend -n "$NAMESPACE" \
    -o jsonpath='{.status.availableReplicas}' 2>/dev/null || echo "0")
  if [ "$FRONTEND_READY" = "0" ] || [ -z "$FRONTEND_READY" ]; then
    echo "  Frontend deployment has 0 available replicas. Forcing restart..."
    sudo kubectl rollout restart deployment/frontend -n "$NAMESPACE"
    sudo kubectl rollout restart deployment/backend  -n "$NAMESPACE"
    sudo kubectl rollout restart deployment/mongodb  -n "$NAMESPACE"
  else
    echo "  Deployments look healthy. Available frontend replicas: $FRONTEND_READY"
  fi
else
  echo "  Unhealthy pods found: $BAD_PODS"
  echo "  Restarting all deployments..."
  sudo kubectl rollout restart deployment/mongodb  -n "$NAMESPACE" 2>/dev/null || true
  sudo kubectl rollout restart deployment/backend  -n "$NAMESPACE" 2>/dev/null || true
  sudo kubectl rollout restart deployment/frontend -n "$NAMESPACE" 2>/dev/null || true
fi

# ── Step 5: If namespace missing, do a full redeploy ──────────
NAMESPACE_EXISTS=$(sudo kubectl get namespace "$NAMESPACE" \
  --no-headers 2>/dev/null | wc -l || echo "0")

if [ "$NAMESPACE_EXISTS" = "0" ]; then
  echo ""
  echo "  Namespace missing! Running full redeploy..."
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
  cd "$PROJECT_DIR"

  # Rebuild & reimport images into K3s containerd
  echo "  Building Docker images..."
  docker build -t mini-portal-backend:latest  ./backend
  docker build -t mini-portal-frontend:latest ./frontend

  echo "  Importing images into K3s containerd..."
  docker save mini-portal-backend:latest  | sudo k3s ctr images import -
  docker save mini-portal-frontend:latest | sudo k3s ctr images import -

  echo "  Applying Kubernetes manifests..."
  sudo kubectl apply -f k8s/namespace.yaml
  sudo kubectl apply -f k8s/secrets.yaml
  sudo kubectl apply -f k8s/mongodb-pvc.yaml
  sudo kubectl apply -f k8s/mongodb-deployment.yaml
  sudo kubectl apply -f k8s/backend-deployment.yaml
  sudo kubectl apply -f k8s/frontend-deployment.yaml
  sudo kubectl apply -f k8s/ingress.yaml
  sudo kubectl apply -f k8s/hpa.yaml
fi

# ── Step 6: Wait and show final status ────────────────────────
echo ""
echo "[5/6] Waiting for pods to become Ready (up to 2 minutes)..."
sudo kubectl rollout status deployment/mongodb  -n "$NAMESPACE" --timeout=120s 2>/dev/null || true
sudo kubectl rollout status deployment/backend  -n "$NAMESPACE" --timeout=120s 2>/dev/null || true
sudo kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=120s 2>/dev/null || true

echo ""
echo "[6/6] Final status:"
sudo kubectl get pods     -n "$NAMESPACE"
echo ""
sudo kubectl get services -n "$NAMESPACE"
echo ""
sudo kubectl get ingress  -n "$NAMESPACE"

VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "<your-vm-ip>")
echo ""
echo "=============================================="
echo "  Done! Your site should be back at:"
echo "  http://${VM_IP}/"
echo "=============================================="
