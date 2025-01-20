#!/bin/bash
# Source this script to setup a base environment for a CI job.
set -eo pipefail

# Set DEBUG=1 to get bash debugging output
[ -z "${DEBUG-}" ] || { export PS4='+ [${BASH_SOURCE##*/}:${LINENO}] '; set -x; }

source script/ci/common_functions.sh
source script/ci/env.sh
