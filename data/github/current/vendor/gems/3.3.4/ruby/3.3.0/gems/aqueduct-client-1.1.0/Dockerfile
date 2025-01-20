FROM ruby:3.1-slim-bullseye

RUN touch /etc/inside-container

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
      golang \
      wget \
      git \
      unzip

ENV PROTOC_VERSION 3.14.0
RUN wget -q https://github.com/google/protobuf/releases/download/v$PROTOC_VERSION/protoc-$PROTOC_VERSION-linux-x86_64.zip -O protoc.zip && \
    unzip -d /usr/local protoc.zip

RUN go get github.com/arthurnn/twirp-ruby/protoc-gen-twirp_ruby

WORKDIR /aqueduct-client-ruby
COPY . /aqueduct-client-ruby
RUN bundle install

CMD ["bash"]
