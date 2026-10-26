#!/usr/bin/env bash
# Deploy only the website to the VM that currently serves shotnode.pro.
# Preserves the new production backend and the existing nginx API routes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="shotnode-prod-app-2026"
ACCOUNT="shotnodeapp@gmail.com"
VM="shotnode-production"
ZONE="asia-south1-a"
DOMAIN="shotnode.pro"

if [[ "${SHOTNODE_DEPLOY_DRY_GUARD:-}" == "1" ]]; then
  echo "DRY_GUARD_OK domain=${DOMAIN} project=${PROJECT} vm=${VM} account=${ACCOUNT}"
  exit 0
fi

VM_IP="$(gcloud compute instances describe "${VM}" --account="${ACCOUNT}" --project="${PROJECT}" --zone="${ZONE}" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')"
DNS_IP="$(dig +short "${DOMAIN}" A | head -1)"
if [[ -z "${VM_IP}" || "${VM_IP}" != "${DNS_IP}" ]]; then
  echo "Refusing deploy: ${DOMAIN} resolves to ${DNS_IP}, but ${VM} has ${VM_IP}." >&2
  exit 1
fi

cd "${ROOT}"
npm run build -- --mode production

BUNDLE="$(mktemp -t shotnode-live-web.XXXXXX.tar.gz)"
trap 'rm -f "${BUNDLE}"' EXIT
COPYFILE_DISABLE=1 tar -czf "${BUNDLE}" --format=ustar -C "${ROOT}" \
  dist server/render src/data/launchPosts.js \
  scripts/shotnode-web-render.service scripts/nginx-shotnode-live-blog.conf

gcloud compute scp --account="${ACCOUNT}" --project="${PROJECT}" --zone="${ZONE}" --tunnel-through-iap \
  "${BUNDLE}" "${VM}:/tmp/shotnode-live-web-release.tar.gz"

gcloud compute ssh "${VM}" --account="${ACCOUNT}" --project="${PROJECT}" --zone="${ZONE}" --tunnel-through-iap --command='bash -s' <<'REMOTE'
set -euo pipefail
SITE_ROOT="/var/www/shotnode-dev"
NGINX_CONF="/etc/nginx/sites-available/shotnode-production"
UNIT="/etc/systemd/system/shotnode-web-render.service"
RELEASE="$(mktemp -d /tmp/shotnode-web-release.XXXXXX)"
BACKUP="/var/backups/shotnode-web-$(date +%Y%m%d-%H%M%S)"

restore_on_failure() {
  code=$?
  if [[ "${code}" -ne 0 ]]; then
    echo "Release failed; restoring the previous website and nginx config." >&2
    if sudo test -d "${BACKUP}/dist"; then
      if sudo test -d "${SITE_ROOT}/dist"; then sudo mv "${SITE_ROOT}/dist" "${BACKUP}/failed-dist"; fi
      sudo mv "${BACKUP}/dist" "${SITE_ROOT}/dist"
    fi
    if sudo test -f "${BACKUP}/nginx"; then
      sudo cp "${BACKUP}/nginx" "${NGINX_CONF}"
      sudo nginx -t && sudo systemctl reload nginx || true
    fi
    if sudo test -f "${BACKUP}/render-unit"; then
      sudo cp "${BACKUP}/render-unit" "${UNIT}"
      sudo systemctl daemon-reload
      sudo systemctl restart shotnode-web-render || true
    else
      sudo systemctl stop shotnode-web-render || true
    fi
  fi
  rm -rf "${RELEASE}"
  sudo rm -f /tmp/shotnode-live-web-release.tar.gz
  exit "${code}"
}
trap restore_on_failure EXIT

tar -xzf /tmp/shotnode-live-web-release.tar.gz -C "${RELEASE}"
test -f "${RELEASE}/dist/index.html"
test -f "${RELEASE}/server/render/server.js"
if sudo test -e "${SITE_ROOT}/dist.release"; then
  echo "Refusing to overwrite an existing staged release." >&2
  exit 1
fi
sudo mkdir -p "${BACKUP}" "${SITE_ROOT}/server/render" "${SITE_ROOT}/src/data" /etc/nginx/snippets
sudo cp -a "${NGINX_CONF}" "${BACKUP}/nginx"
if sudo test -f "${UNIT}"; then sudo cp -a "${UNIT}" "${BACKUP}/render-unit"; fi

sudo cp -a "${RELEASE}/dist" "${SITE_ROOT}/dist.release"
sudo cp -a "${RELEASE}/server/render/." "${SITE_ROOT}/server/render/"
sudo cp -a "${RELEASE}/src/data/launchPosts.js" "${SITE_ROOT}/src/data/launchPosts.js"
sudo chown -R "$(whoami):www-data" "${SITE_ROOT}/dist.release" "${SITE_ROOT}/server/render" "${SITE_ROOT}/src/data"
sudo mv "${SITE_ROOT}/dist" "${BACKUP}/dist"
sudo mv "${SITE_ROOT}/dist.release" "${SITE_ROOT}/dist"

sed -e "s|__VM_USER__|$(whoami)|g" \
    -e "s|__DEPLOY_PATH__|${SITE_ROOT}|g" \
    -e 's|__RENDER_PORT__|3020|g' \
    -e 's|__BACKEND_ORIGIN__|http://127.0.0.1:8090|g' \
    -e 's|__SITE_ORIGIN__|https://shotnode.pro|g' \
    "${RELEASE}/scripts/shotnode-web-render.service" | sudo tee "${UNIT}" >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable shotnode-web-render
sudo systemctl restart shotnode-web-render
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3020/healthz >/dev/null 2>&1; then break; fi
  sleep 1
done
curl -fsS http://127.0.0.1:3020/healthz >/dev/null
curl -fsS http://127.0.0.1:3020/blog > "${RELEASE}/render-check.html"
grep -q 'How to turn everyday clips' "${RELEASE}/render-check.html"

sudo cp "${RELEASE}/scripts/nginx-shotnode-live-blog.conf" /etc/nginx/snippets/shotnode-live-blog.conf
sudo python3 - <<'PY'
from pathlib import Path
config = Path('/etc/nginx/sites-available/shotnode-production')
text = config.read_text()
marker = '    root /var/www/shotnode-dev/dist;\n    index index.html;'
include = '    include /etc/nginx/snippets/shotnode-live-blog.conf;'
if include not in text:
    if text.count(marker) != 1:
        raise SystemExit('Unexpected nginx production vhost; refusing to patch')
    config.write_text(text.replace(marker, marker + '\n' + include, 1))
PY
sudo nginx -t
sudo systemctl reload nginx
blog_ready=0
for _ in $(seq 1 15); do
  if curl -fsS --noproxy '*' --resolve shotnode.pro:443:127.0.0.1 https://shotnode.pro/blog > "${RELEASE}/blog-check.html" &&
     grep -q 'How to turn everyday clips' "${RELEASE}/blog-check.html"; then
    blog_ready=1
    break
  fi
  sleep 1
done
if [[ "${blog_ready}" -ne 1 ]]; then
  echo "Blog verification failed; response excerpt:" >&2
  head -c 300 "${RELEASE}/blog-check.html" >&2 || true
  exit 1
fi
curl -fsS --noproxy '*' --resolve shotnode.pro:443:127.0.0.1 https://shotnode.pro/api/v1/health >/dev/null
echo "Live web release installed. Backup: ${BACKUP}"
REMOTE
