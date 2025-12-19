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

step "Filesystem scan"
trivy fs . --exit-code "$TRIVY_ECODE" --format table --skip-files "*.pem" --skip-files "*.key" --skip-files "*.crt" || true

step "Docker build"
DOCKER_BUILDKIT=1 docker build . \
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

# Apply environment secrets
if [[ -n "${ENV_SECRET_NAME}" ]] && [[ -f ".env.local" ]]; then
  step "Creating K8s env secret: ${ENV_SECRET_NAME}"
  kubectl create secret generic "$ENV_SECRET_NAME" \
    --from-env-file=.env.local \
    -n "$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f - || warn "Env secret already exists"
fi

# Update Helm values in devops-k8s repo
if [[ -n "${GIT_TOKEN:-}" ]] && [[ -d "$DEVOPS_DIR" ]]; then
  step "Updating Helm values in devops-k8s"

  cd "$DEVOPS_DIR"
  git config user.email "$GIT_EMAIL"
  git config user.name "$GIT_USER"

  if [[ -f "$VALUES_FILE_PATH" ]]; then
    yq -i ".image.tag = \"${GIT_COMMIT_ID}\"" "$VALUES_FILE_PATH"
    git add "$VALUES_FILE_PATH"
    git commit -m "Update ${APP_NAME} image tag to ${GIT_COMMIT_ID}" || true
    git push "https://${GIT_TOKEN}@github.com/${DEVOPS_REPO}.git" HEAD:main || warn "Failed to push to devops repo"
    ok "Helm values updated"
  else
    warn "Values file not found at ${VALUES_FILE_PATH}"
  fi

  cd - > /dev/null
fi

ok "Deployment pipeline complete"
