module Aqueduct
  module Worker
    class Config
      # Determines whether or not the worker will fork a new child process in
      # order to perform each job. Defaults to true.
      attr_writer :fork_per_job

      # Determines whether or not the worker allows the current job to run to
      # completion rather than exiting immediately after receiving a SIGTERM.
      attr_writer :graceful_term

      # Handler is a block which takes the `job` as an argument and executes it.
      # Override this to define how an Aqueduct::Worker::Job is processed.
      #
      # Its default implementation is a log statement and a random sleep.
      attr_writer :handler

      # Error reporter is a block that takes an exception and, if applicable,
      # the job being executed, and may publish the exception information.
      #
      # The default implementation prints the error and backtrace to STDERR.
      attr_writer :error_reporter

      # Procline is a block that allows customization of the procline.
      #
      # The block is given the default version string ("aqueduct-<version>")
      # and the returned string is added to the procline: "<customized string>:
      # <status>".
      attr_accessor :procline

      # The quiesce check is a block called to determine if the workers should
      # be processing jobs. If the quiesce check returns true, the worker will
      # quiesce (stop processing jobs) but does not exit and will resume once
      # the next check returns false. Exceptions thrown from the check are
      # caught and will result in a quiesced worker, but are reported so it's
      # good practice to handle them in the check itself to avoid exception
      # noise. The check is always called before running the first job. The
      # default value is false (i.e. always processing).
      attr_writer :quiesce_check

      # The minimum interval in seconds from when the last check completed
      # until the check will fire again. Setting this to a high value will
      # result in fewer check calls, but will increase the time taken to
      # quiesce or resume when the underlying state the check monitors changes.
      # The default value is 5 seconds.
      attr_writer :quiesce_check_interval


      # When a worker fails to process a job within the job redelivery timeout,
      # aqueduct will redeliver the job to a different worker. This behavior is
      # desirable if a job was dropped in flight or if the worker was OOM-killed,
      # but isn't desirable if a job is simply taking a long time to process.
      # To prevent unwanted redelivery, workers send heartbeat requests to
      # aqueduct. Heartbeats indicate the job processing is still in progress and
      # each heartbeat restarts the clock on redelivery timeout.
      #
      # The default heartbeat interval is 60 seconds, which means it could take
      # aqueduct (60 seconds + redelivery timeout) to redeliver a lost job.
      # Aqueduct will redeliver jobs faster if the client descreases the
      # redelivery timeout config. *IMPORTANT:* The redelivery timeout should
      # always be greater than the heartbeat interval, and preferably >3x to
      # allow for heartbeat request failure.
      attr_writer :heartbeat_interval_seconds

      # Disable worker heartbeats.
      attr_writer :disable_heartbeats

      # How often to check if a heartbeat should be sent. Mostly an internal
      # config for testing.
      attr_writer :heartbeat_check_interval_seconds

      # A worker pool is used to logically group a set of workers together.
      # A pool is required to enable aqueduct execution time throttling.
      attr_accessor :worker_pool

      # Determines worker behavior when a payload HMAC signature is invalid. Valid values are
      #   :reject - Immedetialy ACKs the job as failed and does not call the handler (default).
      #   :ignore - Allows the invalid job to execute.
      #
      # In both cases, the :invalid_payload hook runs.
      def invalid_payload_policy=(policy)
        unless [INVALID_PAYLOAD_POLICY_REJECT, INVALID_PAYLOAD_POLICY_IGNORE].include?(policy)
          raise ArgumentError.new("Unknown invalid payload policy #{policy.inspect}")
        end

        @invalid_payload_policy = policy
      end

      def initialize
        @fork_per_job = true
        @graceful_term = false
        @hooks = Hash.new { |h, k| h[k] = [] }
      end

      # Is the worker configured to fork per job?
      def fork_per_job?
        @fork_per_job
      end

      # Is the worker configured to terminate gracefully?
      def graceful_term?
        @graceful_term
      end

      # The configured handler, or default.
      def handler
        @handler ||= DEFAULT_HANDLER
      end

      # The configured error reporter, or default.
      def error_reporter
        @error_reporter ||= DEFAULT_ERROR_REPORTER
      end

      # The configured quiesce check callback, or default (false)
      def quiesce_check
        @quiesce_check ||= DEFAULT_QUIESCE_CHECK
      end

      # The configured quiesce check interval in seconds, or default (5 seconds)
      def quiesce_check_interval
        @livness_check_interval || DEFAULT_QUIESCE_CHECK_INTERVAL
      end

      # The configured heartbeat interval, or default (60 seconds)
      def heartbeat_interval_seconds
        @heartbeat_interval_seconds || DEFAULT_HEARTBEAT_INTERVAL_SECONDS
      end

      # Has heartbeating been intentionally disabled?
      def heartbeating_disabled?
        @disable_heartbeats
      end

      # The configured heartbeat check interval, or default (10 seconds)
      def heartbeat_check_interval_seconds
        @heartbeat_check_interval_seconds || DEFAULT_HEARTBEAT_CHECK_INTERVAL_SECONDS
      end

      def invalid_payload_policy
        @invalid_payload_policy || DEFAULT_INVALID_PAYLOAD_POLICY
      end

      # Define a callback that runs after the Worker has started up.
      #
      # Configured blocks are called with a Worker instance as the argument.
      def after_startup(&block)
        @hooks[:after_startup] << block
      end

      # Define a callback that runs before a Worker forks to perform a job. Only
      # applies when `fork_per_job` is true.
      #
      # Configured blocks are called with a Worker instance as the argument.
      def before_fork(&block)
        @hooks[:before_fork] << block
      end

      # Define a callback that runs in the child process after a Worker forks to
      # perform a job. Only applies when `fork_per_job` is true.
      #
      # Configured blocks are called with a Worker instance as the argument.
      def after_fork(&block)
        @hooks[:after_fork] << block
      end

      # Define a callback that runs before pop is called on the Backend
      def before_pop(&block)
        @hooks[:before_pop] << block
      end

      # Define a callback that runs before a Worker performs the job.
      #
      # Configured blocks are called with the Worker and the Job as arguments.
      def before_perform(&block)
        @hooks[:before_perform] << block
      end

      # Define a callback that runs after a Worker performs the job. Always
      # executes even if the job execution has raised an exception.
      #
      # Configured blocks are called with the Worker and the Job as arguments.
      def after_perform(&block)
        @hooks[:after_perform] << block
      end

      # Define a callback that runs when a Worker completes a Receive request without dequeuing a
      # job because all queues are empty.
      #
      # Configured blocks are called with the Worker instance as the argument.
      def queues_empty(&block)
        @hooks[:queues_empty] << block
      end

      # Define a callback that runs when a Worker encounters a job payload with an invalid signature.
      #
      # Configured blocks are called with the Worker and the Job as arguments.
      def on_invalid_payload(&block)
        @hooks[:invalid_payload] << block
      end

      # Internal: run the given hook, passing the given arguments to each
      # configured block.
      def run_hook(hook, *args)
        @hooks[hook].each do |block|
          block.call(*args)
        end
      end

      DEFAULT_HANDLER = ->(job) {
        puts "Processing job #{job}"
        sleep rand(5)
      }

      DEFAULT_ERROR_REPORTER = ->(exception, job = nil) {
        STDERR.puts "ERROR: #{exception}\n#{exception.backtrace.join("\n")}"
      }

      DEFAULT_QUIESCE_CHECK = -> { false }

      DEFAULT_QUIESCE_CHECK_INTERVAL = 5

      DEFAULT_HEARTBEAT_INTERVAL_SECONDS = 60

      DEFAULT_HEARTBEAT_CHECK_INTERVAL_SECONDS = 10

      DEFAULT_INVALID_PAYLOAD_POLICY = INVALID_PAYLOAD_POLICY_REJECT = :reject
      INVALID_PAYLOAD_POLICY_IGNORE = :ignore
    end
  end
end
