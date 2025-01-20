module Failbot
  class Backtrace
    class Trimmer
      attr_reader :stacktrace_frame_limit, :truncate_exception_types

      def initialize(stacktrace_frame_limit, truncate_exception_types)
        @stacktrace_frame_limit   = stacktrace_frame_limit ? Integer(stacktrace_frame_limit) : 500
        @truncate_exception_types = truncate_exception_types
      end

      def trim(traces)
        size_on_both_ends = stacktrace_frame_limit / 2
        traces.replace(
          (traces[0..(size_on_both_ends - 1)] || []) + (traces[-size_on_both_ends..-1] || []),
        )
      end

      def should_trim?(exception_class, traces)
        return false unless backtrace_too_long(traces)
        truncate_all_exceptions_by_default || exception_in_truncation_list(exception_class)
      end

      private

      def truncate_all_exceptions_by_default
        truncate_exception_types.empty?
      end

      def exception_in_truncation_list(exception_class)
        truncate_exception_types.include?(exception_class.to_s)
      end

      def backtrace_too_long(traces)
        traces.length > stacktrace_frame_limit
      end
    end
  end
end
