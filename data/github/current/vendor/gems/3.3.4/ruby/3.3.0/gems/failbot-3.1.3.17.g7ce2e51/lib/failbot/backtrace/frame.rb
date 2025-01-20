module Failbot
  class Backtrace
    class Frame
      class ParseError < StandardError; end
      # Regex matching the components of a ruby stack frame as they are printed in a backtrace.
      # Regex adapted from sentry's parser:
      # https://github.com/getsentry/sentry-ruby/blob/478c4cff5daf00719d46c0777a73da268e796b25/sentry-ruby/lib/sentry/backtrace.rb#L10-L16
      FRAME_FORMAT = /
        \A
          \s*
          ([^:]+ | <.*>):             # abs_path
          (\d+)                       # line_number
          (?: :in \s (`|')([^']+)')?  # method
        \z
      /x

      # Returns a frame hash given a backtrace line string or raises ParseError if it's malformed.
      def self.parse(line, processing_pipeline=Failbot.frame_processing_pipeline)
        processing_pipeline.reduce(line) do |processed_line, processor|
          processor.call(processed_line)
        end.then do |completely_processed_line|
          self.convert_to_hash(completely_processed_line)
        end
      end

      def self.convert_to_hash(line)
        match = line.match(FRAME_FORMAT)
        if match
          path, line_number, _, method = match.captures
          new_frame_hash(path, line_number, method)
        else
          raise ParseError, "unable to parse #{line.inspect}"
        end
      end

      def self.new_frame_hash(path, line_number, method)
        {
          "filename" => path,
          "abs_path" => path,
          "lineno"   => line_number,
          "function" => method
        }
      end
    end
  end
end
