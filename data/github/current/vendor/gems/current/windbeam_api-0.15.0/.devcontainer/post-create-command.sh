#!/bin/sh
set -e

echo "machine goproxy.githubapp.com login nobody password $GITHUB_TOKEN" >> $HOME/.netrc
sudo apt update && sudo apt install -y protobuf-compiler
