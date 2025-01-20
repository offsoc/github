# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Namespace for test utlities
      class Test
        def self.capture_logs(log_level: :info, &blk)
          enable_sync_processor do
            enable_log_level(log_level) do
              add_io_appender do
                blk.call
              end
            end
          end
        end

        def self.enable_sync_processor(&blk)
          sync_processor_enabled = SemanticLogger.sync?
          enable_sync_appender unless sync_processor_enabled
          blk.call
        ensure
          disable_sync_appender unless sync_processor_enabled
        end

        def self.enable_log_level(level, &blk)
          original_level = GitHub::Telemetry::Logs.logger.level
          GitHub::Telemetry::Logs.logger.level = level
          blk.call
        ensure
          GitHub::Telemetry::Logs.logger.level = original_level
        end

        def self.add_io_appender
          io = StringIO.new
          add_new_io_appender(io)

          yield
          read_output(io)
        ensure
          remove_io_appender
        end

        def self.enable_sync_appender
          SemanticLogger::Logger.sync!
        end

        def self.disable_sync_appender
          SemanticLogger::Logger.async!
        end

        def self.add_new_io_appender(io)
          SemanticLogger.add_appender(
            io: io,
            formatter: GitHub::Telemetry::Logs::Formatters::Logfmt.new,
            level: GitHub::Telemetry::Logs.logger.level
          )
        end

        def self.read_output(io)
          io.tap(&:rewind).read
        end

        def self.remove_io_appender
          SemanticLogger.appenders.pop
        end

        class << self
          private :enable_sync_processor, :enable_log_level, :add_io_appender, :enable_sync_appender, :disable_sync_appender, :add_new_io_appender, :read_output, :remove_io_appender
        end
      end
    end
  end
end
