export FI='1'
export RACK_ENV='production'
export RACK_ROOT="$ENTERPRISE_APP_INSTANCE"
export RAILS_ENV='production'
export RAILS_ROOT="$ENTERPRISE_APP_INSTANCE"
export RBENV_VERSION=$(cat /etc/github/ruby_version)
export BUNDLE_WITHOUT=development:test

export BUNDLE_APP_CONFIG="$ENTERPRISE_APP_INSTANCE/.bundle"
export PATH='/usr/share/rbenv/shims:/usr/share/nvm/0.8.11/bin:/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/sbin:/sbin:/bin'
export ENTERPRISE_SESSION_SECRET=$(ghe-config 'secrets.session-manage')
export ENTERPRISE_CONFIG_STATUS='/data/user/common/ghe-config-apply.status.json'

export ENTERPRISE_DB_PORT="3307"
export ENTERPRISE_DB_HOST="127.0.0.1"
export ENTERPRISE_DB_USER=$(/usr/local/share/enterprise/ghe-call-configrb mysql_username)
export ENTERPRISE_DB_PASS=$(/usr/local/share/enterprise/ghe-call-configrb mysql_password)

export MANAGE_API_ENDPOINT="localhost:8443"
export MANAGE_API_USERNAME="internal_api_key"
export MANAGE_API_PASSWORD=$(ghe-config 'secrets.ghes-manage.internal-api-key')
