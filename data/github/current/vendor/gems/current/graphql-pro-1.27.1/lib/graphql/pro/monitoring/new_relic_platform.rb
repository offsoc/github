# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class NewRelicPlatform
        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, **opts)
            @name = "GraphQL/#{type.name}.#{field.name}#{lazy ? ".lazy" : ""}"
            @inner_resolve = inner_resolve
          end

          def call(o, a, c)
            NewRelic::Agent::MethodTracerHelpers.trace_execution_scoped(@name) do
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, opts)
          operation_type, operation_name = Monitoring.get_type_and_name(query)
          NewRelic::Agent.set_transaction_name("GraphQL/#{operation_type}.#{operation_name}")
        end

        def self.after_query(query, opts)
          NewRelic::Agent.add_custom_attributes({
            variables: query.instance_variable_get(:@provided_variables),
            query_string: query.query_string,
          })
        end
      end
    end
  end
end
