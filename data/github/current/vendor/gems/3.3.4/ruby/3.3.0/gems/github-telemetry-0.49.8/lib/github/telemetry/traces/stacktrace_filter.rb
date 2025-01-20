# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module NoopStacktraceTrimmer
        module_function

        def trim(backtrace)
          backtrace
        end

        def should_trim?(klass, backtrace)
          false
        end
      end


      module NoopStacktraceCleaner
        module_function

        def clean(backtrace, _ = :silent)
          backtrace
        end
      end

      # Mediator used to process backtraces leveraging multiple backtrace cleaners with distinct interfaces:
      # - ActiveSupport::BacktraceCleaner
      # - Failbot::BacktraceTrimmer
      #
      # @api private
      class StacktraceFilter
        attr_reader :backtrace_cleaner
        attr_reader :backtrace_trimmer

        # Use `.new_instance` instead
        #
        # @api private
        def initialize(trimmer, cleaner)
          @backtrace_trimmer = trimmer
          @backtrace_cleaner = cleaner
        end

        # Cleans and optionally trims an exception's backtrace
        #
        # Trimming occurs if the Failbot::Backtrace::Trimmer#should_trim? method returns true
        #
        # @param exception [Exception] the exception to clean
        # @return [Array<String>] the cleaned and trimmed backtrace
        def clean(exception)
          return unless exception.backtrace
          cleansed_backtrace = backtrace_cleaner.clean(exception.backtrace)&.uniq

          return cleansed_backtrace unless backtrace_trimmer.should_trim?(exception.class, cleansed_backtrace)
          backtrace_trimmer.trim(cleansed_backtrace)
        end

        # Creates a new instance of the StacktraceFilter with a default trimmer and cleaner.
        #
        # It attempts to use the globally configured Failbot.backtrace_trimmer and Rails.backtrace_cleaner.
        # It will use the NoopStacktraceCleaner in cases where neither are present or initialized.
        #
        # @return [StacktraceFilter] used to process backtraces
        def self.new_instance
          trimmer = Failbot.backtrace_trimmer if defined?(Failbot) && Failbot.backtrace_trimmer
          trimmer ||= NoopStacktraceTrimmer
          cleaner = Rails.backtrace_cleaner if defined?(Rails) && Rails.respond_to?(:backtrace_cleaner)
          cleaner ||= NoopStacktraceCleaner

          new(trimmer, cleaner)
        end
      end
    end
  end
end
