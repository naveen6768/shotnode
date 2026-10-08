#!/usr/bin/env bash
# Deploy ShotNode marketing site (production or development) to the GCP VM.
#
# Usage:
#   SHOTNODE_ENV=production  bash scripts/deploy-gcp.sh
#   SHOTNODE_ENV=development bash scripts/deploy-gcp.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SHOTNODE_ENV="${SHOTNODE_ENV:-production}"
case "${SHOTNODE_ENV}" in
  production|development) ;;
  *) echo "SHOTNODE_ENV must be production|development" >&2; exit 1 ;;
esac

DRY_VM_NAME=""
DRY_VM_PROJECT=""
DRY_ACCOUNT=""
DRY_IAP=""
if [[ "${SHOTNODE_DEPLOY_DRY_GUARD:-}" == "1" ]]; then
  DRY_VM_NAME="${SHOTNODE_VM_NAME:-}"
  DRY_VM_PROJECT="${SHOTNODE_VM_PROJECT:-}"
  DRY_ACCOUNT="${SHOTNODE_GCLOUD_ACCOUNT:-${SHOTNODE_GCP_ACCOUNT:-}}"
  DRY_IAP="${SHOTNODE_VM_USE_IAP:-}"
fi
ENV_FILE="${REPO_ROOT}/.env.${SHOTNODE_ENV}"
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi
if [[ "${SHOTNODE_DEPLOY_DRY_GUARD:-}" == "1" ]]; then
  [[ -n "${DRY_VM_NAME}" ]] && SHOTNODE_VM_NAME="${DRY_VM_NAME}"
  [[ -n "${DRY_VM_PROJECT}" ]] && SHOTNODE_VM_PROJECT="${DRY_VM_PROJECT}"
  [[ -n "${DRY_ACCOUNT}" ]] && SHOTNODE_GCLOUD_ACCOUNT="${DRY_ACCOUNT}"
  [[ -n "${DRY_ACCOUNT}" ]] && SHOTNODE_GCP_ACCOUNT="${DRY_ACCOUNT}"
  [[ -n "${DRY_IAP}" ]] && SHOTNODE_VM_USE_IAP="${DRY_IAP}"
fi

# Staging web: k.naveen6767@gmail.com / shotnode-prod-k6767-2026 / shotnode-staging (IAP SSH)
# Production:  k.naveen6767@gmail.com / shotnode-prod-k6767-2026 / shotnode-prod (IAP SSH)
# Android build lanes are k.naveen6767@gmail.com / shotnode-prod-k6767-2026 / shotnode-build.
if [[ "${SHOTNODE_ENV}" == "development" ]]; then
  VM_NAME="${SHOTNODE_VM_NAME:-shotnode-staging}"
  VM_PROJECT="${SHOTNODE_VM_PROJECT:-${SHOTNODE_GCP_PROJECT:-shotnode-prod-k6767-2026}}"
  GCLOUD_ACCOUNT="${SHOTNODE_GCLOUD_ACCOUNT:-${SHOTNODE_GCP_ACCOUNT:-k.naveen6767@gmail.com}}"
  SHOTNODE_VM_USE_IAP="${SHOTNODE_VM_USE_IAP:-true}"
else
  VM_NAME="${SHOTNODE_VM_NAME:-shotnode-prod}"
  VM_PROJECT="${SHOTNODE_VM_PROJECT:-${SHOTNODE_GCP_PROJECT:-shotnode-prod-k6767-2026}}"
  GCLOUD_ACCOUNT="${SHOTNODE_GCLOUD_ACCOUNT:-${SHOTNODE_GCP_ACCOUNT:-k.naveen6767@gmail.com}}"
  SHOTNODE_VM_USE_IAP="${SHOTNODE_VM_USE_IAP:-true}"
fi
VM_ZONE="${SHOTNODE_VM_ZONE:-asia-south1-a}"
VM_USER="${SHOTNODE_VM_SSH_USER:-naveenchoudhary}"
GCLOUD_BIN="${GCLOUD_BIN:-gcloud}"

if [[ "${SHOTNODE_ENV}" == "production" ]]; then
  if [[ "${VM_NAME}" != "shotnode-prod" || "${VM_PROJECT}" != "shotnode-prod-k6767-2026" || "${GCLOUD_ACCOUNT}" != "k.naveen6767@gmail.com" ]]; then
    echo "Refusing production web deploy to project ${VM_PROJECT} VM ${VM_NAME} as ${GCLOUD_ACCOUNT}." >&2
    echo "Production is k.naveen6767@gmail.com / shotnode-prod-k6767-2026 / VM shotnode-prod." >&2
    exit 1
  fi
fi
if [[ "${SHOTNODE_ENV}" == "development" ]]; then
  if [[ "${VM_NAME}" == "shotnode-prod" ]]; then
    echo "Refusing development web deploy onto VM shotnode-prod." >&2
    exit 1
  fi
  if [[ "${VM_NAME}" != "shotnode-staging" || "${VM_PROJECT}" != "shotnode-prod-k6767-2026" || "${GCLOUD_ACCOUNT}" != "k.naveen6767@gmail.com" ]]; then
    echo "Refusing development web deploy to project ${VM_PROJECT} VM ${VM_NAME} as ${GCLOUD_ACCOUNT}." >&2
    echo "Development is k.naveen6767@gmail.com / shotnode-prod-k6767-2026 / VM shotnode-staging." >&2
    exit 1
  fi
