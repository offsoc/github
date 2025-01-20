module Failbot
  # This is the default backtrace parser for the Structured formatter.
  class BacktraceParser
    EMPTY_ARRAY = [].freeze

    # Takes an Exception instance, returns an array of hashes with the keys that the Structured formatter expects.
    def self.call(exception, backtrace_trimmer: Failbot.backtrace_trimmer, frame_processing_pipeline: Failbot.frame_processing_pipeline)
      if exception.backtrace
        backtrace = exception.backtrace
        backtrace = maybe_trim_backtrace(exception, backtrace, backtrace_trimmer)
        parse_backtrace(backtrace, frame_processing_pipeline).reverse
      else
        EMPTY_ARRAY
      end
    end

    def self.maybe_trim_backtrace(exception, backtrace, backtrace_trimmer)
      if backtrace_trimmer.should_trim?(exception.class, backtrace)
        backtrace_trimmer.trim(backtrace.uniq)
      else
        backtrace
      end
    end

    def self.parse_backtrace(backtrace, frame_processing_pipeline=Failbot.frame_processing_pipeline)
      raise ArgumentError, "expected Array, got #{backtrace.class}" unless backtrace.is_a?(Array)
      backtrace.map do |frame|
        Failbot::Backtrace::Frame.parse(frame, frame_processing_pipeline)
      end
    end
  end
end
