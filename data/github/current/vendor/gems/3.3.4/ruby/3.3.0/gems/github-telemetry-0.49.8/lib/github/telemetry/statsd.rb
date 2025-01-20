# frozen_string_literal: true

module GitHub
  module Telemetry
    # namespace for StatsD::Instrument based reporter
    module Statsd
    end
  end
end

require_relative "statsd/metrics_reporter"
