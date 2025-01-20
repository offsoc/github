# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Namespace for ActiveSupport::LogSubscribers
      module ActiveJob

      end
    end
  end
end

require_relative "active_job/logging_extensions"
require_relative "active_job/subscriber"
