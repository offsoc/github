#!/bin/bash

export AGENT_HTTP_PORT="9402"
export AUTH_HMAC_KEY="$(ghe-config 'secrets.ghes-manage.gateway-agent-hmac-key')"
export GATEWAY_HTTP_PORT="9400"
export OTEL_SERVICE_NAME="ghes-manage-gateway"
export PRIMARY_AGENT_HOSTNAME="$(/usr/local/share/enterprise/ghe-call-configrb cluster_node_name)"
export GITHUB_TELEMETRY_ENVIRONMENT="production"
export ENTERPRISE_DB_PORT="3307"
export ENTERPRISE_DB_HOST="127.0.0.1"
export ENTERPRISE_DB_USER=$(/usr/local/share/enterprise/ghe-call-configrb mysql_username)
export ENTERPRISE_DB_PASS=$(/usr/local/share/enterprise/ghe-call-configrb mysql_password)
