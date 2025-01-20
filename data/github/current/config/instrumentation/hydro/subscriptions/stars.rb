# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(/user\.(star|unstar)/) do |payload, event|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      star_id: payload[:star].id,
      action_type: event.split(".").last.upcase,
      context_type: (Star::STARRABLE_CONTEXTS.include?(payload[:context]) ? payload[:context] : "other").upcase,
    }

    case payload[:entity]
    when Gist
      publish(message.merge({
        gist: serializer.gist(payload[:entity]),
        gist_owner: serializer.user(payload[:owner]),
        gist_stars_count: payload[:stars_count],
      }), schema: "github.v1.GistStar", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    when Repository
      publish(message.merge({
        repository: serializer.repository(payload[:entity]),
        repository_owner: serializer.user(payload[:owner]),
        repository_stars_count: payload[:stars_count],
        starred_at: payload[:star].created_at,
      }), schema: "github.v1.RepositoryStar", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    when Topic
      publish(message.merge({
        topic: serializer.topic(payload[:entity]),
        topic_stars_count: payload[:stars_count],
        starred_at: payload[:star].created_at,
      }), schema: "github.v1.TopicStar", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end
end
