module Hydro
  class LogStreamer

    def self.start
      Hydro.instrumenter.subscribe(/hydro.kafka_source*/) do |name, _start, _finish, _id, payload|
        Hydro.consumer_logger.info(payload.merge(event_name: name))
      end

      Hydro.instrumenter.subscribe("hydro.kafka_sink.close.message_flush_retry") do |name, _start, _finish, _id, payload|
        Hydro.publisher_logger.error(payload.merge(event_name: name))
      end

      Hydro.instrumenter.subscribe("hydro.kafka_sink.close.message_flush_failure") do |name, _start, _finish, _id, payload|
        Hydro.publisher_logger.error(payload.merge(event_name: name))
      end
    end
  end
end
