# typed: true
# frozen_string_literal: true

# Adds middleware to the Rails middleware stack, positioned before the
# GitHub::Routers::Api middleware.
#
# This is intended to make the intention of adding middleware in the
# app config file easier for humans to parse.
module GitHubMiddleware
  def add_github_middleware(*args, &block)
    T.bind(self, T.any(Rails::Application, T.class_of(Rails::Application)))
    config.middleware.insert_before GitHub::Routers::Api, *args, &block
  end
end
