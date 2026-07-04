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
GCLOUD_BIN="${GCLOUD_BIN:-gcloud}"
DEPLOY_PATH="/var/www/shotnode"
REPO_URL="https://github.com/naveen6768/shotnode.git"

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:${PATH}"

echo "[deploy] Target: ${VM_USER}@${VM_NAME} (${VM_ZONE})"

"${GCLOUD_BIN}" compute ssh "${VM_USER}@${VM_NAME}" --zone="${VM_ZONE}" --command "
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

echo "[deploy] Site: http://34.47.245.237/"
echo "[deploy] After DNS for shotnode.ai points to 34.47.245.237, run:"
echo "  gcloud compute ssh ${VM_USER}@${VM_NAME} --zone=${VM_ZONE} --command 'sudo certbot --nginx -d shotnode.ai -d www.shotnode.ai'"
