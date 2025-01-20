# frozen_string_literal: true

module Authzd
  module Middleware
    module Instrumenters
      class Noop
        def self.instrument(name, payload = {})
          yield payload if block_given?
        end
      end
    end
  end
end
