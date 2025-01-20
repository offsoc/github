#!/bin/bash
# Snek E2E CI helper functions
set -e

# shellcheck disable=1091
source script/ci/base.sh

# CI
function finish {
  # clean .env file
  rm -f test/e2e/.env
  bt_cleanup
}

# TODO: this is used for the canary build and we want to reconcile it later with the one we have above
# CD
function finish_and_emit_deployment_metric() {
  # cleanup should not fail the build if we would otherwise exit successfully
  set +e
  rm -f "${RAILS_ROOT}/test/e2e/logged-in-state.json"
  named_section "Emit build duration since deployment" build_duration_since_deployment
  bt_end "entire build"
  bt_cleanup
}

# replaces environment variables in an .env file
# CI
function replace_env_var {
  local var_name
  local var_value
  var_name="$1"
  var_value=$(echo "${2}" | sed 's/\//\\\//g')
  sed -i'' "s/^${var_name}=.*/${var_name}=${var_value}/" .env
}

function exit_if_no_changes_to {
  paths_to_check="$@"
  start_fold "Checking file changes"

  base_ref=$(
    curl --silent --request GET --url "https://api.github.com/repos/github/github" \
    --header "Authorization: Bearer $BP_GITHUB_TOKEN" \
    | jq -r '.default_branch'
  )
  head_ref=$(git rev-parse --verify HEAD)
  merge_ref=$(
    curl --silent --request GET --url "https://api.github.com/repos/github/github/compare/$base_ref...$head_ref" \
    --header "Authorization: Bearer $BP_GITHUB_TOKEN" \
    | jq -r '.merge_base_commit.sha'
  )

  echo "Fetching changes from merge ref ($merge_ref) to head ($head_ref)"
  git fetch --quiet --no-tags --prune --progress --no-recurse-submodules --depth=1 origin $merge_ref

  echo "Calculating file changes for paths:"
  echo $paths_to_check | tr " " "\n"

  changes=$(git diff  --name-only --unified=0 $merge_ref $head_ref $paths_to_check)

  if [ -z "$changes" ]; then
    echo '%%%HIGHLIGHT {success}%%%'
    echo "No changes detected, skipping execution"
    echo '%%%END HIGHLIGHT%%%'
    exit 0
  fi

  echo "Changes detected:"
  echo $changes | tr " " "\n"

  end_fold

  echo '%%%HIGHLIGHT {info}%%%'
  echo "Changes detected, continuing execution"
  echo '%%%END HIGHLIGHT%%%'
}

# CD
function bootstrap_snek_env_in_cd () {
  bt_init
  bt_start "entire build"

  trap finish_and_emit_deployment_metric EXIT HUP INT QUIT PIPE TERM

  setup_common_env
}

# CI/CD
function setup_common_env () {
  export GITHUB_REF_NAME="${GITHUB_REF_NAME:-$(git branch --show-current)}"
  echo "Running on the branch: $GITHUB_REF_NAME"

  export BUILD_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
  RAILS_ROOT="$(pwd)"
  export RAILS_ROOT
}

