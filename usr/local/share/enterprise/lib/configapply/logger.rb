# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # Logger is a wrapper around Ruby's Logger class that provides a few additional features:
    # - It supports multiple logging devices, including other Logger instances
    # - The logs are prefixed with a timestamp
    # - The default log device is STDOUT, but can be overridden with a `LOGFILE` environment variable.
    # - The default log level is INFO
    #
    # Example:
    #   Logger.new.info("log message")
    #   Logger.new(STDOUT, File.new("out1.log"), 'out2.log', Logger.new('out3.log')).info("log message")
    class Logger
      attr_reader :loggers

      def initialize(*logdevs, **kwargs)
        @loggers = []

        logdevs.each do |logdev|
          add_logger(logdev, **kwargs)
        end

        if @loggers.empty?
          add_logger(ENV.fetch('LOGFILE', $stdout), **kwargs)
        end
      end

      def add(level, *args)
        @loggers.each { |logger| logger.add(level, *args) }
      end

      ::Logger::Severity.constants.each do |level|
        define_method(level.downcase) do |*args|
          @loggers.each { |logger| logger.send(level.downcase, *args) }
        end
      end

      private

      def add_logger(logger, **kwargs)
        if logger.is_a?(::Logger) || logger.is_a?(self.class)
          @loggers << logger
          return
        end

        @loggers << ::Logger.new(logger, **kwargs).tap do |logger|
          logger.level = kwargs[:level] || ::Logger::Severity::INFO
          logger.formatter = proc do |_, datetime, _, msg|
            "#{datetime.strftime("#{ISO8601_FORMAT}")} #{msg.chomp}\n"
          end
        end
      end
    end

    # Logger for ConfigApply Instrumentation events
    class EventLogger < ::Logger
      def initialize(logdev = nil)
        super(logdev || ENV.fetch('EVENTS_LOGFILE', File::NULL))
        self.formatter = proc { |_, _, _, msg| "#{msg.chomp}\n" }
      end
    end
  end
end
