# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class DatadogPlatform
        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, **options)
            @name = "GraphQL.#{type.name}.#{field.name}#{lazy ? ".lazy" : ""}"
            @inner_resolve = inner_resolve
          end

          def call(o, a, c)
            Datadog.tracer.trace(@name) do |span|
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, opts)
          operation_type, operation_name = Monitoring.get_type_and_name(query)
          event_name = "GraphQL.#{operation_type}.#{operation_name}"
          span = Datadog.tracer.trace(event_name, service: "GraphQL", resource: operation_name)
          span.set_tag("GraphQL.query_string", query.query_string)
          span.set_tag("GraphQL.operation_name", operation_name)
          span.set_tag("GraphQL.operation_type", operation_type)
          span.set_tag("GraphQL.variables", query.provided_variables.to_json)
          query.context[:__datadog_trace__] = span
        end

        def self.after_query(query, opts)
          span = query.context[:__datadog_trace__]
          span.finish
        end
      end
    end
  end
end
