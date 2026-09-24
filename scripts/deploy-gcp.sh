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

VM_NAME="${SHOTNODE_VM_NAME:-shotnode-dev}"
VM_ZONE="${SHOTNODE_VM_ZONE:-asia-south1-a}"
VM_USER="${SHOTNODE_VM_SSH_USER:-naveenchoudhary}"
VM_PROJECT="${SHOTNODE_VM_PROJECT:-${SHOTNODE_GCP_PROJECT:-shotnode-dev-cn}}"
GCLOUD_ACCOUNT="${SHOTNODE_GCLOUD_ACCOUNT:-${SHOTNODE_GCP_ACCOUNT:-cnaveen676767@gmail.com}}"
GCLOUD_BIN="${GCLOUD_BIN:-gcloud}"

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
  "${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" \
    --zone="${VM_ZONE}" --project="${VM_PROJECT}" --command "$1"
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
"${GCLOUD_BIN}" compute scp "${TMP_TAR}" "${VM_USER}@${VM_NAME}:/tmp/shotnode-web-src.tar.gz" --zone="${VM_ZONE}" --project="${VM_PROJECT}"
"${GCLOUD_BIN}" compute scp "${NGINX_CONF_SRC}" "${VM_USER}@${VM_NAME}:/tmp/nginx-shotnode.conf" --zone="${VM_ZONE}" --project="${VM_PROJECT}"

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
