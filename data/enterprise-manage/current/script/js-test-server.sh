#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if ! [ -f /.dockerenv ] || [ -n "$CODESPACES" ]; then
  exec docker compose -f docker-compose.dependencies.yaml -f docker-compose.dev.yaml \
    run --publish 3654:3654 --rm single script/js-test-server.sh
fi

export RACK_ENV="test"

(cd test/js && npm install)

exec ./bin/unicorn --config-file config/unicorn.rb config.ru
