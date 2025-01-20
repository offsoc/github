module Hydro
  class FileSource
    # Build a Hydro::Source that reads from a file containing serialized
    # Hydro::Messages.
    #
    # filename     - the String or Pathname name of the target file.
    # subscribe_to - the optional String or Regex message topic name.
    # interval     - the Integer polling interval.
    def initialize(filename:, group_id: nil, subscribe_to: /.*/, interval: 1, **options)
      @filename = filename
      @subscribe_to = subscribe_to
      @interval = interval
    end

    def open
      @file = File.open(@filename, "r")
    end

    def each_batch
      @running = true

      raise "Need to call #open!" unless @file

      loop do
        while line = file.gets
          break unless @running

          message = Hydro::Message.deserialize(line.strip)

          next unless message.topic =~ subscribe_to

          yield [
            Source::Message.new(
              key: message.key,
              value: message.data,
              topic: message.topic,
              partition: message.partition,
              offset: file.lineno,
              headers: message.headers,
            )
          ]
        end

        break unless @running
        sleep interval
      end

      file.close
    end

    def each_message(&block)
      each_batch do |batch|
        batch.each(&block)
      end
    end

    def close
      @running = false
    end

    def mark_message_as_processed(message)
      # Doesn't support persisting offsets
    end

    def commit_offsets
      # Doesn't support persisting offsets
    end

    def trigger_heartbeat
      # Doesn't support a heartbeat
    end

    private

    def subscribe_to
      @subscribe_to.is_a?(Regexp) ? @subscribe_to : Regexp.new(@subscribe_to)
    end

    attr_reader :file, :interval
  end
end