# CI
function bootstrap_snek_env {
  while [ "$1" != "" ]; do
    case $1 in
      --skip-elastomer-reset)
        SKIP_ELASTOMER_RESET=1
        ;;
      --seed-data-script)
        shift
        SEED_DATA_SCRIPT=$1
        ;;
    esac
    shift
  done

  bt_init
  trap finish EXIT HUP INT QUIT PIPE TERM

  cd "$(dirname "$0")/.."
  # Exit on `enterprise-X.Y-release` and `enterprise-X.Y-backport-*` branches.
  if [ -f ENTERPRISE-RELEASE ]; then
    echo "No-op on an enterprise release/backport branch"
    exit 0
  fi

  # setup environment
  setup_common_env
  export GITHUB_CI=1
  export MT_NO_PLUGINS=1
  export PERFORMANCE_TESTING=1
  export FASTDEV=1
  export PRELOAD=1
  export GH_HOSTNAME="github.localhost"
  export ALIVE_HOST="alive.github.localhost"
  export GH_PORT=3000
  export TARGET_ENV="dotcom"
  export RUN_AXE_RULES="false"
  export DD_ENV="${TARGET_ENV}"
  export DATADOG_API_KEY="${DATADOG_KEY}"
  export GITHUB_REPO_BRANCH="${GITHUB_REF_NAME}"
  export BUILD_START_TIME=$(date +%s%3N)
  export SKIP_LOOKBOOK="true"

  # Datadog metrics variables used by test/e2e/export_metrics_and_create_issues.sh
  export DATADOG_KEY="${E2E_DATADOG_API_KEY}"
  export METRICS_FILE_PATH="${RAILS_ROOT}/test/e2e/metrics/${TARGET_ENV}/results.json"
  export METRICS_XML_PATH="${RAILS_ROOT}/test/e2e/metrics/${TARGET_ENV}/results.xml"
  export CREATE_ISSUES="false"
  CODEOWNERS_PATH="$(pwd)/CODEOWNERS"
  export CODEOWNERS_PATH

  named_section "Monolith setup" script/ci/bootstrap --skip-background-sections

  # Required, as ci/bootstrap overrides this environment variable
  export RAILS_ENV="development"
  background_section "Precompile assets for dev" npm run precompile-assets

  bootstrap_nginx() {
    sudo /usr/sbin/service nginx stop
    script/generate-nginx-cert
    script/bootstrap-nginx-conf.rb --root
    ln -s "$(pwd)/config/dev/nginx.root.conf" /etc/nginx/sites-enabled/github.conf
    if [ -L "/etc/nginx/sites-enabled/default" ] ; then
      unlink /etc/nginx/sites-enabled/default
    fi
    sudo /usr/sbin/service nginx start
  }

  background_section "Configuring and starting nginx" bootstrap_nginx

  background_section "Generate robots.txt" bin/robots

  background_section "Generate opensearch.xml" bin/opensearch

  bootsnap_precompile() {
    # precompile Ruby iseqs in parallel so that we boot faster
    bin/bundle exec bootsnap precompile app lib packages test --gemfile
  }

  background_section "Bootsnap precompile" bootsnap_precompile

  generate_serviceowners() {
    mkdir -p vendor/serviceowners
    bin/generate-service-files.rb --cache-only
  }

  background_section "Generate SERVICEOWNERS" generate_serviceowners

  bootstrap_dev_environment() {
    SKIP_IDENTITY_SEEDS=1 SKIP_VITESS=1 bin/rake setup db:seed
    if [[ -z "${SKIP_ELASTOMER_RESET}" ]]; then
      bin/elastomer reset
    fi
  }

  # This is hopefully sufficient without doing the full bin/rake dance
  unset GITHUB_CI

  background_section "Bootstrapping Dev-like environment" bootstrap_dev_environment

  background_finish

  start_server() {
    # Create a Procfile for snek, disabling services which have been found to cause
    # startup failures under CI
    export TARGET_WAIT_START_TIME=$(date +%s%3N)
    cp Procfile Procfile.snek_ci
    for SERVICE in turboghas;
    do
      echo "Disabling $SERVICE from Procfile.snek_ci"
      sed -i "s/^${SERVICE}:/#${SERVICE}:/" Procfile.snek_ci
    done

    # This enables all feature flags by default (e.g. for -all-features builds)
    if [ "$SNEK_FEATURES_TEST" = "true" ]; then
      echo "Enabling all feature flags for E2E tests"
      export TEST_ALL_FEATURES="1"
    fi

    export OVERMIND_CAN_DIE=gpgverify,hookshot-go
    export POOL_MAX_THREADS=8
    export SKIP_RELAY=true
    export SKIP_AUTHND=true
    overmind start -f "Procfile.snek_ci" >"/tmp/${JOB_NAME}-artifacts/overmind-${JOB_NAME}-log.txt" 2>"/tmp/${JOB_NAME}-artifacts/overmind-${JOB_NAME}-log.txt" &
  }

  named_section "Starting up server in $RAILS_ENV mode" start_server

  setup_snek() {
    pushd test/e2e
    script/bootstrap

    cp -n .env.example .env
    replace_env_var TARGET_ENV "${TARGET_ENV}"
    replace_env_var RUN_AXE_RULES "${RUN_AXE_RULES}"
    USERNAME=monalisa
    replace_env_var GITHUB_FEATURE_USERNAME "${USERNAME}"
    replace_env_var GITHUB_FEATURE_PASSWORD "passworD1"

    pushd "${RAILS_ROOT}"
    # Adapted from seeds.rb - no thor/&c. needed this way
    FASTDEV= PRELOAD= bin/rails runner "require_relative Rails.root.join('script/seeds/runner'); Seeds::Runner.require_runners; Seeds::Objects::User.two_factor_enable!(user: Seeds::Objects::User.monalisa)"
    TOTP_SEED=$(FASTDEV= PRELOAD= bin/rails runner "puts GitHub::TwoFactorAuthentication.mashed_secret(User.find_by(login: \"$USERNAME\").totp_app_registration&.encrypted_otp_secret)" | tail -n1)
    popd

    replace_env_var GITHUB_FEATURE_LOGIN_TWO_FACTOR_TOTP "${TOTP_SEED}"
    replace_env_var GITHUB_HOST "${GITHUB_HOST:-http://github.localhost/}"

    # Set the number of retries to 50 to avoid flakiness in CI where the server may have issues keeping up with the
    # background job processing, which involves ElasticSearch indexing.
    replace_env_var SEARCH_RESULT_RETRIES "50"

    popd
  }

  background_section "Setup Snek" setup_snek

  background_section "Waiting for the server to start" test/e2e/script/ci-watch-for-server

  if [[ -n "${SEED_DATA_SCRIPT}" ]]; then
    export WAIT_FOR_SERVER=1
    background_section "Generate seed data" ${SEED_DATA_SCRIPT}
  fi

  background_finish
}

