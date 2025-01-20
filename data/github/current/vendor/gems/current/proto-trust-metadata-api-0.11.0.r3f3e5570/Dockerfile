FROM golang:1.20.5-bookworm

ARG PROTOC_VERSION=3.14.0
ARG TWIRP_PROTOC_VERSION=v8.1.3
ARG TWIRP_RUBY_VERSION=v1.10.0

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

RUN set -ex \
    && apt-get update \
    && apt-get install --yes unzip

# Install protoc tools & make them executable for all users
RUN set -ex \
    && zip="protoc-${PROTOC_VERSION}-$(uname -s | tr A-Z a-z)-$(uname -m).zip" \
    && curl -s -L "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${zip}" -o "/tmp/${zip}" \
    && unzip -o "/tmp/${zip}" -d /usr/local bin/protoc \
    && unzip -o "/tmp/${zip}" -d /usr/local 'include/*' \
    && rm -f "/tmp/${zip}" \
    && apt-get remove -y unzip \
    && chmod 755 -R /usr/local/bin \
    && chmod 755 -R /usr/local/include

# Install twirp tools
RUN cd $TOOLS && \
    go install github.com/twitchtv/twirp/protoc-gen-twirp@${TWIRP_PROTOC_VERSION} && \
    go install github.com/github/twirp-ruby/protoc-gen-twirp_ruby@${TWIRP_RUBY_VERSION}

# create a non-root user
RUN useradd --create-home --shell /bin/bash tma
USER tma
WORKDIR /home/tma

# Set the default shell to bash instead of sh
ENV SHELL /bin/bash
