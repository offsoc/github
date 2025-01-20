#!/bin/bash
set -eu

# This script is intended to log performance metrics during CI builds.
# If the job is a golden job, logs should be archived automatically.

ARTIFACTS_DIR="/tmp/${JOB_NAME}-artifacts"
mkdir -p "$ARTIFACTS_DIR"

function log_mem() {
  rm -f "${ARTIFACTS_DIR}/mem.log"
  while true; do
    date '+%F %T' >> "${ARTIFACTS_DIR}/mem.log"
    free >> "${ARTIFACTS_DIR}/mem.log"
    sleep 1
  done
}

function log_load() {
  rm -f "${ARTIFACTS_DIR}/load.log"
  while true; do
    echo "$(date '+%F %T') $(cat /proc/loadavg)" >> "${ARTIFACTS_DIR}/load.log"
    sleep 1
  done
}

background_pids=()
log_mem &
pid=$!
background_pids+=("$pid")

log_load &
pid=$!
background_pids+=("$pid")

for i in "${!background_pids[@]}"; do
  pid="${background_pids[$i]}"
  exit_status=0
  wait "$pid" || exit_status=$?
  test $exit_status -eq 0 || exit $exit_status
done