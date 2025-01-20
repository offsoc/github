# frozen_string_literal: true

require "syslog"

module GitHub
  module Telemetry
    module Logs
      module Formatters
        # Default level map for every log level
        #
        # :fatal   => ::Syslog::LOG_CRIT    - "A critical condition has occurred"
        # :error   => ::Syslog::LOG_ERR     - "An error occurred"
        # :warning =>::Syslog::LOG_WARNING  - "Warning of a possible problem"
        # :info    => ::Syslog::LOG_NOTICE  - "A normal but significant condition occurred"
        # :debug   => ::Syslog::LOG_INFO    - "Informational message"
        # :trace   => ::Syslog::LOG_DEBUG   - "Debugging information"
        #
        # The following levels are not used by default.
        # ::Syslog::LOG_EMERG   - "System is unusable"
        # ::Syslog::LOG_ALERT   - "Action needs to be taken immediately"
        #
        # This code is taken almost verbatim from the SemanticLogger::Formatters::Syslog class.
        # The upstream formatter has a dependency on the `syslog_protocol` gem, which is required for sending remote syslog over UDP or TCP.
        # In GHES and dotcom we send logs to a local syslog daemon, so we don't need the `syslog_protocol` gem.
        # https://github.com/reidmorrison/semantic_logger/blob/8a1650ac90db653849b3082946e02db5c8f6cdd3/lib/semantic_logger/formatters/syslog.rb#L25
        class SyslogLevelMap
          attr_accessor :trace, :debug, :info, :warn, :error, :fatal

          def initialize(trace: ::Syslog::LOG_DEBUG, debug: ::Syslog::LOG_INFO, info: ::Syslog::LOG_NOTICE, warn: ::Syslog::LOG_WARNING, error: ::Syslog::LOG_ERR, fatal: ::Syslog::LOG_CRIT)
            @trace = trace
            @debug = debug
            @info  = info
            @warn  = warn
            @error = error
            @fatal = fatal
          end

          def [](level)
            public_send(level)
          end
        end
      end
    end
  end
end
