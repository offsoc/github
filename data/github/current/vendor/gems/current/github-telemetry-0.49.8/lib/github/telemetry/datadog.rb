# frozen_string_literal: true

require "datadog/statsd"

module GitHub
  module Telemetry
    # Namespace for Datadog Metrics related code
    module Datadog
    end
  end
end

require_relative "datadog/metrics_reporter"
