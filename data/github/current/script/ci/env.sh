#!/bin/bash
# Set CI environment variables
#
# To add these environment variables to your script, add this line:
# source script/ci/env.sh
#
export USER="${USER:-example}"

# GH_CI_RUNTIME is the name of the build pipeline check (e.g., "github-all-features")
# This needs to be set in Build Pipelines, but is already set in github/internal-actions.
if [ ! -n "$GITHUB_ACTIONS" ]; then
  export GH_CI_RUNTIME="${JOB_NAME}"
fi

# setup environment
export RAILS_ENV="test"
export RACK_ENV="$RAILS_ENV"
export RAILS_ROOT=$(dirname $(dirname $(readlink -f "$0")))
export RACK_ROOT="$RAILS_ROOT"
export PATH="/usr/local/share/nodenv/shims:$PATH"
export PATH="${RAILS_ROOT}/bin:${RAILS_ROOT}/vendor/ruby/$(config/ruby-version)/bin:$PATH"
export NODENV_VERSION="v0.10.21"
export GITHUB_CI=1

# bt's CPU sampling has caused weird errors and hangs in the test suite
# We don't use the cpu sampling, so let's disable it
export BT_DISABLE_CPUSAMPLE=1

# Clean out the ruby environment
export RUBYLIB=
export RUBYOPT=

# If either are set, make sure both are set
if [ -n "${ENTERPRISE+x}" -o -n "${FI+x}" ]; then
  export FI=1
  export ENTERPRISE=1
fi

# Check if we are using a Larger Runner
export LARGER_RUNNER=

if [ -f "/.github-full-larger-runner" ]; then
  export LARGER_RUNNER=1
fi
