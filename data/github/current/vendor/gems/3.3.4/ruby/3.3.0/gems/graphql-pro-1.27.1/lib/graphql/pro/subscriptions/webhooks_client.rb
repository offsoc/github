# frozen_string_literal: true
require "graphql/pro/redis_script_client"

module GraphQL
  module Pro
    class Subscriptions < GraphQL::Subscriptions
      class WebhooksClient
        def initialize(schema: nil, schema_class_name: nil)
          if schema.nil? && schema_class_name.nil?
            raise ArgumentError, "either `schema:` or `schema_class_name:` is required"
          end
          @schema = schema
          @schema_class_name = schema_class_name
        end

        def call(env)
          if @schema.nil?
            @schema = Object.const_get(@schema_class_name)
          end
          call_with_schema(@schema, env)
        end
      end
    end
  end
end
