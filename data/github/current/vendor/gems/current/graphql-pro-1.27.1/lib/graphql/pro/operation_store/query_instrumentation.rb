# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      # This now behaves as a tracer instead of a query instrumenter, so that we can be sure it's
      # called before code that requires the query string. To be honest, we may need another way to call it even sooner.
      #
      # But, the query instrumentation code is left in place to support patches that call that method.
      class QueryInstrumentation
        def trace(event, data)
          if event == "execute_multiplex"
            multiplex = data[:multiplex]
            multiplex.queries.each { |q| before_query(q) }
          end
          yield
        end

        def before_query(query)
          query.check_operation_store
        end

        def after_query(query)
        end
      end
    end
  end
end
