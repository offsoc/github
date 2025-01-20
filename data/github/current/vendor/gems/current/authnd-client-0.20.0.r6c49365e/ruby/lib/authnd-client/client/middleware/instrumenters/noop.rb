# frozen_string_literal: true

module Authnd
  module Client
    module Middleware
      module Instrumenters
        class Noop
          def self.instrument(_, payload = {})
            yield payload if block_given?
          end
        end
      end
    end
  end
end
