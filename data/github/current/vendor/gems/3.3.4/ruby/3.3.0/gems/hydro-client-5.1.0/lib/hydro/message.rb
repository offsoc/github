require "base64"

module Hydro
  class Message
    attr_accessor :key, :data, :schema, :topic, :partition, :partition_key, :timestamp, :headers, :compress

    # Public: Deserialize a serialized message.
    #
    # serialized - a String representing a serialized message.
    #
    # Returns a Hydro::Message.
    def self.deserialize(serialized)
      Marshal.load(Base64.strict_decode64(serialized))
    end

    def initialize(key: nil, data: nil, schema: nil, topic: nil, partition: nil, partition_key: nil, timestamp: nil, headers: {}, compress: false)
      @data = data
      @key = key
      @schema = schema
      @topic = topic
      @partition = partition
      @partition_key = partition_key
      @timestamp = timestamp
      @headers = headers
      @compress = compress
    end

    def ==(other)
      return false if other.nil?

      @data == other.data &&
      @key == other.key &&
      @schema == other.schema &&
      @topic == other.topic &&
      @partition == other.partition &&
      @partition_key == other.partition_key &&
      @timestamp == other.timestamp &&
      @headers == other.headers &&
      @compress == other.compress
    end

    def to_h
      {
        key: @key,
        data: @data,
        schema: @schema,
        topic: @topic,
        partition: @partition,
        partition_key: @partition_key,
        timestamp: @timestamp,
        headers: @headers,
        compress: @compress,
      }
    end

    def to_json
      to_h.to_json
    end

    # Public: Serialize a message as a String suitable for writing to a
    # whitespace delimited IO e.g. a file or pipe.
    #
    # Returns a String.
    def serialize
      Base64.strict_encode64(Marshal.dump(self))
    end

    # Returns the bytesize of the message payload.
    def bytesize
      @bytesize ||= (key ? key.to_s.bytesize : 0) +
        (data ? data.to_s.bytesize : 0) +
        (headers ? (headers.keys + headers.values).map(&:to_s).map(&:bytesize).reduce(:+).to_i : 0)
    end
  end
end
