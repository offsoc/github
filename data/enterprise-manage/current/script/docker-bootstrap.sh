#!/usr/bin/env bash
set -euo pipefail

# Generate the sources.list file
if [ -n "${APT_CREDS:-}" ] ; then
  sources_url="https://$(base64 --decode <<< "$APT_CREDS")@$APT_HOST"
else
  sources_url="http://$APT_HOST"
fi

distro=${DISTRO:-buster}

cat <<EndSources > /etc/apt/sources.list
deb ${sources_url}/${distro} ${distro} main contrib non-free
deb ${sources_url}/${distro}-updates ${distro}-updates main contrib non-free
deb ${sources_url}/${distro}-backports ${distro}-backports main contrib non-free
deb ${sources_url}/${distro}-security ${distro}-security main contrib non-free
deb ${sources_url}/github-${distro} ${distro} main
deb ${sources_url}/zulu-debian stable main
deb ${sources_url}/node_18.x-${distro} ${distro} main
deb ${sources_url}/docker-${distro} ${distro} stable
deb ${sources_url}/mysql-buster buster mysql-8.0
EndSources


# Add the GitHub key and update the package index
apt-key add packages.pub
apt-get update

