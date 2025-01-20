# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class StatsdPlatform
        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, statsd:, **opts)
            @statsd = statsd
            @name = "graphql.#{type.name}.#{field.name}#{lazy ? ".lazy" : ""}"
            @inner_resolve = inner_resolve
          end

          def call(o, a, c)
            @statsd.time(@name) do
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, options)
          query.context[:__statsd_started_at__] = Time.now
        end

        def self.after_query(query, statsd:, **options)
          started_at = query.context[:__statsd_started_at__]
          elapsed_ms = (Time.now - started_at) / 1000

          operation_type, operation_name = Monitoring.get_type_and_name(query)
          event_name = "graphql.#{operation_type}.#{operation_name}"
          statsd.timing(event_name, elapsed_ms)
        end
      end
    end
  end
end
