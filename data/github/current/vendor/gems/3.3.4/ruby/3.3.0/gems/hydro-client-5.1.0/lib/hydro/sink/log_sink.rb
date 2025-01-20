require "logger"

module Hydro
  class LogSink
    module Formatters
      String = ->(message) { message.inspect }

      ProtobufAsJSON = ->(message) {
        {
          timestamp: message.timestamp,
          topic: message.topic,
          data: Hydro::Decoding::ProtobufDecoder.decode(message.data).to_h,
        }.to_json
      }
    end

    def self.protobuf_as_json(logger = Logger.new(STDOUT))
      new(logger, formatter: Formatters::ProtobufAsJSON)
    end

    def initialize(logger = Logger.new(STDOUT), formatter: Formatters::String)
      @logger = logger
      @formatter = formatter
    end

    def batchable?
      false
    end

    def write(messages, options = {})
      messages.each { |message| logger << formatter.call(message) + "\n" }
      Hydro::Sink::Result.success
    end

    def close
      # no op
    end

    private

    attr_reader :logger, :formatter
  end
end
