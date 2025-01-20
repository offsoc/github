# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      class Instrumentation
        # @api private
        module UnauthorizedObject
          def self.call(obj, ctx)
            nil
          end
        end
      end
    end
  end
end
