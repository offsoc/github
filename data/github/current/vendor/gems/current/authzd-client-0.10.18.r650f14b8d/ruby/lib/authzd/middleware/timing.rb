# frozen_string_literal: true

require_relative "base"

module Authzd
  module Middleware
    class Timing < Base

      def initialize(instrumenter: Instrumenters::Noop)
        @instrumenter = instrumenter
      end

      def perform(req, metadata = {})
        op = req.rpc_name
        instrument(op) do |payload|
          payload[:authz_request] = req
          payload[:response] = request.perform(req, metadata)
        end
      end

      protected

      def middleware_name
        :timing
      end
    end
  end
end