# CI
function run_snek_ci {
  SNEK_STATUS=0
  pushd "${RAILS_ROOT}/test/e2e"
  mkdir -p "test-results/${TARGET_ENV}"
  mkdir -p "metrics/${TARGET_ENV}"
  export TAGS_TO_TEST
  export TAGS_TO_EXCLUDE
  export TEST_START_TIME=$(date +%s%3N)
  export BOOTSTRAP_COMPLETED_TIME="${TEST_START_TIME}"
  "${RAILS_ROOT}/script/ci/perf-stats.sh" &
  npx playwright test --grep "${TAGS_TO_TEST}" --grep-invert "${TAGS_TO_EXCLUDE}"|| SNEK_STATUS=$?
  popd
  pushd "${RAILS_ROOT}"
  overmind kill
  pkill -f perf-stats.sh
  popd
}

# CI
function report_metrics {
  start_fold "Reporting metrics for the build under workflow '${WORKFLOW_NAME}'"
  pushd "${RAILS_ROOT}/test/e2e"

  EXPORT_STATUS=0

  export TEST_END_TIME=$(date +%s%3N)
  npx ts-node -T "script/export_metrics_and_create_issues.ts" || EXPORT_STATUS=$?

  # This is a partial replacement for export_metrics_and_create_issues.ts.
  # This is currently being tested.
  ./script/export-metrics.ts || true
  ./script/build-metrics.ts || true

  popd
  end_fold
}

# CI/CD
function report_status {
  start_fold "Test Failure Annotations"
  pushd "${RAILS_ROOT}/test/e2e"
  npx ts-node -T "script/render_failure_messages.ts" || true
  popd
  end_fold
  if [[ "$SNEK_STATUS" -ne "0" ]]; then
    echo '%%%HIGHLIGHT {danger}%%%'
    echo "1 or more Snek (e2e) tests failed. Check failure annotations and artifacts for more information"
    echo '%%%END HIGHLIGHT%%%'
    exit $SNEK_STATUS
  else
    if [[ "${EXPORT_STATUS}" -ne "0" ]]; then
      echo '%%%HIGHLIGHT {danger}%%%'
      echo "All tests were successful, but metrics upload failed!  This is probably a problem."
      echo '%%%END HIGHLIGHT%%%'
    else
      echo '%%%HIGHLIGHT {success}%%%'
      echo "All tests were successful!"
      echo '%%%END HIGHLIGHT%%%'
    fi
  fi
}

# CD
function annotate_and_exit {
  echo "::error file=${BASH_SOURCE[0]}::${1}"
  exit 1
}

# CD
function build_duration_since_deployment() {
  export BUILD_STARTING_TIME=$(date +%s%3N)
  DEPLOYMENT_COMPLETION_TIME=$(cat /tmp/deployment_completion_time.txt || echo "")
  if [ -z "$DEPLOYMENT_COMPLETION_TIME" ]; then
    echo "No deployment completion time found, skipping build_duration_since_deployment"
    return
  fi
  pushd "${RAILS_ROOT}/test/e2e/script"
  ./ci-dogstats timing_since snek.build_duration_since_deployment "${DEPLOYMENT_COMPLETION_TIME}" "workflow:${WORKFLOW_NAME}" "branch:${GITHUB_REF_NAME}"
  popd
}

