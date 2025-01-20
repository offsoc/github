FROM ruby:3.3

RUN touch /etc/inside-container

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    unzip

ENV PROTOC_VERSION 3.7.0
RUN wget -q https://github.com/google/protobuf/releases/download/v$PROTOC_VERSION/protoc-$PROTOC_VERSION-linux-x86_64.zip -O protoc.zip && \
    unzip -d /usr/local protoc.zip

RUN mkdir hydro-client-ruby
WORKDIR /hydro-client-ruby

COPY lib/hydro/version.rb ./lib/hydro/version.rb
COPY Gemfile hydro-client.gemspec ./
RUN bundle install

COPY . .

CMD ["bash"]
