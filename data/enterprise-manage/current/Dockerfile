FROM debian:buster

ARG RUBY_VERSION=3.2.2
ARG APT_HOST=packages.service.github.net
ARG APT_CREDS=
ARG HOST_UID=
ENV APT_HOST="${APT_HOST}" APT_CREDS="${APT_CREDS}"
ENV RUBY_VERSION="${RUBY_VERSION}"
ENV PATH="/usr/share/rbenv/shims:${PATH}"

RUN echo "Starting Docker Build"

RUN apt-get -qq update && \
    apt-get -qq install  -y \
    git curl ca-certificates apt-transport-https \
    gnupg

COPY packages.pub .
COPY script/docker-bootstrap.sh .
RUN ./docker-bootstrap.sh

RUN apt-get -qq update && \
    apt-get -qq install -y \
    rbenv \
    rbenv-"${RUBY_VERSION}"\
    cmake\
    gnupg \
    build-essential \
    libmysqlclient-dev \
    gnupg-agent \
    libjemalloc-dev \
    libjemalloc2 \
    libssl-dev \
    java-common \
    nodejs \
    pkg-config \
    zlib1g \
    zlib1g-dev \
    zulu-10

RUN node -v && npm -v

RUN rbenv global "${RUBY_VERSION}"
RUN gem install bundler
ENV LANG C.UTF-8

RUN useradd -mU -u "${HOST_UID}" admin
USER admin
