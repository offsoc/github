# frozen_string_literal: true

require_relative "instrumenters/noop"

module Authnd
  module Client
    module Middleware
      class Base
        attr_accessor :request, :original_method_name

        def instrument(operation, payload = {}, &block)
          payload = { middleware: middleware_name.to_s, operation: operation.to_s }.merge(payload)
          @instrumenter.instrument(expand_instrument_name(operation), payload, &block)
        end

        protected

        def middleware_name
          raise NotImplementedError, "Must be overwritten in particular middleware classes"
        end

        private

        def expand_instrument_name(operation)
          "authnd.client.#{middleware_name}.#{operation}"
        end
      end
    end
  end
end
