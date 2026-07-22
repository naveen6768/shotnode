#!/usr/bin/env bash
# Deploy ShotNode marketing site to the humansofstartups GCP VM.
#
# Usage:
#   bash scripts/deploy-gcp.sh
#
# Requires: gcloud CLI authenticated as contacthumansofstartups@gmail.com
set -euo pipefail

VM_NAME="${SHOTNODE_VM_NAME:-humansofstartups}"
VM_ZONE="${SHOTNODE_VM_ZONE:-asia-south1-a}"
VM_USER="${SHOTNODE_VM_SSH_USER:-naveenchoudhary}"
VM_PROJECT="${SHOTNODE_VM_PROJECT:-humansofstartups}"
GCLOUD_ACCOUNT="${SHOTNODE_GCLOUD_ACCOUNT:-contacthumansofstartups@gmail.com}"
GCLOUD_BIN="${GCLOUD_BIN:-gcloud}"
DEPLOY_PATH="/var/www/shotnode"
REPO_URL="https://github.com/naveen6768/shotnode.git"

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:${PATH}"
export CLOUDSDK_CORE_ACCOUNT="${GCLOUD_ACCOUNT}"
export CLOUDSDK_CORE_PROJECT="${VM_PROJECT}"

echo "[deploy] Target: ${VM_USER}@${VM_NAME} (${VM_ZONE}, project ${VM_PROJECT})"

# Ensure the marketing VM is running before SSH (it may be stopped to save cost).
STATUS="$("${GCLOUD_BIN}" compute instances describe "${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}" --format='get(status)' 2>/dev/null || true)"
if [[ "${STATUS}" != "RUNNING" ]]; then
  echo "[deploy] VM status=${STATUS:-UNKNOWN}; starting..."
  "${GCLOUD_BIN}" compute instances start "${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}"
  for _ in $(seq 1 18); do
    if "${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}" --command "true" >/dev/null 2>&1; then
      break
    fi
    sleep 5
  done
fi

"${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" --zone="${VM_ZONE}" --project="${VM_PROJECT}" --command "
set -euo pipefail
cd ${DEPLOY_PATH}
if [[ -d .git ]]; then
  git fetch origin main
  git reset --hard origin/main
else
  sudo mkdir -p ${DEPLOY_PATH}
  sudo chown -R ${VM_USER}:www-data ${DEPLOY_PATH}
  git clone ${REPO_URL} ${DEPLOY_PATH}
  cd ${DEPLOY_PATH}
fi
npm ci
npm run build
sudo nginx -t && sudo systemctl reload nginx
echo '[deploy] Done — dist updated at ${DEPLOY_PATH}/dist'
"

echo "[deploy] Site: https://shotnode.pro/"
echo "[deploy] After DNS for shotnode.pro points to 34.47.245.237, run:"
echo "  gcloud compute ssh ${VM_USER}@${VM_NAME} --zone=${VM_ZONE} --command 'sudo certbot --nginx -d shotnode.pro -d www.shotnode.pro --non-interactive --agree-tos -m k.naveen6767@gmail.com'"
