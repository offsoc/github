# A container for raw messages read from a hydro source.
module Hydro
  module Source
    class Message
      attr_accessor :value, :schema, :topic, :partition, :key, :offset, :headers

      def initialize(key: nil, value: nil, topic: nil, partition: nil, offset: nil, headers: {})
        @key = key
        @value = value
        @topic = topic
        @partition = partition
        @offset = offset
        @headers = headers
      end

      def ==(other)
        return false unless other.is_a?(self.class)

        fields == other.fields
      end

      def hash
        fields.hash
      end

      def to_h
        fields
      end

      protected

      def fields
        {
          value: value,
          topic: topic,
          partition: partition,
          key: key,
          offset: offset,
          headers: headers,
        }
      end
    end
  end
end
