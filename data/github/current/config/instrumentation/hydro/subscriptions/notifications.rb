# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.notifications.unwatch_suggestion_event.unwatched_all") do |payload|
    user = payload[:client][:user]

    next unless user.present?

    message = {
      event: :UNWATCHED_ALL,
      user: serializer.user(user),
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version].to_s
    }

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.unwatch_suggestion_event.shown_list") do |payload|
    user = serializer.user(payload[:client][:user])
    message = {
      event: :SHOWN_LIST,
      user: user,
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version]
    }

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.unwatch_suggestion_event.unwatch_repository") do |payload|
    repo = Repository.find_by(id: payload[:repository_id])
    next unless repo.present?

    user = serializer.user(payload[:client][:user])
    repository = serializer.repository(repo)

    message = {
      event: :UNWATCHED_REPO,
      user: user,
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version].to_s,
      repository: repository,
    }

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.unwatch_suggestion_event.shown_alert") do |payload|
    user = serializer.user(payload[:client][:user])
    message = {
      event: :SHOWN_ALERT,
      user: user,
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version].to_s
    }

    repo = Repository.find_by(id: payload[:repository_id])
    message[:repository] = serializer.repository(repo) if repo.present?

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.unwatch_suggestion_event.dismissed_alert") do |payload|
    user = serializer.user(payload[:client][:user])
    message = {
      event: :DISMISSED_ALERT,
      user: user,
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version].to_s
    }

    repo = Repository.find_by(id: payload[:repository_id])
    message[:repository] = serializer.repository(repo) if repo.present?

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.unwatch_suggestion_event.dismissed_list") do |payload|
    user = serializer.user(payload[:client][:user])
    message = {
      event: :DISMISSED_LIST,
      user: user,
      snapshot_date: payload[:snapshot_date],
      algorithm_version: payload[:algorithm_version].to_s
    }

    publish(message, schema: "github.notifications.v0.UnwatchSuggestionEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
