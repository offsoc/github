#!/bin/bash

# Setup the environment for running GitHub
#
# This script should set sane defaults, but should never override values in
# existing environment variables.
#
#     [[ -n $IS_NOT_SET ]] || export IS_NOT_SET="until now"
#

set -e

export HAS_USED_SCRIPT_ENVIRONMENT=true

# RAILS_ROOT should have been set by `safe-ruby`. If it's not, we'll attempt
# to set it to a sane default, but we are assuming any sourcing script is
# exactly one directory down from RAILS_ROOT.
[[ -n $RAILS_ROOT ]] || export RAILS_ROOT=$(dirname $(dirname $(readlink -f "$0")))

# Detect if the current runtime is ENTERPRISE
if [[ "$(cat $RAILS_ROOT/tmp/runtime/current 2>/dev/null)" == "enterprise" ]]
then
  export ENTERPRISE=1
fi

# Make this Bash and Dash compatible
if [ -z "$BASH_VERSION" ]; then
  app_dir=$(cd "$(dirname "$0")/../" && pwd -P)
else
  app_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd -P )"
fi

# enterprise environment vars
[ -f "$app_dir"/.app-config/production.sh ] && source "$app_dir"/.app-config/production.sh || true

# Source custom environment files.
[[ $(ls -A "$app_dir"/.app-config/env.d/*.sh 2> /dev/null) ]] && source "$app_dir"/.app-config/env.d/*.sh || true

# XXX: keep backwards compatibility for now, remove this once
# https://github.com/github/enterprise2/pull/9723 has been merged.
[ -f /data/github/shared/env.sh ] && source /data/github/shared/env.sh || true
