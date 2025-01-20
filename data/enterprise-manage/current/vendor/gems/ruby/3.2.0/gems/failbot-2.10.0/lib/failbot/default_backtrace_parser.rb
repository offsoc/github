module Failbot
  # This is the default backtrace parser for the Structured formatter.
  module DefaultBacktraceParser
    EMPTY_ARRAY = [].freeze

    # Takes an Exception instance, returns an array of hashes with the keys
    # that the Structured formatter expects.
    def self.call(exception)
      if exception.backtrace
        Backtrace.parse(exception.backtrace).frames.reverse.map do |line|
          {
            "filename" => line.file_name,
            "abs_path" => line.abs_path,
            "lineno"   => line.line_number,
            "function" => line.method
          }
        end
      else
        EMPTY_ARRAY
      end
    end
  end
end
