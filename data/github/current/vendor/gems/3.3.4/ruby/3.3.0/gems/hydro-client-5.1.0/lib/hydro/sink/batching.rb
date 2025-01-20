module Hydro

  # Provides a basic batching implementation for a sink.
  module Batching
    # Public: start batching mode.
    #
    # When enabled, messages will be written to a buffer instead of published
    # directly to the destination system.
    def start_batch
      @batching = true
    end

    # Public: flush the current batch.
    #
    # Sets batching to false, and uses the sink `write` method to write the
    # entire batch at once.
    def flush_batch(options = {})
      @batching = false
      if batch.empty?
        return Hydro::Sink::Result.success
      end
      write(batch, options)
    ensure
      batch.clear
    end

    # Public: is the sink in batching mode?
    def batching?
      @batching ||= false
    end

    # Public: is there anything in the batch that can be flushed?
    def flushable?
      !batch.empty?
    end

    # Internal: the current batch, an Array of messages.
    def batch
      @batch ||= []
    end

    # Internal: add messages to the current batch.
    #
    # Used by sink implementations within `write` to add to a batch instead of
    # writing to the normal message destination when `batching?` is true.
    def add_to_batch(messages)
      batch.concat(messages)
      Hydro::Sink::Result.success
    end

    # Internal: does this sink support batching?
    def batchable?
      true
    end
  end
end
