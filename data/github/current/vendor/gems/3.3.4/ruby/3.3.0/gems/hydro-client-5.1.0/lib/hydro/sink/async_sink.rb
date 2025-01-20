module Hydro
  class AsyncSink
    include Batching

    # Limit buffer to 10k messages.
    DEFAULT_MAX_BUFFER_SIZE = 10_000

    # Limit buffer to 32MB.
    DEFAULT_MAX_BUFFER_BYTES = 32 * 1024 * 1024

    # Limit flushed batches to 10MB.
    DEFAULT_MAX_FLUSH_BYTES = 10 * 1024 * 1024

    # Represents a change in buffer usage.
    BUFFER_EVENT = "buffer_usage.async_sink.hydro"

    # Represents an attempt to flush events to the sink.
    FLUSH_EVENT = "flush.async_sink.hydro"

    # Represents an error flushing events to the sink.
    FLUSH_ERROR_EVENT = "flush_error.async_sink.hydro"

    # The AsyncSink buffers messages and flushes to another sink in a background
    # thread.
    #
    # sink             - A Hydro::Sink to which messages will be flushed.
    # flush_interval   - The Integer interval in seconds to flush writes.
    # flush_threshold  - The Integer number of buffered messages that triggers an automatic flush.
    # max_buffer_size  - The Integer max number of messages to buffer. The sink will reject writes
    #                    once the max buffer size is reached.
    # max_buffer_bytes - The Integer max number of bytes to buffer. The sink will reject writes
    #                    once the buffer contains the max number of bytes.
    # max_flush_bytes  - The Integer max number of bytes per flush. If the buffer contains more than
    #                    the max bytes, the delivery thread will subdivide the buffer into smaller
    #                    batches.
    def initialize(sink:, flush_interval: nil, flush_threshold: nil,
                   max_buffer_size: DEFAULT_MAX_BUFFER_SIZE,
                   max_buffer_bytes: DEFAULT_MAX_BUFFER_BYTES,
                   max_flush_bytes: DEFAULT_MAX_FLUSH_BYTES)
      if flush_threshold.nil? && flush_interval.nil?
        raise ArgumentError.new("Must define a flush interval or flush threshold")
      end

      @sink = sink
      @flush_threshold = flush_threshold
      @flush_interval = flush_interval

      @buffer = Buffer.new
      @max_buffer_size = max_buffer_size
      @max_buffer_bytes = max_buffer_bytes
      @max_flush_bytes = max_flush_bytes

      @mutex = Mutex.new
      @condition = ConditionVariable.new
      @flush_now, @closed = false, false
      @delivery_thread_started = nil

      @validate = sink.respond_to?(:validate_messages)
    end

    def write(messages, options = {})
      unless delivery_thread_started?
        start_delivery_thread
      end

      if (@buffer.count + messages.size) > @max_buffer_size
        return Hydro::Sink::Result.failure(
          Hydro::Sink::BufferOverflow.new("max buffer size (#{@max_buffer_size} messages) reached"))
      end

      if @validate
        begin
          @sink.validate_messages(messages)
        rescue Hydro::Sink::MessagesInvalidError => e
          return Hydro::Sink::Result.failure(e)
        end
      end

      @buffer.concat(messages)

      instrument_buffer_usage

      if @flush_threshold && @buffer.count >= @flush_threshold
        flush
      end

      return Hydro::Sink::Result.success
    end

    def close
      @closed = true
      flush
      @delivery&.join
    end

    private

    def flush
      @mutex.synchronize do
        # If the delivery thread hasn't had a chance to wait on the condition
        # var, it should immediately flush.
        @flush_now = true
        @condition.signal
      end
    end

    def start_scheduler_thread(interval)
      Thread.new do
        loop do
          sleep(interval)
          flush
        end
      end
    end

    def delivery_thread_started?
      @delivery_thread_started == Process.pid
    end

    def start_delivery_thread
      @delivery_thread_started = Process.pid

      if @flush_interval
        start_scheduler_thread(@flush_interval)
      end

      @delivery = Thread.new do
        loop do
          @mutex.synchronize do
            @condition.wait(@mutex) unless @flush_now
            @flush_now = false
          end

          drain_buffer

          if @closed
            drain_buffer
            @sink.close
            break
          end
        end
      end
    end

    def drain_buffer
      Hydro.instrumenter.instrument(FLUSH_EVENT) do |notification|
        notification[:flushed_count] = 0
        @buffer.drain(max_batch_bytes: @max_flush_bytes) do |batch|
          begin
            result = @sink.write(batch)
            if result.success?
              notification[:flushed_count] += batch.size
            else
              instrument_flush_error(result.error)
            end

            if result.error.is_a?(Hydro::Sink::BufferOverflow)
              @buffer.unshift(result.error.messages)
            end
          rescue => e
            if e.is_a?(Hydro::Sink::BufferOverflow)
              @buffer.unshift(e.messages)
            end

            instrument_flush_error(e)
          end
          instrument_buffer_usage
        end
      end
    end

    def instrument_buffer_usage
      Hydro.instrumenter.instrument(BUFFER_EVENT, {
        size: @buffer.count,
        max_size: @max_buffer_size,
        bytesize: @buffer.bytesize,
        max_bytesize: @max_buffer_bytes,
      })
    end

    def instrument_flush_error(error)
      Hydro.instrumenter.instrument(FLUSH_ERROR_EVENT, {error: error})
    end

    class Buffer
      def initialize
        @buffer = []
        @draining = []
        @buffer_bytes = 0
        @draining_bytes = 0

        @lock = Mutex.new
      end

      def count
        @buffer.count + @draining.count
      end

      def bytesize
        @buffer_bytes + @draining_bytes
      end

      def concat(messages)
        @lock.synchronize do
          @buffer_bytes += messages.map(&:bytesize).inject(:+).to_i
          @buffer.concat(messages)
        end
      end

      def unshift(messages)
        @lock.synchronize do
          @buffer_bytes += messages.map(&:bytesize).inject(:+).to_i
          @buffer.unshift(*messages)
        end
      end

      def drain(max_batch_bytes:)
        @lock.synchronize do
          @draining = @buffer.slice!(0, @buffer.length)
          @draining_bytes = @buffer_bytes
          @buffer_bytes = 0
        end

        return unless @draining.any?

        # Fast-track the drain if all messages are under the byte limit.
        if @draining_bytes <= max_batch_bytes
          begin
            @draining_bytes = 0
            yield(@draining)
          ensure
            @draining = []
          end
          return
        end

        # Subdivide the batch, ensuring that count and bytesize are accurate until messages have
        # been yielded to the sink to avoid overfilling.
        current_batch_count = 0
        current_batch_bytes = 0
        while @draining.any? do
          @draining.each do |message|
            # Special case for messages larger than the max batch bytes.
            if message.bytesize > max_batch_bytes
              current_batch_count = 1
              current_batch_bytes = message.bytesize
              break
            end

            if current_batch_bytes + message.bytesize > max_batch_bytes
              # Batch is at capacity, time to flush.
              break
            else
              current_batch_count += 1
              current_batch_bytes += message.bytesize
            end
          end

          @draining_bytes -= current_batch_bytes
          yield(@draining.slice!(0, current_batch_count))
          current_batch_count = 0
          current_batch_bytes = 0
        end
      end
    end
  end
end
