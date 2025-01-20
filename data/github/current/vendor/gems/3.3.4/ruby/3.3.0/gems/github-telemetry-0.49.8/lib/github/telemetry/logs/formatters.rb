# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Namespace for custom log formatters middleware
      module Formatters
      end
    end
  end
end

require_relative "formatters/sem_conv_exception"
require_relative "formatters/logfmt"
