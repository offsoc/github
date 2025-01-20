FROM ruby:3.2

ARG ARG_GITHUB_USERNAME
ARG ARG_BUNDLE_RUBYGEMS__PKG__GITHUB__COM

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN true
COPY Gemfile* /app/
RUN true
COPY *.gemspec /app/
RUN true
COPY vendor/* /app/vendor/

# Fix git error 'detected dubious ownership in repository'
RUN git config --global --add safe.directory /app

RUN gem install bundler -v 2.4.4
RUN bundle config --global rubygems.pkg.github.com ${ARG_GITHUB_USERNAME}:${ARG_BUNDLE_RUBYGEMS__PKG__GITHUB__COM}
RUN bundle install --redownload
