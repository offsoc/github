# typed: true
# frozen_string_literal: true

GitHub.subscribe "hydro.kafka_source.batch_processed" do |_name, _start, _finish, _id, payload|
  Hydro.consumer_logger.info(
    "hydro.kafka_source.batch_processed",
    "messaging.consumer.id" => payload[:client_id],
    "messaging.consumer.group_id" => payload[:group_id],
    "messaging.consumer.max_bytes_per_partition" => payload[:max_bytes_per_partition],
    "messaging.consumer.start_from_beginning" => payload[:start_from_beginning])
end

GitHub.subscribe "hydro.kafka_source.message_processed" do |_name, _start, _finish, _id, payload|
  Hydro.consumer_logger.debug(
    "hydro.kafka_source.message_processed",
    "messaging.consumer.id" => payload[:client_id],
    "messaging.consumer.group_id" => payload[:group_id],
    "messaging.consumer.max_bytes_per_partition" => payload[:max_bytes_per_partition],
    "messaging.consumer.start_from_beginning" => payload[:start_from_beginning])
end

GitHub.subscribe "hydro.kafka_source.consumer_initialized" do |_name, _start, _finish, _id, payload|
  Hydro.consumer_logger.info(
    "hydro.kafka_source.consumer_initialized",
    "messaging.consumer.id" => payload[:client_id],
    "messaging.consumer.group_id" => payload[:group_id],
    "messaging.consumer.options" => payload[:consumer_options])
end

GitHub.subscribe "hydro.kafka_source.consumer_subscribed" do |_name, _start, _finish, _id, payload|
  Hydro.consumer_logger.info(
    "hydro.kafka_source.consumer_subscribed",
    "messaging.consumer.id" => payload[:client_id],
    "messaging.consumer.group_id" => payload[:group_id],
    "messaging.consumer.max_bytes_per_partition" => payload[:max_bytes_per_partition],
    "messaging.consumer.start_from_beginning" => payload[:start_from_beginning],
    "messaging.destination.name" => payload[:topic])
end

GitHub.subscribe "hydro.kafka_sink.close.message_flush_retry" do |_name, _start, _finish, _id, payload|
  Hydro.publisher_logger.error(
    "hydro.kafka_sink.close.message_flush_retry",
    exception: payload[:exception],
    "hydro.kafka_sink.close.message_flush_retry": payload[:retry])
end

GitHub.subscribe "hydro.kafka_sink.close.message_flush_failure" do |_name, _start, _finish, _id, payload|
  Hydro.publisher_logger.error(
    "hydro.kafka_sink.close.message_flush_failure",
    exception: payload[:exception])
end
