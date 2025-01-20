# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class SkylightPlatform
        QUERY_CATEGORY = "graphql.query"
        RESOLVE_CATEGORY = "graphql.resolve"
        LAZY_RESOLVE_CATEGORY = "graphql.lazy_resolve"

        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, **opts)
            @inner_resolve = inner_resolve
            @instrument_opts = {
              category: lazy ? LAZY_RESOLVE_CATEGORY : RESOLVE_CATEGORY,
              title: "#{type.name}.#{field.name}#{lazy ? " (lazy)" : ""}",
            }
          end

          def call(o, a, c)
            Skylight.instrument(@instrument_opts) do
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, opts)
          operation_type, operation_name = Monitoring.get_type_and_name(query)
          endpoint = "GraphQL/#{operation_type}.#{operation_name}"
          current_instance = Skylight::Instrumenter.instance
          if current_instance
            current_instance.current_trace.endpoint = endpoint
          end
          trace = Skylight.instrument({title: endpoint, category: QUERY_CATEGORY})
          query.context[:__skylight_trace__] = trace
        end

        def self.after_query(query, opts)
          Skylight.done(query.context[:__skylight_trace__])
        end
      end
    end
  end
end
