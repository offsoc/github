# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class AppsignalPlatform
        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, lazy:, **options)
            @name = "#{lazy ? "lazy." : ""}#{field.name}.#{type.name}.graphql"
            @inner_resolve = inner_resolve
          end

          def call(o, a, c)
            Appsignal.instrument(@name) do
              @inner_resolve.call(o, a, c)
            end
          end
        end

        def self.before_query(query, opts)
          Appsignal::Transaction.current.start_event
        end

        def self.after_query(query, opts)
          operation_type, operation_name = Monitoring.get_type_and_name(query)
          event_name = "#{operation_name}.#{operation_type}.graphql"

          Appsignal::Transaction.current.finish_event(
            event_name,
            operation_name,
            query.query_string,
          )

          Appsignal.tag_request(
            query_variables: JSON.dump(query.instance_variable_get(:@provided_variables)),
          )
        end
      end
    end
  end
end
