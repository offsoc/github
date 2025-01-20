# frozen_string_literal: true

require_relative "instrumenters/noop"

module Authzd
  module Middleware
    class Base

      attr_accessor :request

      def instrument(op, payload = {}, &block)
        payload = {middleware: middleware_name.to_s, operation: op.to_s}.merge(payload)
        @instrumenter.instrument(expand_instrument_name(op), payload, &block)
      end

      protected

      def middleware_name
        raise NotImplementedError, "Must be overwritten in particular middleware classes"
      end

      private

      def expand_instrument_name(op)
        "authzd.client.#{self.middleware_name}.#{op}"
      end
    end
  end
end
