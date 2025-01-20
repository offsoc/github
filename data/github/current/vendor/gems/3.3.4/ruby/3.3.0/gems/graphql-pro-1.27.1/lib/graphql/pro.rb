# frozen_string_literal: true
require "forwardable"
require "set"
require "graphql"
if defined?(GraphQL::ObjectType)
  require "graphql/pro/access"
end
require "graphql/pro/operation_store"
require "graphql/pro/can_can_integration"
require "graphql/pro/dashboard"
# This requires class-based directives, 1.9+ and interpreter
if defined?(GraphQL::Schema::Directive)
  require "graphql/pro/defer"
  require "graphql/pro/stream"
end
require "graphql/pro/pundit_integration"
require "graphql/pro/relation_connection"
if defined?(GraphQL::Define)
  require "graphql/pro/repository"
  if defined?(Rails)
    require "graphql/pro/railtie"
  end
end
require "graphql/pro/routes"
require "graphql/pro/subscriptions"
require "graphql/pro/ably_subscriptions"
require "graphql/pro/pubnub_subscriptions"
require "graphql/pro/pusher_subscriptions"
require "graphql/pro/encoder"
if defined?(GraphQL::Define)
  require "graphql/pro/monitoring"
end
require "graphql/pro/version"
# This requires a module introduced in GraphQL 1.10
if defined?(GraphQL::Pagination)
  require "graphql/pro/stable_relation_connection"
end


module GraphQL
  module Pro
  end
end
