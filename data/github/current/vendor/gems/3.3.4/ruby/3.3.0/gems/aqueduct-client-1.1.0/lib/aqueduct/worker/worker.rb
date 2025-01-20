require "nanoid"
require "socket"

module Aqueduct
  module Worker
    class Worker
      attr_reader :backend, :queues, :config, :logger, :current_job, :current_job_started_at, :last_heartbeat_at

      # Public: Build a new aqueduct worker.
      #
      # backend - The Backend used for receiving and ACKing jobs (required).
      # queues  - An Array<String> of queues to receive from (required).
      # logger  - A Logger (required).
      # config  - An Aqueduct::Worker config to inject the job handler, error
      #           handler, callbacks, etc.
      def initialize(backend:, queues:, logger:, config: Aqueduct::Worker.config)
        @backend = backend
        @worker_id = [@backend.client_id, Nanoid.generate].join("-")
        @queues = Array(queues).map { |queue| queue.to_s.strip }
        @logger = logger
        @config = config

        @switch = Switch.new(
          check: ->() { !config.quiesce_check.call },
          interval: config.quiesce_check_interval,
          logger: logger,
          reporter: -> (e) { config.error_reporter.call(e, nil) }
        )

        @shutdown_attempts = 0
        @shutdown_at = nil
        @hard_shutdown_signal = nil

        @paused = false

        @heartbeat_check_interval_seconds = config.heartbeat_check_interval_seconds
        @heartbeat_interval_seconds = config.heartbeat_interval_seconds

        @pool = config.worker_pool
      end

      def worker_id
        @worker_id
      end

      def work(interval = 5.0, &block)
        procline "Starting"
        logger.debug("starting")
        validate_queues
        register_signal_handlers
        interval = [Float(interval), 1.0].max
        backend.register_worker(self)
        start_heartbeat

        config.run_hook :after_startup, self

        loop do
          if quiesced?
            procline "Quiesced since #{Time.now.to_i}"
            logger.debug("quiesced")
            sleep 0.1 until !quiesced? || shutdown?
          end

          if paused?
            procline "Paused since #{Time.now.to_i}"
            logger.debug("paused")
            sleep 0.1 until !paused? || shutdown?
          end

          break if shutdown?

          config.run_hook :before_pop, self
          procline "Waiting for #{queues.join(',')}"
          result = backend.pop(queues, interval, worker_id: @worker_id, worker_pool: @pool)

          if result.invalid_payload?
            config.run_hook :invalid_payload, self, result.value
          end

          if result.error?
            config.error_reporter.call(result.error, nil)
            sleep interval
          elsif result.invalid_payload? && config.invalid_payload_policy == Config::INVALID_PAYLOAD_POLICY_REJECT
            reject(result.value)
          elsif result.present?
            job = result.value
            procline "Processing job #{job.id} from #{job.queue} since #{Time.now.to_i}"

            if config.fork_per_job?
              perform_with_fork(job, &block)
            else
              perform(job, &block)
            end
          else
            config.run_hook :queues_empty, self
          end

          if result.backoff?
            logger.debug("backing off for #{result.backoff_seconds} seconds")

            start = Time.now
            until (Time.now - start) >= result.backoff_seconds
              break if shutdown?
              sleep 1
            end
          end
        end

        stop_heartbeat
        backend.unregister_worker(self)
      rescue Exception => e
        config.error_reporter.call(e, nil)
        logger.error("Failed to start worker : #{e.inspect}")
        backend.unregister_worker(self, e)
      end

      def start_heartbeat
        return if config.heartbeating_disabled?

        @heartbeat = Thread.new do
          loop do
            if send_heartbeat? && @current_job
              result = backend.heartbeat(@current_job)
              @last_heartbeat_at = Time.now

              unless result.ok?
                logger.error("Failed to heartbeat: #{result.error.inspect}")
              end
            end

            sleep @heartbeat_check_interval_seconds
          end
        end

        @heartbeat.abort_on_exception = true
      end

      def stop_heartbeat
        @heartbeat && @heartbeat.kill
      end

      def send_heartbeat?
        @last_heartbeat_at && (Time.now - @last_heartbeat_at) > @heartbeat_interval_seconds
      end

      def inspect
        "#<Worker #{to_s}>"
      end

      def to_s
        @to_s ||= "#{hostname}:#{Process.pid}:#{queues.join(',')}"
      end
      alias :id :to_s

      # Stop processing jobs after the current one has completed (if we're
      # currently running one).
      def pause_processing
        puts "USR2 received; pausing job processing"
        @paused = true
      end

      # Start processing jobs again after a pause
      def unpause_processing
        puts "CONT received; resuming job processing"
        @paused = false
      end

      # Schedule this worker for shutdown. Will finish processing the
      # current job.
      def shutdown
        logger.info("Exiting...")
        @shutdown_attempts += 1
        @shutdown_at ||= Time.now
      end

      # Should this worker shutdown as soon as current job is finished?
      def shutdown?
        @shutdown_attempts > 0
      end

      # Kill the child and shutdown immediately.
      # If not forking, abort this process.
      def shutdown!(signal = nil)
        @hard_shutdown_signal = signal
        shutdown
        kill_child
      end

      private

      # are we paused?
      def paused?
        @paused
      end

      def quiesced?
        !@switch.on?
      end

      # Registers the various signal handlers a worker responds to.
      #
      # TERM: If terminating gracefully, shut down after the current job has
      #       been processed. Otherwise, shutdown immediately. Either way, don't
      #       process any new jobs.
      #  INT: Shutdown immediately, stop processing jobs.
      # QUIT: Shutdown after the current job has finished processing.
      # USR1: Kill the forked child immediately, continue processing jobs.
      # USR2: Don't process any new jobs
      # CONT: Start processing jobs again after a USR2
      def register_signal_handlers
        trap('TERM') { config.graceful_term? ? shutdown : shutdown!(:TERM) }
        trap('INT')  { shutdown!(:INT) }

        begin
          trap('QUIT') { shutdown }
          trap('USR1') { kill_child }
          trap('USR2') { pause_processing }
          trap('CONT') { unpause_processing }
        rescue ArgumentError
          logger.warn("Signals QUIT, USR1, USR2, and/or CONT not supported.")
        end

        logger.debug("Registered signals")
      end

      def validate_queues
        if queues.empty?
          raise ArgumentError.new("Please give each worker at least one queue.")
        end
      end

      def perform(job)
        begin
          config.run_hook :before_perform, self, job
          @current_job = job
          @current_job_started_at = @last_heartbeat_at = Time.now

          status = JobStatus.new
          config.handler.call(job, status)
          result = if status.failed?
                     backend.report_failure(job, status.error)
                   else
                     backend.report_success(job)
                   end
          config.error_reporter.call(result.error, job) if result.error?
        rescue Exception => e
          config.error_reporter.call(e, job)
        ensure
          config.run_hook :after_perform, self, job
          @current_job = nil
          yield job if block_given?
        end
      end

      def perform_with_fork(job, &block)
        config.run_hook :before_fork, self, job

        @child = fork do
          config.run_hook :after_fork, self, job
          perform(job, &block)
          exit! if config.fork_per_job?
        end

        srand # Reseeding
        procline "Forked #{@child} at #{Time.now.to_i}"
        logger.debug "forked #{@child}"

        begin
          Process.waitpid(@child)
        rescue SystemCallError
          nil
        end

        if $?.signaled?
          backend.report_failure(job, DirtyExit.new("Child process received unhandled signal #{$?}"))
        end
        @child = nil
      end

      def reject(job)
        result = backend.report_failure(job, nil)
        config.error_reporter.call(result.error, job) if result.error?
      rescue Exception => e
        config.error_reporter.call(e, job)
      end

      def kill_child
        if @child
          logger.warn("Killing child at #{@child}")
          if system("ps -o pid,state -p #{@child}")
            Process.kill("KILL", @child) rescue nil
          else
            logger.warn("Child #{@child} not found, restarting.")
            shutdown
          end
        elsif !config.fork_per_job? && @current_job
          if @shutdown_attempts > 0
            seconds_since_shutdown = Time.now.to_i - @shutdown_at.to_i
            if @hard_shutdown_signal
              shutdown_via = "via SIG#{@hard_shutdown_signal} "
            end

            raise JobKilled, "Worker killed #{shutdown_via}while processing job after #{seconds_since_shutdown} seconds and #{@shutdown_attempts - 1} graceful shutdown attempt(s)"
          else
            raise JobKilled, "Worker killed while processing job"
          end
        end
      end

      # chomp'd hostname of this worker's machine
      def hostname
        @hostname ||= Socket.gethostname
      end

      # Given a status, sets the procline ($0) and logs.
      def procline(status)
        version = "aqueduct-#{Aqueduct::VERSION}"
        if config.procline
          line = config.procline.call(version)
          $0 = "#{line}: #{status}"
        else
          $0 = "#{version}: #{status}"
        end
      end

      class DirtyExit < RuntimeError
      end
    end
  end
end
