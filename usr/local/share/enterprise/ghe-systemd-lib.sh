#!/bin/sh

# This is running with /bin/sh since it's also loaded from systemd
# so it can't use any Bash specific features.

wait_for_unicorns() {
  local service="$1"
  local worker_threshold=30
  local default_timeout=120
  local timeout=$(calculate_timeout)

  log_message "unicorn master for $service started $MAINPID."

  # wait for unicorn workers to spawn
  local children=0
  for i in `seq 1 $timeout`; do
    local cpids=$(ps h -ocmd --ppid $MAINPID | grep -E '^unicorn.*' | wc -l)
    log_message "children pids for $service: $cpids"
    if [ "$cpids" -ge 1 ]; then
      children=1
      break
    fi
    if ! kill -0 $MAINPID > /dev/null 2>&1 ; then
      log_message "pid $MAINPID isn't running, skipping wait"
      exit 0
    fi
    log_message "Waiting for unicorn workers..."
    sleep 1
  done
  [ $children -gt 0 ] || {
    log_message "unicorn workers for $service failed to start."
    exit 1
  }
  log_message "unicorn workers for $service started."
}

wait_for_file() {
  local file="$1"
  local timeout=${2:-120}
  local filefound=0

  for i in `seq 1 $timeout`; do
    if [ -f $file ]; then
      filefound=1
      break
    fi
    sleep 1
  done
  [ $filefound -gt 0 ] || return 1
}

wait_for_pid() {
  local pidf="$1"
  local timeout=${2:-30}
  local pidfile=0

  for i in `seq 1 $timeout`; do
    if [ -f $pidf ]; then
      pidfile=1
      break
    fi
    sleep 1
  done
  [ $pidfile -gt 0 ] || return 1
}

block_device_enabled() {
  true
}

service_enabled() {
  /usr/local/share/enterprise/ghe-service-enabled "$@"
}

is_cluster_delegate() {
  /usr/local/share/enterprise/ghe-call-configrb ghes_cluster_delegate?
}

cleanup_stale_pidfile() {
  local pidfile="$1"
  if test -f $pidfile && ! ps -p $(cat $pidfile); then
    log_message "cleaning up stale pidfile: $pidfile"
    rm -f $pidfile
  fi
}

calculate_timeout() {
  github_workers=$(ghe-config 'app.github.github-workers')
  if [ -n "$github_workers" ] && [ "$github_workers" -gt "$worker_threshold" ]; then
   echo "$(($default_timeout+$github_workers-$worker_threshold))"
  else
   echo $default_timeout
  fi
}

log_message() {
  echo "`date` $1"
}
