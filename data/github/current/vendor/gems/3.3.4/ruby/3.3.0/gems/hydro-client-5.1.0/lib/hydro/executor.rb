module Hydro
  class Executor
    # Public: Build a new executor to run a processor as a service.
    #
    # process          - A Hydro::Processor instance.
    # consumer         - A Hydro::Consumer to pull messages from.
    # shutdown_signals - An Array<Symbol> of UNIX signals that should shut down the processor.
    def initialize(processor:, consumer:, shutdown_signals: [:INT])
      @processor = processor
      @consumer = consumer
      @shutdown_signals = shutdown_signals
    end

    def run
      puts "Starting up #{processor.class}"

      setup_signal_handlers

      run_processor_loop do
        wait_for_threads
        puts "Shutting down #{processor.class}"
      end

      exit
    end

    def run_processor_loop
      @processor_loop = Thread.new { start }
      @processor_loop.abort_on_exception = true

      yield if block_given?

      shutdown
    end

    private

    attr_reader :processor, :consumer, :shutdown_signals

    def start
      processor.consumer = consumer
      processor.run_callbacks(:open) do
        consumer.open
      end

      if processor.batching?
        consumer.each_batch do |batch|
          processor.process_with_consumer(batch, consumer)
        end
      else
        consumer.each_message do |message|
          processor.process_with_consumer(message, consumer)
        end
      end
    end

    def shutdown
      processor.run_callbacks(:close) do
        consumer.close
      end
      @processor_loop.join if @processor_loop&.alive?
    end

    def setup_signal_handlers
      puts "Waiting for #{shutdown_signal_names.join(', ')} to shutdown"

      @signal_monitor = Thread.new do
        this_thread = Thread.current

        shutdown_signals.each do |signal|
          Signal.trap(signal) do
            @trapped = signal
            this_thread.kill
          end
        end

        sleep
      end
      @signal_monitor.abort_on_exception = true
    end

    def wait_for_threads
      queue = Thread::Queue.new
      [@signal_monitor, @processor_loop].each do |thread|
        Thread.new(thread) do
          begin
            thread.join
          ensure
            queue << thread
          end
        end
      end
      case queue.pop
      when @signal_monitor
        puts "Received SIG#{@trapped}"
      when @processor_loop
        puts "Processor thread finished"
        @signal_monitor.kill # No need to wait for signals - we're already exiting
      end
    end

    def shutdown_signal_names
      shutdown_signals.map { |signal| "SIG#{signal}" }
    end
  end
end
