# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Provide a logger instance that does not log
      class NullLogger < SemanticLogger::Logger
        def initialize
          super("NullLogger", nil, nil)
        end

        def log_internal(level, index, message = nil, payload = nil, exception = nil); end
      end
    end
  end
end
