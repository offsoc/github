#!/bin/bash
set -eo pipefail

[ -z "$CI" ] || set -x

cd "$(dirname "$0")/.."

if ! [ -f /.dockerenv ] || [ -n "$CODESPACES" ]; then
  exec docker compose -f docker-compose.dependencies.yaml -f docker-compose.build.yaml \
    run --rm --no-deps build script/run-js-tests.sh
fi

export APP_ROOT="$(pwd)"
export MANAGE_JS_TEST_SERVER_PID="${APP_ROOT}/tmp/pids/unicorn-test.pid"
export OPENSSL_CONF=/etc/ssl/
export RUN_JS_TESTS=true

url="http://localhost:4001/setup/tests?no_login=1"
node_modules_path="${APP_ROOT}/test/js/node_modules"

kill_server() {
  pid=$(cat "${MANAGE_JS_TEST_SERVER_PID}")
  kill $pid &> /dev/null || true
  for ((n=0; n<100; n++)); do
    kill -0 $pid &> /dev/null || break
    sleep 0.1
  done
}

start_server() {
  ./bin/unicorn --config-file config/unicorn.rb config.ru "$@"
}

strip_ansi() {
  local esc=$'\e'
  sed "s/${esc}\\[2K${esc}\\[0G//g"
}

trap 'kill_server' EXIT

if [ -n "${CI}" ]; then
  NPMOPTS="--color false"
  colorize=false
else
  colorize=true
fi

export RACK_ENV="test"

(cd test/js && npm install ${NPMOPTS})

# Create the pids and work directory before starting the unicorn
# (rake test is setup to do this automatically via the Rakefile)
mkdir -p tmp/pids
mkdir -p work

start_server --daemonize

${node_modules_path}/.bin/phantomjs ${node_modules_path}/mocha-phantomjs-core/mocha-phantomjs-core.js \
  ${url} dot "{\"useColors\":${colorize}}" \
  | strip_ansi
