#!/usr/bin/env bash
# Обновить приложение до последней версии из GitHub. Запускать от root на сервере:
#   bash /var/www/permtransport/server/deploy/update.sh
set -euo pipefail
cd /var/www/permtransport
git pull
server/venv/bin/pip install -q -r server/requirements.txt
chown -R www-data:www-data /var/www/permtransport
systemctl restart permtransport
echo "Обновлено: $(git log -1 --oneline)"
