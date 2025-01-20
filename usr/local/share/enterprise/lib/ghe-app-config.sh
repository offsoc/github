#!/bin/sh
#^ don't execute this directly but remember to avoid bashisms

load_app_config() {
  if [ -z "$1" ] ; then
    echo "ERROR: must provide service name" 1>&2
    exit 1
  fi

  local service="$1"
  local instance=$(readlink -f -- "$0" | cut -d/ -f1-4)
  local envdir="/data/$1/current/.app-config/env.d"

  case "$instance" in
    /data/$service/*)
      envdir="$instance/.app-config/env.d"
      ;;
    *)
      instance=$(readlink -f -- "$(pwd)" | cut -d/ -f1-4)
      case "$instance" in
        /data/$service/*)
          envdir="$instance/.app-config/env.d"
          ;;
        *)
          instance=/data/$service/current
          ;;
      esac
  esac

  export ENTERPRISE_APP_INSTANCE="$instance"

  if [ ! -d $envdir ] ; then
    echo "ERROR: $0: envdir $envdir doesn't exist!" 1>&2
    exit 1
  fi

  for i in $envdir/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
}
