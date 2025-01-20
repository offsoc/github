# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # Command contains methods for executing shell commands
    #
    # Examples:
    #   Command.new("ls -l").run
    #   Command.new("ls -l").run!
    #   Command.new("ls -l", env_vars: { "FOO" => "bar" }).run
    #
    #   command = Command.new("ls -l")
    #   command.on_stdout { |line| if line =~ /foo/; puts line; end }
    #   command.run
    #
    #   command = Command.new("ls -l", capture: true)
    #   command.run
    #   puts command.stdout
    #   puts command.stderr
    class Command
      class MissingExecutableError < StandardError; end
      class CommandFailedError < StandardError; end

      COMMAND_GENERAL_FAILURE_EXIT_CODE = 1
      COMMAND_NOT_FOUND_EXIT_CODE = 127

      attr_reader :capture, :command, :current_span, :env_vars, :logger, :stdout, :stderr

      def initialize(command, env_vars: {}, logger: Enterprise::ConfigApply.logger, current_span: OpenTelemetry::Trace.current_span, capture: false)
        @command = command
        @env_vars = env_vars
        @logger = logger
        @current_span = current_span

        # Process::Status object used internally to store the result of the command
        @status = nil

        # Block to be called when a line is read from the command's stdout
        @on_stdout_handler = nil

        # Capture the stdout and stderr of the command
        @capture = capture
      end

      # Run a command and log the output to the Config Apply logger
      # Raises MissingExecutableError if the command is not found
      # Returns self
      def run
        logger.info(command)

        if capture
          # String.new returns a mutable string so later we can << to it
          @stdout = String.new
          @stderr = String.new
        end

        start_time = Time.now.utc.iso8601(3)

        Open3.popen3(env_vars, command) do |_, stdout, stderr, wait_thr|
          stdout_thread = Thread.new do
            while (line = stdout.gets) do
              logger.info(line)
              @stdout << line if capture
              call_stdout_handler(line)
            end
          end

          stderr_thread = Thread.new do
            while (line = stderr.gets) do
              logger.info(line)
              @stderr << line if capture
            end
          end

          stdout_thread.join
          stderr_thread.join
          @status = wait_thr.value
        end

        self
      rescue Errno::ENOENT => error
        @status = OpenStruct.new(exitstatus: COMMAND_NOT_FOUND_EXIT_CODE)

        current_span&.add_attributes({
          "exception.type" => error.class.name,
          "exception.message" => error.message,
          "exception.stacktrace" => error.backtrace.join("\n"),
        })

        raise MissingExecutableError, error
      ensure
        current_span&.add_event(command, attributes: {
          "process.command_line" => command,
          "process.exit.code" => exitstatus,
          "process.creation.time" => start_time,
          "process.exit.time" => Time.now.utc.iso8601(3),
        })
      end

      # Run a command and log the output
      # Raises CommandFailedError if the command exits with a non-zero status
      # Returns Command object
      def run!
        run.tap do
          unless success?
            raise CommandFailedError, "Command failed: #{command}. Exit status: #{exitstatus}"
          end
        end
      end

      def exitstatus
        @status&.exitstatus || COMMAND_GENERAL_FAILURE_EXIT_CODE
      end

      def success?
        @status.success?
      end

      def on_stdout(&block)
        if block_given?
          @on_stdout_handler = block
        else
          raise ArgumentError, "Block required"
        end
      end

      private

      def call_stdout_handler(line)
        @on_stdout_handler&.call(line)
      end
    end
  end
end
