#!/usr/bin/env bash

# =============================================================================
# Cafe Website (Next.js 15) - Production Build & Deploy Script
# =============================================================================
# - Trivy scan, Docker build
# - Push to registry
# - Apply K8s env secret (optional)
# - Update centralized devops-k8s Helm values (if app path exists)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; PURPLE='\033[0;35m'; NC='\033[0m'
log() { echo -e "$1"; }
info() { log "${BLUE}[INFO]${NC} $1"; }
ok()   { log "${GREEN}[SUCCESS]${NC} $1"; }
warn() { log "${YELLOW}[WARNING]${NC} $1"; }
err()  { log "${RED}[ERROR]${NC} $1"; }
step() { log "${PURPLE}[STEP]${NC} $1"; }

APP_NAME=${APP_NAME:-"cafe-website"}
NAMESPACE=${NAMESPACE:-"cafe"}
ENV_SECRET_NAME=${ENV_SECRET_NAME:-"cafe-website-env"}
DEPLOY=${DEPLOY:-true}

REGISTRY_SERVER=${REGISTRY_SERVER:-docker.io}
REGISTRY_NAMESPACE=${REGISTRY_NAMESPACE:-codevertex}
IMAGE_REPO="${REGISTRY_SERVER}/${REGISTRY_NAMESPACE}/${APP_NAME}"

DEVOPS_REPO=${DEVOPS_REPO:-"Bengo-Hub/devops-k8s"}
DEVOPS_DIR=${DEVOPS_DIR:-"$HOME/devops-k8s"}
VALUES_FILE_PATH=${VALUES_FILE_PATH:-"apps/${APP_NAME}/values.yaml"}

GIT_EMAIL=${GIT_EMAIL:-"dev@bengobox.com"}
GIT_USER=${GIT_USER:-"Cafe Bot"}
TRIVY_ECODE=${TRIVY_ECODE:-0}

if [[ -z ${GITHUB_SHA:-} ]]; then GIT_COMMIT_ID=$(git rev-parse --short=8 HEAD || echo "localbuild"); else GIT_COMMIT_ID=${GITHUB_SHA::8}; fi
info "Service: ${APP_NAME}"
info "Image: ${IMAGE_REPO}:${GIT_COMMIT_ID}"

for c in git docker trivy; do command -v "$c" >/dev/null || { err "$c is required"; exit 1; }; done
if [[ "${DEPLOY}" == "true" ]]; then for c in kubectl helm yq jq; do command -v "$c" >/dev/null || { err "$c is required"; exit 1; }; done; fi

# =============================================================================
# Auto-sync secrets from devops-k8s
# =============================================================================
if [[ ${DEPLOY} == "true" ]]; then
  info "Checking and syncing required secrets from devops-k8s..."
  SYNC_SCRIPT=$(mktemp)
  if curl -fsSL https://raw.githubusercontent.com/Bengo-Hub/devops-k8s/main/scripts/tools/check-and-sync-secrets.sh -o "$SYNC_SCRIPT" 2>/dev/null; then
    source "$SYNC_SCRIPT"
    check_and_sync_secrets "REGISTRY_USERNAME" "REGISTRY_PASSWORD" "GIT_TOKEN" || info "Secret sync failed - continuing with existing secrets"
    rm -f "$SYNC_SCRIPT"
  else
    info "Unable to download secret sync script - continuing with existing secrets"
  fi
fi

step "Filesystem scan"
trivy fs . --exit-code "$TRIVY_ECODE" --format table --skip-files "*.pem" --skip-files "*.key" --skip-files "*.crt" || true

