#!/bin/bash
set -e

if  [ ! -d "/workspaces/blackbird" ]; then
  echo "Cloning blackbird and installing protoc (required to build)..."
  cd /workspaces
  git clone https://github.com/github/blackbird.git
  sudo apt-get install protobuf-compiler libprotobuf-dev libprotoc-dev
else
  echo "Skipping blackbird clone..."
fi

cd /workspaces/blackbird

RUST_LOG=info cargo run --bin blackbird-mw-analysis -- --disable-hmac
