# frozen_string_literal: true

module GitHub
  module Telemetry
    # Namespace for telemetry middleware
    module FaradayMiddleware
    end
  end
end

require_relative "faraday_middleware/request_id"