step "Docker build"
# Pass production API/base URLs so Next.js bundle uses them (NEXT_PUBLIC_* are build-time only)
DOCKER_BUILDKIT=1 docker build . \
  --build-arg NEXT_PUBLIC_AUTH_SERVICE_URL="${NEXT_PUBLIC_AUTH_SERVICE_URL:-https://sso.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_AUTH_UI_URL="${NEXT_PUBLIC_AUTH_UI_URL:-https://accounts.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_ORDERING_SERVICE_URL="${NEXT_PUBLIC_ORDERING_SERVICE_URL:-https://orderingapi.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL="${NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL:-https://notificationsapi.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_LOGISTICS_SERVICE_URL="${NEXT_PUBLIC_LOGISTICS_SERVICE_URL:-https://logisticsapi.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_TREASURY_SERVICE_URL="${NEXT_PUBLIC_TREASURY_SERVICE_URL:-https://booksapi.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_INVENTORY_SERVICE_URL="${NEXT_PUBLIC_INVENTORY_SERVICE_URL:-https://inventoryapi.codevertexitsolutions.com}" \
  --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://theurbanloftcafe.com}" \
  --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://theurbanloftcafe.com}" \
  --build-arg NEXT_PUBLIC_TENANT_SLUG="${NEXT_PUBLIC_TENANT_SLUG:-urban-loft}" \
  --build-arg NEXT_PUBLIC_TENANT_ID="${NEXT_PUBLIC_TENANT_ID:-tenant-urban-loft}" \
  -t "${IMAGE_REPO}:${GIT_COMMIT_ID}"
ok "Docker build complete"

if [[ "${DEPLOY}" != "true" ]]; then
  info "DEPLOY=false; skipping push/deploy"
  exit 0
fi

if [[ -n "${REGISTRY_USERNAME:-}" && -n "${REGISTRY_PASSWORD:-}" ]]; then
  echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY_SERVER" -u "$REGISTRY_USERNAME" --password-stdin
fi

step "Pushing image"
docker push "${IMAGE_REPO}:${GIT_COMMIT_ID}"
ok "Image pushed"

if [[ -n "${KUBE_CONFIG:-}" ]]; then
  mkdir -p ~/.kube
  echo "$KUBE_CONFIG" | base64 -d > ~/.kube/config
  chmod 600 ~/.kube/config
  export KUBECONFIG=~/.kube/config
fi

kubectl get ns "$NAMESPACE" >/dev/null 2>&1 || kubectl create ns "$NAMESPACE"

# Optional: Apply environment secrets if they exist
if [[ -n "${ENV_SECRET_NAME}" ]]; then
  if [[ -f ".env.local" ]]; then
    step "Creating K8s env secret from .env.local: ${ENV_SECRET_NAME}"
    kubectl create secret generic "$ENV_SECRET_NAME" \
      --from-env-file=.env.local \
      -n "$NAMESPACE" \
      --dry-run=client -o yaml | kubectl apply -f -
    ok "Env secret created/updated from .env.local"
  elif [[ -f "kubeSecrets/devENV.yaml" ]]; then
    step "Applying K8s env secret from kubeSecrets/devENV.yaml"
    kubectl apply -f kubeSecrets/devENV.yaml -n "$NAMESPACE"
    ok "Env secret applied from kubeSecrets/devENV.yaml"
  else
    # Ensure the secret exists at least as an empty secret to avoid deployment failure
    if ! kubectl get secret "$ENV_SECRET_NAME" -n "$NAMESPACE" >/dev/null 2>&1; then
      warn "No .env.local or kubeSecrets/devENV.yaml found. Creating empty secret ${ENV_SECRET_NAME} to avoid deployment failure."
      kubectl create secret generic "$ENV_SECRET_NAME" -n "$NAMESPACE"
    fi
  fi
fi

# Clone devops-k8s repo (needed for helm values update)
if [[ ! -d "$DEVOPS_DIR" ]]; then
  TOKEN="${GH_PAT:-}"
  CLONE_URL="https://github.com/${DEVOPS_REPO}.git"
  [[ -n $TOKEN ]] && CLONE_URL="https://x-access-token:${TOKEN}@github.com/${DEVOPS_REPO}.git"
  git clone "$CLONE_URL" "$DEVOPS_DIR" || warn "Unable to clone devops repo for helm values update"
fi

# Update Helm values using centralized script
source "${HOME}/devops-k8s/scripts/helm/update-values.sh" 2>/dev/null || {
  warn "Centralized helm update script not available"
}
if declare -f update_helm_values >/dev/null 2>&1; then
  update_helm_values "$APP_NAME" "$GIT_COMMIT_ID" "$IMAGE_REPO"
else
  warn "update_helm_values function not available - helm values not updated"
fi

ok "Deployment pipeline complete"
