#!/bin/bash

export AGENT_HTTP_PORT="9402"
export AUTH_HMAC_KEY="$(ghe-config 'secrets.ghes-manage.gateway-agent-hmac-key')"
export OTEL_SERVICE_NAME="ghes-manage-agent"
export GITHUB_TELEMETRY_ENVIRONMENT="production"
