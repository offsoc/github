module Hydro
  class MemorySource
    DEFAULTS = {
      automatically_mark_as_processed: true
    }

    # Exposes messages from a Hydro::MemorySink as a Hydro::Source.
    #
    # sink       - a Hydro::MemorySink.
    # batch_size - the Integer number of messages to yield per batch
    def initialize(sink:, group_id: nil, subscribe_to: /.*/, batch_size: 100, **options)
      @sink = sink
      @batch_size = batch_size
      @subscribe_to = subscribe_to
      @uncommitted_offsets = build_offsets_store
      @committed_offsets = build_offsets_store
      @opened = @closed = false
      @options = DEFAULTS.merge(options)
    end

    # Public: Yields successive batches of Array<Hydro::Source::Messages>.
    #
    # block - a Proc to process each batch
    def each_batch(&block)
      @assigned_offsets = build_offsets_store(default: 0)
      @sink.messages
        .map { |message| wrap_message(message) }
        .select { |message| subscribe_to.any? { |r| r.match?(message.topic) } }
        .reject { |message| already_processed?(message) }
        .each_slice(@batch_size)
        .reject(&:empty?)
        .each(&block)
        .each { |batch| mark_message_as_processed(batch.last) if automatically_mark_as_processed? }
        .each { commit_offsets }
    rescue => e
      commit_offsets
      raise e
    end

    # Public: Yields individual Hydro::Source::Messages.
    #
    # block - a Proc to process each message
    def each_message(&block)
      each_batch do |batch|
        batch.each do |message|
          yield message
          mark_message_as_processed(message) if automatically_mark_as_processed?
        end
      end
    end

    # Public: Mark a message as processed. When offsets are committed, the
    # message's offset will be stored so that we can resume where we left off
    # if processing restarts.
    #
    # message - a Source::Message
    #
    # Returns nothing.
    def mark_message_as_processed(message)
      @uncommitted_offsets[message.topic][message.partition] = message.offset
    end

    # Public: Commit the uncommitted offsets.
    #
    # Returns nothing.
    def commit_offsets
      @uncommitted_offsets.each do |topic, partitions|
        partitions.each do |partition, offset|
          @committed_offsets[topic][partition] = offset
        end
      end
      @uncommitted_offsets.clear
    end

    # Public: Perform cleanup (no-op)
    def close
      @closed = true
    end

    def closed?
      !!@closed
    end

    # Public: Initialize the source (no-op)
    def open
      @opened = true
    end

    def opened?
      !!@opened
    end

    def trigger_heartbeat
      # Doesn't support a heartbeat
    end

    def subscribe_to
      Array(@subscribe_to)
    end

    def committed_offsets
      @committed_offsets
    end

    private

    def automatically_mark_as_processed?
      @options[:automatically_mark_as_processed]
    end

    def already_processed?(message)
      processed_offset = @committed_offsets[message.topic][message.partition]
      processed_offset && processed_offset >= message.offset
    end

    def wrap_message(message)
      Source::Message.new(**{
        value: message.data,
        topic: message.topic,
        partition: message.partition,
        key: message.key,
        offset: next_offset_for(message),
        headers: message.headers,
      })
    end

    def next_offset_for(message)
      next_offset = @assigned_offsets[message.topic][message.partition]
      @assigned_offsets[message.topic][message.partition] += 1
      next_offset
    end

    # Private: Build a <Topic, <Partition, Offset>> map.
    def build_offsets_store(default: nil)
      Hash.new { |topic, partition| topic[partition] = Hash.new(default) }
    end
  end
end
