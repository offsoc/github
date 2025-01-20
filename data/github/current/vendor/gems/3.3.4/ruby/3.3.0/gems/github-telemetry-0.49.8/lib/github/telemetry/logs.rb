# frozen_string_literal: true

require "semantic_logger"
require_relative "logs/semantic_logger_base_patch"

module GitHub
  module Telemetry
    # Namespace for custom logging
    module Logs
      LOG_TO_STDOUT = "GITHUB_TELEMETRY_LOGS_STDOUT"
      LOG_TO_SYSLOG = "GITHUB_TELEMETRY_LOGS_SYSLOG"
      LOG_TO_FILE = "GITHUB_TELEMETRY_LOGS_FILE"
      LOG_TO_NOOP = "GITHUB_TELEMETRY_LOGS_NOOP"
      ENABLE_SYNC_APPENDER = "GITHUB_TELEMETRY_LOGS_ENABLE_SYNC_APPENDER"
      LIB_LEVEL = "GITHUB_TELEMETRY_LOGS_LIB_LEVEL"
      LEVEL = "GITHUB_TELEMETRY_LOGS_LEVEL"
      INCLUDE_RESOURCE_ATTRIBUTES = "GITHUB_TELEMETRY_LOGS_INCLUDE_RESOURCE_ATTRIBUTES"
      SEVERITY_LEVEL = "SeverityText"
      # List of supported Severity Levels
      module Severity
        %w[TRACE DEBUG INFO WARN ERROR FATAL].each { |level| const_set(level, level.downcase) }
      end

      module_function

      # Logger lookup method
      #
      # By default this method returns a global logger instance,
      # however if a `Class` parameter is provided this will create a new named logger instance.
      #
      # @param class [String|Class] used to create a named logger
      # @return SemanticLogger::Logger for the supplied class or class_name
      def logger(klass = nil)
        return SemanticLogger[klass].tap { |l| l.level = level } if klass

        return @logger if defined?(@logger)

        @logger = SemanticLogger["Telemetry"].tap { |l| l.level = level }
      end

      # Logger lookup method for 3rd party libs
      #
      # &#9888; You must call `enable` before loading lib_loggers otherwise they will default to the `debug` levels.
      #
      # @param class [String|Class] used to create a named logger
      # @return SemanticLogger::Logger for the supplied class or class_name
      def lib_logger(klass, level: nil)
        SemanticLogger[klass].tap { |logger| logger.level = level || lib_level }
      end

      # Initialize a new null logger
      # @return GitHub::Telemetry::Logs::NullLogger instance
      def null_logger
        NullLogger.new
      end

      def level
        @level ||= ENV[LEVEL]&.to_sym
      end

      def level=(log_level)
        @level = log_level
      end

      def lib_level=(log_level)
        @lib_level = log_level
      end

      def lib_level
        @lib_level ||= ENV[LIB_LEVEL]&.to_sym
      end

      def stdout_logging=(enable)
        @stdout_logging = enable
      end

      def stdout_logging?
        @stdout_logging == true
      end

      def syslog_logging=(enable)
        @syslog_logging = enable
      end

      def syslog_logging?
        @syslog_logging == true
      end

      def sync_appender=(enable)
        @sync_appender = enable
      end

      def sync_appender?
        @sync_appender == true
      end

      def noop_logging=(enable)
        @noop_logging = enable
      end

      def noop_logging?
        @noop_logging == true
      end

      # Conditionally replaces existing IO Appenders with a logfmt formatted appender
      #
      # @return [void]
      def enable_logfmt
        SemanticLogger.appenders.each do |app|
          if app.is_a?(SemanticLogger::Appender::IO) && !app.formatter.is_a?(Formatters::Logfmt)
            SemanticLogger.remove_appender(app)
          end
        end
        provider = IOStreamProvider.new
        SemanticLogger.add_appender(io: provider.stream, formatter: Formatters::Logfmt.new, level: :trace)
        return nil
      end

      # Disables logfmt formatted logs to stdout
      #
      # This is useful in cases where you are running an interactive REPL and do not want logs printed to screen
      def disable_logfmt
        SemanticLogger.appenders
                      .select { |app| app.console_output? && app.formatter.is_a?(Formatters::Logfmt) }
                      .each { |app| SemanticLogger.remove_appender(app) }
      end

      # Adds a syslog appender if one is not already configured
      #
      # @return [void]
      def add_syslog_appender
        if SemanticLogger.appenders.none?(::SemanticLogger::Appender::Syslog)
          require_relative "logs/formatters/syslog_level_map"
          SemanticLogger.add_appender(
            appender: :syslog,
            application: syslog_identifier,
            facility: ::Syslog::LOG_LOCAL7,
            formatter: Formatters::Logfmt.new,
            level_map: Formatters::SyslogLevelMap.new,
            level: level
          )
        end
        return nil
      end

      def enable_trace_correlation
        SemanticLogger.on_log(Correlation.new)
      end

      def add_file_appender(file_name, formatter)
        SemanticLogger.add_appender(
          file_name: file_name,
          formatter: formatter
        )
      rescue StandardError => e
        # In the unlikely event we are unable to create the default log file print warning message:
        $stderr.sync = true
        logger = ::Logger.new($stderr)
        logger.level = ::Logger::WARN
        logger.warn e.message
        logger.warn(
          "Unable to access log file. Please ensure that the default log/${RACK_ENV}.log exists and is writable " \
          "(i.e. make it writable for user and group: chmod 0664. "
        )
      end

      def enable
        return log_already_enabled_message if defined?(@enabled) && @enabled

        set_default_env_settings
        initialize_log_levels
        initialize_log_destinations
        if noop_logging?
          enable_noop_appender
        else
          enable_sync_appender if sync_appender?
          silence_global_backtraces
          enable_trace_correlation
          enable_logfmt if stdout_logging?
          add_syslog_appender if syslog_logging?
        end
        @enabled = true
        log_diagnostic_info
      end

      # Flushes and removes loaded appenders.
      # This is useful for testing
      # @api private
      def reset
        $stdout.sync = false
        SemanticLogger.flush
        SemanticLogger::Logger.subscribers&.clear
        SemanticLogger.clear_appenders!
        @enabled = false
        remove_instance_variable(:@logger) if defined?(@logger)
      end

      # After forking an active process call SemanticLogger.reopen to re-open
      # any open file handles etc to resources.
      #
      # Delegates to SemanticLogger.reopen
      #
      # See [SematicLogger Docs on Forking](https://logger.rocketjob.io/forking.html)
      def reopen
        SemanticLogger.reopen
      end

      # Sets the default environment variables
      #
      # @api private
      def set_default_env_settings
        ENV[LIB_LEVEL] ||= "fatal"
        ENV[LEVEL] ||= "fatal"
      end

      # Set log levels based on environment variables
      #
      # @api private
      def initialize_log_levels
        self.lib_level = ENV[LIB_LEVEL].to_sym
        self.level =  ENV[LEVEL].to_sym
      end

      # Set log destinations based on environment variables
      #
      # @api private
      def initialize_log_destinations
        self.stdout_logging   = (ENV[LOG_TO_STDOUT] == "true")
        self.syslog_logging   = (ENV[LOG_TO_SYSLOG] == "true")
        self.sync_appender    = (ENV[ENABLE_SYNC_APPENDER] == "true")
        self.noop_logging     = (ENV[LOG_TO_NOOP] == "true")
      end

      # Logs diagnostic info about the `Telemetry` configurations
      #
      def log_diagnostic_info
        logger("Telemetry").tap do |l|
          l.debug(
            "Logging initialized",
            {
              "gh.telemetry.severity_text" => level,
              "gh.telemetry.lib.severity_text" => lib_level,
              "gh.telemetry.stdout_logging_enabled" => stdout_logging?,
            }
          )
        end
        nil
      end

      # Logs a message indicating that logging has already been enabled and cannot be re-enabled
      #
      def log_already_enabled_message
        logger("Telemetry").tap do |l|
          l.warn(
            "Logging already initialized",
            {
              "gh.telemetry.severity_text" => level,
              "gh.telemetry.lib.severity_text" => lib_level,
              "gh.telemetry.stdout_logging_enabled" => stdout_logging?,
            }
          )
        end
        nil
      end

      # Prevents users from tweaking verbosity levels for logging backtraces
      def silence_global_backtraces
        SemanticLogger.backtrace_level = nil
      end

      # @api private
      # Syslog Identifier for the program
      # It is backward compatible with the Scrolls Logger identifier to allow fluentbit to route logs for programs like `ops-shell/gh-console`
      #
      # See https://github.com/asenchi/scrolls/blob/364efb989ff87ec205e7e901aa312aa2e15c57d8/lib/scrolls/logger.rb#L298
      def syslog_identifier
        File.basename($PROGRAM_NAME)
      end

      # @api private
      #
      # Switches semantic logger to using a synchronous appender
      def enable_sync_appender
        SemanticLogger.sync!
      end

      # @api private
      #
      # Clears existing SemanticLogger appenders and adds the noop appender
      def enable_noop_appender
        SemanticLogger.clear_appenders!
        SemanticLogger.add_appender(appender: Appenders::NoopAppender.new)
      end
    end
  end
end

require_relative "logs/correlation"
require_relative "logs/formatters"
require_relative "logs/loggable"
require_relative "logs/io_stream_provider"
require_relative "logs/appenders/memory_appender"
require_relative "logs/appenders/noop_appender"
require_relative "logs/null_logger"
require_relative "logs/test"