# CD
function setup_npm() {
  pushd "$(dirname "$0")/.." || exit
  script/bootstrap-js
  popd || exit
}

# CD
function npm_ci {
  set +e
  npm ci
  NPM_STATUS=$?

  if [[ "${NPM_STATUS}" -ne "0" ]]; then
    annotate_and_exit "NPMInstallation" "NPM CI failed"
  fi
  set -e
}

# CD
function install_gems() {
  set +e
  export GEM_HOME=$HOME/.gem
  pushd "${RAILS_ROOT}/vendor/cache"
  gem i -l -N octokit dogstatsd-ruby
  GEM_STATUS=$?
  popd

  if [[ "${GEM_STATUS}" -ne "0" ]]; then
    annotate_and_exit "GemInstallation" "Unable to install gems in install_gems"
  fi
  set -e
}

function install_browser() {
  npx playwright install
}

function wait_for_deployment() {
  DEPLOYMENT_SHA=$(git rev-parse HEAD)
  export DEPLOYMENT_SHA

  TARGET_WAIT_START_TIME=$(date +%s%3N)
  export TARGET_WAIT_START_TIME
  export BOOTSTRAP_COMPLETED_TIME="${TARGET_WAIT_START_TIME}"

  echo "GITHUB_REF_NAME env var value: ${GITHUB_REF_NAME}"
  if [ -n "${SNEK_CONF_WAIT_FOR_DEPLOYMENT}" ]; then
    if [[ ! $GITHUB_REF_NAME =~ ^(snek-.*)$ ]]; then
      named_section "Waiting for the deployment to be ready" script/ci-watch-for-deployment
    fi
  fi
}

# CD
function run_snek_cd() {
  mkdir -p "test-results/${TARGET_ENV}"
  mkdir -p "metrics/${TARGET_ENV}"

  export CANARY
  export CI
  export FULLY_PARALLEL
  export GITHUB_FEATURE_BUSINESSNAME
  export GITHUB_FEATURE_USERNAME
  export GITHUB_HOST
  export SSO_LOGIN
  export SSO_LOGIN_EMAIL
  export TARGET_ENV
  export TAGS_TO_TEST
  export TAGS_TO_EXCLUDE
  export RUN_AXE_RULES
  TEST_START_TIME=$(date +%s%3N)
  export TEST_START_TIME
  SNEK_STATUS=0

  npx playwright test --grep "${TAGS_TO_TEST}" --grep-invert "${TAGS_TO_EXCLUDE}"|| SNEK_STATUS=$?
  export SNEK_STATUS
}

# CI/CD
function prepare_artifacts() {
  pushd "${RAILS_ROOT}/test/e2e"
  cp -rv test-results "/tmp/${JOB_NAME}-artifacts/"
  cp -rv metrics "/tmp/${JOB_NAME}-artifacts/"

  # no need xml since we have json
  rm "/tmp/${JOB_NAME}-artifacts/metrics/${TARGET_ENV}/results.xml"
  rm "/tmp/${JOB_NAME}-artifacts/metrics/.gitkeep"

  # prepare artifacts for upload to octofactory
  pushd "/tmp/${JOB_NAME}-artifacts/test-results"
  # shellcheck disable=2038
  # delete all folders that contain test-finished-*.png, to keep only failed tests results
  find . -type f -name 'test-finished-*.png' -exec dirname {} \; | xargs rm -rf

  # flatten directory structure, cause we can't upload nested folders to octofactory
  find . -type f -exec bash -c 'file=${1#./}; mv "$file" "${file//\//_}"' _ '{}' \;

  echo "artifacts after cleanup:"
  find . -type f
  popd
  popd
}

# CD
function export_metrics() {
  TEST_END_TIME=$(date +%s%3N)
  export TEST_END_TIME
  export ISSUE_REPO='github'
  export ISSUE_REPO_OWNER='github'
  script/export_metrics_and_create_issues.sh || EXPORT_STATUS=$?

  npx ts-node ./script/export-metrics.ts || true
  npx ts-node ./script/build-metrics.ts || true

  echo "Snek metrics EXIT_CODE: $EXPORT_STATUS"
}
