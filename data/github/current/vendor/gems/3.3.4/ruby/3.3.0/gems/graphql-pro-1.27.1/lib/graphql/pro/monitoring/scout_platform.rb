# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class ScoutPlatform
        INSTRUMENT_TYPE = "GraphQL"
        INSTRUMENT_OPTS = { scope: true }

        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, **opts)
            @name = "#{type.name}.#{field.name}#{lazy ? " (lazy)" : ""}"
            @inner_resolve = inner_resolve
            # Do it during initalize to avoid load order issues
            self.class.include(ScoutApm::Tracer::ClassMethods)
          end

          def call(o, a, c)
            instrument(INSTRUMENT_TYPE, @name, INSTRUMENT_OPTS) do
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, opts)
          operation_type, operation_name = Monitoring.get_type_and_name(query)
          layer = ScoutApm::Layer.new("GraphQL", "#{operation_type}.#{operation_name}")
          layer.subscopable!
          req = ScoutApm::RequestManager.lookup
          req.start_layer(layer)
        end

        def self.after_query(query, opts)
          ScoutApm::RequestManager.lookup.stop_layer
          operation_type, operation_name = Monitoring.get_type_and_name(query)

          ScoutApm::Context.add({
            query_string: query.query_string,
            operation_name: operation_name,
            operation_type: operation_type,
            variables: query.provided_variables.to_json,
          })
        end
      end
    end
  end
end
