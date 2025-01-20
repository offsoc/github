module Failbot
  # A simple parser to extract structure from ruby backtraces.
  #
  # See https://docs.sentry.io/development/sdk-dev/event-payloads/stacktrace/ for details on what data can sent
  class Backtrace
    # Raised when a line fails parsing.
    ParseError = Class.new(StandardError)

    attr_reader :frames

    def self.parse(backtrace)
      fail ArgumentError, "expected Array, got #{backtrace.class}" unless backtrace.is_a?(Array)

      frames = backtrace.map do |frame|
        Frame.parse(frame)
      end

      new(frames)
    end

    def initialize(frames)
      @frames = frames
    end

    # A parsed stack frame.
    class Frame
      # Regex matching the components of a ruby stack frame as they
      # are printed in a backtrace.

      # Regex adapted from sentry's parser:
      # https://github.com/getsentry/raven-ruby/blob/2e4378d95dae95a31e3386b2b94c8520649c6876/lib/raven/backtrace.rb#L10-L14
      FRAME_FORMAT = /
        \A
          \s*
          ([^:]+ | <.*>):         # abs_path
          (\d+)                   # line_number
          (?: :in \s `([^']+)')?  # method
        \z
      /x

      attr_reader :file_name, :line_number, :method, :abs_path

      # Returns a Frame given backtrace component string or raises
      # ParseError if it's malformed.
      def self.parse(unparsed_line)
        match = unparsed_line.match(FRAME_FORMAT)
        if match
          abs_path, line_number, method = match.captures

          file_name = extract_file_name(abs_path)

          new(abs_path, file_name, line_number, method)
        else
          raise ParseError, "unable to parse #{unparsed_line.inspect}"
        end
      end

      # Older versions of ruby don't have String#delete_prefix so for them we
      # fall back to a slower implementation.
      if String.new.respond_to?(:delete_prefix)
        def self.extract_file_name(abs_path)
          if Failbot.source_root
            abs_path.delete_prefix(Failbot.source_root)
          else
            abs_path
          end
        end
      else
        def self.extract_file_name(abs_path)
          if Failbot.source_root
            abs_path.gsub(/\A#{Failbot.source_root}/, "")
          else
            abs_path
          end
        end
      end

      private_class_method :extract_file_name

      def initialize(abs_path, file_name, line_number, method)
        @abs_path = abs_path
        @file_name = file_name
        @line_number = line_number
        @method = method
      end

      def to_s
        "#{file_name}:#{line_number}:in `#{method}'"
      end
    end
  end
end
