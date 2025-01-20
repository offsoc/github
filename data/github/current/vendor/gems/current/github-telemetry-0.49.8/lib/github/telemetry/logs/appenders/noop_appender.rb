# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      module Appenders
        # Suppresses logging by no-oping logs and returning nil
        class NoopAppender < SemanticLogger::Subscriber
          def log(_log)
            nil
          end
        end
      end
    end
  end
end
