#!/bin/bash
# Common CI functions
#
# To use these in your script, add this line:
# source script/ci/common_functions.sh
#
source "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/vendor/bt/bt.sh"

section() {
  # Get the first 72 characters of the command
  # You can't use substring notation with $@, so we're assigning it first.
  section_name="${@}"
  section_name="${section_name:0:72}"

  named_section "${section_name}" "$@"
}

named_section() {
  section_name=$1
  shift

  start_fold "${section_name}"
  time_command "${section_name}" "$@"
  end_fold
}

start_fold() {
  local FOLD_NAME=$@

  if [[ "${FOLD_LEVEL:-1}" -lt 0 ]]; then
    local LEVEL=$FOLD_LEVEL
    while (( LEVEL < 0 ))
    do
      end_fold
      LEVEL=$((LEVEL+1))
    done
    export FOLD_LEVEL=0
  elif [[ "${FOLD_LEVEL:-}" ]]; then
    export FOLD_LEVEL=$((FOLD_LEVEL+1))
    if [[ "$FOLD_LEVEL" == 1 ]]; then
      export PARENT_FOLD_NAME=$@
    else
      FOLD_NAME="$PARENT_FOLD_NAME - $@"
    fi
  else
    export FOLD_LEVEL=1
    export PARENT_FOLD_NAME=$@
  fi

  if [[ "${GITHUB_ACTIONS:-}" ]]; then
    echo "::group::$FOLD_NAME"
  else
    echo "%%%FOLD {$*}%%%"
  fi
}

start_actions_log_grouping() {
  if [[ "${GITHUB_ACTIONS:-}" ]]; then
    echo "::group::$*"
  fi
}

end_fold() {
  export FOLD_LEVEL=$((FOLD_LEVEL-1))

  if [[ "${GITHUB_ACTIONS:-}" ]]; then
    echo "::endgroup::"
  else
    echo "%%%END FOLD%%%"
  fi
}

end_actions_log_grouping() {
  if [[ "${GITHUB_ACTIONS:-}" ]]; then
    echo "::endgroup::"
  fi
}

time_command() {
  start=$(date +%s)
  name=$1
  shift

  if bt_turned_on; then
    bt_start "${name}"
  fi

  time "$@"
  # If the command from $@ has failed, set -e will cause an exit here..
  # time passes the return value of whatever is being timed, and prints
  # the timing information before exit even if there is an error.

  if bt_turned_on; then
    bt_end "${name}"
    log_duration_metric "$name" "$start"
  fi
}

bt_turned_on() {
  if [[ -n ${BT_INIT+x} ]]; then
    # bt_init was called
    return 0
  else
    # bt_init wasn't called
    return 1
  fi
}

background_pids=()
background_logs=()
background_section_names=()

background_section() {
  local section_name="${1:0:72}"
  local log="tmp/bg.${section_name:0:72}.log"

  shift

  time_command "${section_name}" $* &> "$log" &

  local pid=$!

  background_pids+=("$pid")
  background_logs+=("$log")
  background_section_names+=("$section_name")
}

background_finish() {
  for i in "${!background_pids[@]}"; do
    local pid="${background_pids[$i]}"
    local log="${background_logs[$i]}"
    local section="${background_section_names[$i]}"

    local exit_status=0
    wait "$pid" || exit_status=$?

    start_fold "$section"
    cat "$log"
    end_fold

    test $exit_status -eq 0 || exit $exit_status
  done

  background_pids=()
  background_logs=()
  background_section_names=()
}

wait_for_vtcombo() {
  # VTCombo can be slow to start against large databases, so
  # if we have disabled vitess don't even start vtcombo, see
  # https://github.com/github/data-patterns-and-scaling/issues/54
  # for more information
  if [ -n "$DISABLE_VITESS" ]; then
    return
  fi

  start_time=$(date +%s)
  timeout=500
  echo "Waiting ${timeout}s for vtcombo to start"

  # Poll the vtcombo port every 1s to see if it's started yet
  if ! timeout $timeout bash -c "while ! mysql --user=root -h '127.0.0.1' --port 15306 --protocol tcp -e 'SELECT 1' >/dev/null 2>&1; do sleep 1; done"
  then
    echo "Gave up waiting for vtcombo to start after ${timeout}s"
    tail -n +1 tmp/vtcombo.* || true
    exit 1
  fi

  end_time=$(date +%s)
  echo "VTCombo ready after $((end_time - start_time)) seconds."
}

refresh_oidc_token() {
  if [ -n "$LARGER_RUNNER" ]; then
    echo "Refreshing the OIDC token."
    ruby script/ci/refresh-oidc-token.rb -c /workspace/.docker/config.json
  else
    echo "Skipping OIDC token refresh since it is not needed."
  fi
}

metric_timestamp() {
  date '+%s'
}

log_duration_metric() {
  section="$1"
  timestamp="$2"

  if command -v safe-ruby > /dev/null; then
    script/ci/dogstats timing_since "build.script.duration" "${timestamp}" \
      "job_name:$JOB_NAME" \
      "workflow_name: $GITHUB_WORKFLOW" \
      "repository:github" \
      "section:${section}" \
      || true
  fi
}

log_test_runtime_metric() {
  if command -v safe-ruby > /dev/null; then
    script/ci/dogstats distribution test_runtime "$1" \
      "job_name:$JOB_NAME" \
      "workflow_name: $GITHUB_WORKFLOW" \
      "repository:github" \
      "branch:$BUILD_BRANCH" \
      "gh_ci_runtime:$GH_CI_RUNTIME" \
      "gh_instance:$GITHUB_SERVER_URL" \
      || true
  fi
}

log_database_cache_metric() {
  status=$1

  script/ci/dogstats increment "bootstrap.database_cache" \
    "job_name:$JOB_NAME" \
    "workflow_name: $GITHUB_WORKFLOW" \
    "repository:github" \
    "status:${status}" \
    || true
}