fi
if [[ "${SHOTNODE_DEPLOY_DRY_GUARD:-}" == "1" ]]; then
  echo "DRY_GUARD_OK env=${SHOTNODE_ENV} vm=${VM_NAME} project=${VM_PROJECT} account=${GCLOUD_ACCOUNT}"
  exit 0
fi

if [[ "${SHOTNODE_ENV}" == "development" ]]; then
  DEPLOY_PATH="/var/www/shotnode-dev"
  SITE_DOMAIN="${SHOTNODE_SITE_DOMAIN:-staging.shotnode.pro}"
  NGINX_CONF_SRC="${SCRIPT_DIR}/nginx-shotnode-dev.conf"
  NGINX_SITE="shotnode-dev"
  BUILD_MODE=development
  PUBLIC_PORT=8088
else
  DEPLOY_PATH="/var/www/shotnode"
  SITE_DOMAIN="${SHOTNODE_SITE_DOMAIN:-shotnode.pro}"
  NGINX_CONF_SRC="${SCRIPT_DIR}/nginx-shotnode-pro.conf"
  NGINX_SITE="shotnode-pro"
  BUILD_MODE=production
  PUBLIC_PORT=80
fi

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:${PATH}"
export CLOUDSDK_CORE_ACCOUNT="${GCLOUD_ACCOUNT}"
export CLOUDSDK_CORE_PROJECT="${VM_PROJECT}"

ssh_vm() {
  if [[ "${SHOTNODE_VM_USE_IAP}" == "true" ]]; then
    "${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" \
      --zone="${VM_ZONE}" --project="${VM_PROJECT}" \
      --tunnel-through-iap --command "$1"
  else
    "${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" \
      --zone="${VM_ZONE}" --project="${VM_PROJECT}" --command "$1"
  fi
}

scp_vm() {
  if [[ "${SHOTNODE_VM_USE_IAP}" == "true" ]]; then
    "${GCLOUD_BIN}" compute scp --tunnel-through-iap \
      --zone="${VM_ZONE}" --project="${VM_PROJECT}" "$@"
  else
    "${GCLOUD_BIN}" compute scp \
      --zone="${VM_ZONE}" --project="${VM_PROJECT}" "$@"
  fi
}

echo "[deploy-web:${SHOTNODE_ENV}] → ${DEPLOY_PATH}"

STATUS="$("${GCLOUD_BIN}" compute instances describe "${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}" --format='get(status)' 2>/dev/null || true)"
if [[ "${STATUS}" != "RUNNING" ]]; then
  "${GCLOUD_BIN}" compute instances start "${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}"
  for _ in $(seq 1 18); do
    if ssh_vm "true" >/dev/null 2>&1; then break; fi
    sleep 5
  done
fi

EXTERNAL_IP="$("${GCLOUD_BIN}" compute instances describe "${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')"

TMP_TAR="$(mktemp -t shotnode-web.XXXXXX.tar.gz)"
cleanup() { rm -f "${TMP_TAR}"; }
trap cleanup EXIT
COPYFILE_DISABLE=1 tar -C "${REPO_ROOT}" -czf "${TMP_TAR}" --format=ustar \
  --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='.env' .

ssh_vm "sudo mkdir -p '${DEPLOY_PATH}' && sudo chown -R '${VM_USER}:www-data' '${DEPLOY_PATH}'"
scp_vm "${TMP_TAR}" "${VM_USER}@${VM_NAME}:/tmp/shotnode-web-src.tar.gz"
scp_vm "${NGINX_CONF_SRC}" "${VM_USER}@${VM_NAME}:/tmp/nginx-shotnode.conf"

ssh_vm "DEPLOY_PATH='${DEPLOY_PATH}' NGINX_SITE='${NGINX_SITE}' BUILD_MODE='${BUILD_MODE}' bash -s" <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
VM_USER="$(whoami)"

if ! command -v nginx >/dev/null 2>&1; then
  sudo apt-get update -y && sudo apt-get install -y nginx
fi
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE '^v(2[0-9]|[3-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo mkdir -p "${DEPLOY_PATH}"
sudo chown -R "${VM_USER}:www-data" "${DEPLOY_PATH}"
cd "${DEPLOY_PATH}"
tar -xzf /tmp/shotnode-web-src.tar.gz
rm -f /tmp/shotnode-web-src.tar.gz

npm ci
if [[ "${BUILD_MODE}" == "development" ]]; then
  npm run build -- --mode development
else
  npm run build -- --mode production
fi

sudo chown -R "${VM_USER}:www-data" "${DEPLOY_PATH}"
sudo find "${DEPLOY_PATH}" -type d -exec chmod 755 {} \;
sudo find "${DEPLOY_PATH}/dist" -type f -exec chmod 644 {} \; 2>/dev/null || true
sudo chmod 755 /var/www "${DEPLOY_PATH}"

sudo cp /tmp/nginx-shotnode.conf "/etc/nginx/sites-available/${NGINX_SITE}"
sudo ln -sfn "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
if [[ -e /etc/nginx/sites-enabled/default ]]; then sudo rm -f /etc/nginx/sites-enabled/default; fi
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
echo "[remote] web ${BUILD_MODE} ready at ${DEPLOY_PATH}/dist"
REMOTE

echo "[deploy-web:${SHOTNODE_ENV}] Done."
echo "  Site: http://${EXTERNAL_IP}:${PUBLIC_PORT}/"
echo "  Domain (after DNS): https://${SITE_DOMAIN}/"
