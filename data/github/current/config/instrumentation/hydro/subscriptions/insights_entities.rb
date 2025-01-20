# frozen_string_literal: true
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("insights.entity_created") do |payload|
    payload[:message][:request_context] = serializer.request_context_for_insights_publishing(GitHub.context.to_hash)
    payload[:message][:data] = serializer.insights_data(payload[:message][:data])

    result = Hydro::PublishRetrier.publish(
      payload[:message],
      max_attempts: 50,
      retry_delay: 10.seconds,
      schema: "github.insights.v0.EntityCreated",
      publisher: GitHub.sync_hydro_publisher,
      partition_key: payload[:partition_key],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    raise(result.error) unless result.success?

    GitHub.logger.info(
      "gh.insights.tenant.id" => payload[:message][:insights_enterprise_entity_id],
      "gh.request_id" => payload[:message][:request_context][:request_id],
      "gh.insights.entity" => payload[:message][:entity],
      "gh.insights.entity.id" => payload[:message][:data]["id"],
      "messaging.destination.name" => "github.insights.v0.EntityCreated",
    )
  end

  subscribe("insights.entity_updated") do |payload|
    payload[:message][:request_context] = serializer.request_context_for_insights_publishing(GitHub.context.to_hash)
    payload[:message][:data] = serializer.insights_data(payload[:message][:data])

    result = Hydro::PublishRetrier.publish(
      payload[:message],
      max_attempts: 50,
      retry_delay: 10.seconds,
      schema: "github.insights.v0.EntityUpdated",
      publisher: GitHub.sync_hydro_publisher,
      partition_key: payload[:partition_key],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    raise(result.error) unless result.success?

    GitHub.logger.info(
      "gh.insights.tenant.id" => payload[:message][:insights_enterprise_entity_id],
      "gh.request_id" => payload[:message][:request_context][:request_id],
      "gh.insights.entity.name" => payload[:message][:entity],
      "gh.insights.entity.id" => payload[:message][:data]["id"],
      "messaging.destination.name" => "github.insights.v0.EntityUpdated",
    )
  end

  subscribe("insights.entity_destroyed") do |payload|
    payload[:message][:request_context] = serializer.request_context_for_insights_publishing(GitHub.context.to_hash)
    payload[:message][:data] = serializer.insights_data(payload[:message][:data])

    result = Hydro::PublishRetrier.publish(
      payload[:message],
      max_attempts: 50,
      retry_delay: 10.seconds,
      schema: "github.insights.v0.EntityDeleted",
      publisher: GitHub.sync_hydro_publisher,
      partition_key: payload[:partition_key],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    raise(result.error) unless result.success?

    GitHub.logger.info(
      "gh.insights.tenant.id" => payload[:message][:insights_enterprise_entity_id],
      "gh.request_id" => payload[:message][:request_context][:request_id],
      "gh.insights.entity.name" => payload[:message][:entity],
      "gh.insights.entity.id" => payload[:message][:data]["id"],
      "messaging.destination.name" => "github.insights.v0.EntityDeleted",
    )
  end
end
