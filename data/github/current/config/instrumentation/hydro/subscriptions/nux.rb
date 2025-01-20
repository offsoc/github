# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("repository_transfer.immediate") do |payload|
    repository = payload[:repository]
    requester = payload[:requester]
    target = payload[:target]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(repository),
      requester: serializer.user(requester),
      target: serializer.user(target),
      criteria: :IMMEDIATE,
      previous_owner: serializer.user(payload[:previous_owner])
    }

    publish(message, schema: "github.v1.RepositoryTransfer", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_transfer.completed") do |payload|
    repository = payload[:repository]
    requester = payload[:requester]
    target = payload[:target]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(repository),
      requester: serializer.user(requester),
      target: serializer.user(target),
      criteria: :COMPLETED,
      previous_owner: serializer.user(payload[:previous_owner])
    }

    publish(message, schema: "github.v1.RepositoryTransfer", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, partition_key: repository.id) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_transfer.request_start") do |payload|
    repository_transfer = payload[:repository_transfer]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(repository_transfer.repository),
      requester: serializer.user(repository_transfer.requester),
      responder: serializer.user(repository_transfer.responder),
      target: serializer.user(repository_transfer.target),
      state: repository_transfer.state,
      criteria: :REQUEST,
      repository_transfer_id: repository_transfer.id,
      previous_owner: serializer.user(payload[:previous_owner])
    }

    publish(message, schema: "github.v1.RepositoryTransfer", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_transfer.request_finish") do |payload|
    repository_transfer = payload[:repository_transfer]

    if repository_transfer.responded?
      message = {
        request_context: serializer.request_context(GitHub.context.to_hash),
        repository: serializer.repository(repository_transfer.repository),
        requester: serializer.user(repository_transfer.requester),
        responder: serializer.user(repository_transfer.responder),
        target: serializer.user(repository_transfer.target),
        state: repository_transfer.state,
        criteria: :REQUEST,
        repository_transfer_id: repository_transfer.id,
        previous_owner: serializer.user(payload[:previous_owner])
      }

      publish(message, schema: "github.v1.RepositoryTransfer", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("release.commits_fetched") do |payload|
    message = {
      since: payload[:since],
      commits_fetched: payload[:commits_fetched],
      total_commits: payload[:total_commits],
      repository: serializer.repository(payload[:repository]),
      release: serializer.release(payload[:release]),
      previous_release: serializer.release(payload[:previous_release]),
    }

    publish(message, schema: "github.releases.v1.CommitsFetched", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end


  subscribe("release.previous_release_fetched") do |payload|
    message = {
      release: serializer.release(payload[:release]),
      previous_release: serializer.release(payload[:previous_release]),
      tags_fetched_limit_reached: payload[:tags_fetched_limit_reached],
      repository: serializer.repository(payload[:repository]),
      time_elapsed: payload[:time_elapsed],
    }

    publish(message, schema: "github.releases.v1.PreviousReleaseFetched", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("release.fanout_targets_collected") do |payload|
    message = {
      release: serializer.release(payload[:release]),
      repository: serializer.repository(payload[:repository]),
      author: serializer.user(payload[:author]),
      total_targets: payload[:total_targets],
      total_commit_author_followers: payload[:total_commit_author_followers],
      total_release_author_followers: payload[:total_release_author_followers],
      total_stargazers: payload[:total_stargazers],
      time_elapsed: payload[:time_elapsed],
    }

    publish(message, schema: "github.releases.v1.FanoutTargetsCollected", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
