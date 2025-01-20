# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      module Appenders
        class MemoryAppender < SemanticLogger::Subscriber
          attr_accessor :logs

          def initialize(level: :trace)
            super(level: level, metrics: false)
            @logs = []
          end

          def log(log)
            @logs << log
          end

          def clear
            @logs.clear
          end
        end
      end
    end
  end
end
