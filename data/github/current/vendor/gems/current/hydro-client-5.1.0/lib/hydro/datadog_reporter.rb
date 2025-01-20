module Hydro
  class DatadogReporter
    def self.start(args)
      new(**args).start
    end

    # Reports Hydro metrics to Datadog.
    #
    # dogstatsd    - Required Datadog statsd reporter instance
    # default_tags - Optional Array<String> of tags to apply to all metrics
    # client_id    - Optional String unique client identifier for tagging metrics (deprecated, use default_tags)
    def initialize(dogstatsd:, default_tags: [], client_id: nil)
      @statsd = dogstatsd
      @default_tags = default_tags
      @default_tags.concat(["client_id:#{client_id}"]) if client_id
    end

    def add_default_tags(tags = [])
      @default_tags.concat(tags)
    end

    def start
      # Calls to publish
      subscribe(Hydro::Publisher::PUBLISH_EVENT) do |duration, payload|
        statsd.distribution("hydro_client.publish.latency", duration, tags: default_tags)
        statsd.increment("hydro_client.publish.calls", tags: default_tags)
      end

      # Messages written to the kafka sink
      subscribe("enqueue_message.async_producer.kafka") do |duration, payload|
        queue_size       = payload.fetch(:queue_size)
        max_queue_size   = payload.fetch(:max_queue_size)
        queue_fill_ratio = queue_size.to_f / max_queue_size.to_f

        statsd.gauge("hydro_client.kafka.producer.queue.size", queue_size, sample_rate: 0.25, tags: default_tags)
        statsd.gauge("hydro_client.kafka.producer.queue.fill_ratio", queue_fill_ratio, sample_rate: 0.25, tags: default_tags)
      end

      # Messages flushed to the kafka producer buffer
      subscribe("produce_message.producer.kafka") do |duration, payload|
        statsd.distribution("hydro_client.kafka.producer.message_size", payload.fetch(:message_size), tags: default_tags + ["topic:#{payload[:topic]}"])

        buffer_size       = payload.fetch(:buffer_size)
        max_buffer_size   = payload.fetch(:max_buffer_size)
        buffer_fill_ratio = buffer_size.to_f / max_buffer_size.to_f

        statsd.gauge("hydro_client.kafka.producer.buffer.size", buffer_size, sample_rate: 0.25, tags: default_tags)
        statsd.gauge("hydro_client.kafka.producer.buffer.fill_ratio", buffer_fill_ratio, sample_rate: 0.25, tags: default_tags)
      end

      # Messages passed to the kafka producer
      subscribe("deliver_messages.producer.kafka") do |duration, payload|
        statsd.distribution("hydro_client.kafka.producer.delivery.latency", duration, tags: default_tags)
        statsd.count("hydro_client.kafka.producer.messages", payload[:delivered_message_count], tags: default_tags)
        statsd.distribution("hydro_client.kafka.producer.delivery.attempts", payload[:attempts], tags: default_tags)

        if payload.key?(:exception)
          klass, _ = payload[:exception]
          statsd.increment("hydro_client.kafka.producer.delivery.errors", tags: to_tags(exception: klass))
        end
      end

      # Messages delivered to kafka
      subscribe("ack_message.producer.kafka") do |duration, payload|
        delay = (payload.fetch(:delay) * 1_000).round

        statsd.increment("hydro_client.kafka.producer.ack.messages", sample_rate: 0.25, tags: default_tags)
        statsd.distribution("hydro_client.kafka.producer.ack.delay", delay, tags: default_tags)
      end

      # Kafka message delivery errors
      subscribe("topic_error.producer.kafka") do |duration, payload|
        topic = payload[:topic]
        klass, _ = payload[:exception]
        statsd.increment("hydro_client.kafka.producer.error", tags: to_tags(exception: klass, topic: topic))
      end

      # Kafka message buffer exhaustion
      subscribe("buffer_overflow.async_producer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.producer.error", tags: to_tags(exception: "Kafka::BufferOverflow"))
      end

      # Kafka request size and latency
      subscribe("request.connection.kafka") do |duration, payload|
        tags = to_tags(payload.slice(:api, :broker_host))

        statsd.distribution("hydro_client.kafka.api.latency", duration, tags: tags)
        statsd.distribution("hydro_client.kafka.api.request_size", payload.fetch(:request_size, 0), tags: tags)
        statsd.distribution("hydro_client.kafka.api.response_size", payload.fetch(:response_size, 0), tags: tags)

        if payload.key?(:exception)
          klass, _ = payload[:exception]
          statsd.increment("hydro_client.kafka.api.errors", tags: tags + ["exception:#{klass}"])
        end
      end

      # Kafka request size and latency
      subscribe("drop_messages.async_producer.kafka") do |duration, payload|
        statsd.count("hydro_client.kafka.shutdown.dropped_messages", payload[:message_count])
      end

      # consumer-stats
      # Unbatched
      # Messages that the consumer consumed but not processed (Pre processing)
      subscribe("start_process_message.consumer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.consumer.incoming_messages", tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.incoming_offset", payload[:offset], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.incoming_offset_lag", payload[:offset_lag], tags: consumer_tags(payload))
      end

      # Messages that the consumer have finished processing (Post processing)
      subscribe("process_message.consumer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.consumer.processed_mesages", tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.offset", payload[:offset], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.offset_lag", payload[:offset_lag], tags: consumer_tags(payload))
      end

      # Batched
      # Messages that the consumer consumed but not processed (Pre processing)
      subscribe("start_process_batch.consumer.kafka") do |duration, payload|
        statsd.count("hydro_client.kafka.consumer.batch.incoming_messages", payload[:message_count], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.batch.incoming_offset", payload[:highwater_mark_offset], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.batch.incoming_offset_lag", payload[:offset_lag], tags: consumer_tags(payload))
      end

      # Messages that the consumer have finished processing (Post processing)
      subscribe("process_batch.consumer.kafka") do |duration, payload|
        statsd.count("hydro_client.kafka.consumer.batch.processed_mesages", payload[:message_count], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.batch.offset", payload[:highwater_mark_offset], tags: consumer_tags(payload))
        statsd.gauge("hydro_client.kafka.consumer.batch.offset_lag", payload[:offset_lag], tags: consumer_tags(payload))
      end

      # Non-message specfic stats
      # Whenever a consumer joins a group
      subscribe("join_group.consumer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.consumer.join_group", tags: to_tags(group_id: payload[:group_id]))
      end

      # Whenever the sync is done and the consumer has been assigned partition(s).
      subscribe("sync_group.consumer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.consumer.sync_group", tags: to_tags(group_id: payload[:group_id]))
      end

      # Whenever a consumer leaves the group.
      subscribe("leave_group.consumer.kafka") do |duration, payload|
        statsd.increment("hydro_client.kafka.consumer.leave_group", tags: to_tags(group_id: payload[:group_id]))
      end

      # When seeking to an offset of a partition.
      subscribe("seek.consumer.kafka") do |duration, payload|
        statsd.gauge("hydro_client.kafka.consumer.seek", payload[:offset], tags: consumer_tags(payload))
      end

      # When a heartbeat is done
      subscribe("heartbeat.consumer.kafka") do |duration, payload|
        group = payload[:group_id]
        payload[:topic_partitions].each do |topic, partitions|
          statsd.increment("hydro_client.kafka.consumer.heartbeat", tags: to_tags(group_id: group, topic: topic, partitions: partitions))
        end
      end

      # When a produce RPC completes. May consists of multiple requests and retries.
      subscribe(Hydro::GatewaySink::RPC_EVENT) do |duration, payload|
        rpc_tags = to_tags(rpc: payload[:rpc], success: !payload[:error])

        statsd.distribution("hydro_client.hydro_gateway.rpc.latency", duration, tags: rpc_tags)

        if payload[:error]
          error_tags = to_tags(error: (payload[:error].cause || payload[:error]).class.name)
          if payload[:error].is_a?(Hydro::Sink::Error)
            error_code = payload[:error].context.dig(:error, :code)
            error_tags += to_tags(error_code: error_code) if error_code
          end
          statsd.increment("hydro_client.hydro_gateway.rpc.error", tags: rpc_tags + error_tags)
        end

        if payload[:delivered_count].to_i > 0
          statsd.count("hydro_client.hydro_gateway.delivery", payload[:delivered_count].to_i)
        end

        if payload[:failures]
          payload[:failures].group_by { |failure| failure[:error_key] }.each do |error_key, failures|
            failures.group_by { |failure| failure[:message]&.topic }.each do |topic, messages|
              tags = to_tags(error: error_key, topic: topic)
              statsd.count("hydro_client.hydro_gateway.delivery_failure", failures.count, tags: tags)
            end
          end
        end
      end

      # When a single produce request completes.
      subscribe(Hydro::GatewaySink::REQUEST_EVENT) do |duration, payload|
        status = payload[:timeout] ? "timeout" : payload[:status]
        statsd.increment("hydro_client.hydro_gateway.request", tags: to_tags(status: status))
      end

      # When the sink retries a failed produce request.
      subscribe(Hydro::GatewaySink::RETRY_EVENT) do |duration, payload|
        error = payload[:error]

        if error.cause
          error = error.cause
        end

        if error.respond_to?(:original_exception) && error.original_exception
          error = error.original_exception
        end

        statsd.increment("hydro_client.hydro_gateway.retry", tags: to_tags(error: error.class))
      end

      # When the sink fails to deliver some messages.
      subscribe(Hydro::GatewaySink::DELIVERY_FAILURE_EVENT) do |duration, payload|
        payload[:failures].each do |failure|
          statsd.increment("hydro_client.hydro_gateway.delivery_failure", tags: to_tags({
            error: failure[:error_key],
            retriable: failure[:retriable].to_s
          }))
        end
      end

      # When the AsyncSink buffer size changes due to producing or flushing.
      subscribe(Hydro::AsyncSink::BUFFER_EVENT) do |duration, payload|
        statsd.gauge("hydro_client.async_sink.buffer_size", payload[:size])
        statsd.gauge("hydro_client.async_sink.buffer_max_size", payload[:max_size])
        statsd.gauge("hydro_client.async_sink.buffer_bytes", payload[:bytesize])
        statsd.gauge("hydro_client.async_sink.buffer_max_bytes", payload[:max_bytesize])
      end

      # When an AsyncSink flushes.
      subscribe(Hydro::AsyncSink::FLUSH_EVENT) do |duration, payload|
        statsd.increment("hydro_client.async_sink.flush")
        statsd.count("hydro_client.async_sink.messages_flushed", payload[:flushed_count])
      end

      # When an AsyncSink flush fails because the underlying sink returned an error.
      subscribe(Hydro::AsyncSink::FLUSH_ERROR_EVENT) do |duration, payload|
        statsd.increment("hydro_client.async_sink.flush_error", tags: to_tags(error: payload[:error].class))
      end
    end

    private

    attr_reader :default_tags

    def statsd
      @statsd.is_a?(Proc) ? @statsd.call : @statsd
    end

    def subscribe(event, &block)
      Hydro.instrumenter.subscribe(event) do |name, start, ending, transaction_id, payload|
        duration_ms = ((ending - start) * 1_000).round
        block.call(duration_ms, payload)
      end
    end

    def consumer_tags(payload)
      to_tags(group_id: payload[:group_id],
        topic: payload[:topic], partition: payload[:partition])
    end

    def to_tags(hash)
      hash.map { |k, v| "#{k}:#{v}" }.concat(default_tags)
    end
  end
end
