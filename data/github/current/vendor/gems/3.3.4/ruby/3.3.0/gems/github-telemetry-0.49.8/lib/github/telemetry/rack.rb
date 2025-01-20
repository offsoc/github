# frozen_string_literal: true

module GitHub
  module Telemetry
    # Namespace for telemetry middleware
    module Rack
    end
  end
end

require_relative "rack/request_id"
