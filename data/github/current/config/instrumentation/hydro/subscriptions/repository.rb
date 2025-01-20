# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  subscribe("repository.create") do |payload|
    repository = payload[:repository]

    serialized_actor = serializer.user(payload[:actor])
    gh_request_context = GitHub.context
    serialized_request_context = serializer.request_context(gh_request_context)
    serialized_repository = serializer.repository(payload[:repository])
    if payload[:parent].present?
      serialized_repository = serializer.repository(payload[:repository], overrides: { parent_owner_id: payload[:parent].owner_id })
    end

    message = {
      actor: serialized_actor,
      request_context: serialized_request_context,
      repository: serialized_repository,
      gitignore_template: payload[:gitignore_template],
      license_template: payload[:license_template],
      init_with_readme: payload[:init_with_readme],
      owner: serializer.user(payload[:owner]),
    }

    publish(message, schema: "github.v1.RepositoryCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: nil,
      action_type: :CREATE,
      content_type: :REPOSITORY_DESCRIPTION,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.RepositoryCreate"),
      content_database_id: serialized_repository[:id],
      content_global_relay_id: serialized_repository[:global_relay_id],
      content_created_at: serialized_repository[:created_at],
      content_updated_at: serialized_repository[:updated_at],
      title: serializer.specimen_data(repository.name),
      content: serializer.specimen_data(repository.description),
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serializer.repository_owner(repository),
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.visibility_changed") do |payload|
    message = {
      name_with_owner: payload[:name_with_owner],
      repository_id: payload[:repository_id],
      is_private: payload[:is_private],
      is_fork: payload[:is_fork],
      visibility: payload[:visibility],
      feature_flags: payload[:feature_flags],
    }
    publish(message, schema: "github.v1.RepositoryVisibilityChanged", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.archived_status_changed") do |payload|
    message = {
      repository_id: payload[:repository_id],
      repository_global_id: payload[:repository_global_id],
      is_archived: payload[:is_archived],
    }
    publish(message, schema: "github.v1.RepositoryArchivedStatusChanged", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.rename") do |payload|
    gh_request_context = GitHub.context

    message = {
      request_context: serializer.request_context(gh_request_context),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      previous_name: payload[:previous_name],
      current_name: payload[:current_name],
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.v1.RepositoryRename", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.aleph_reindex") do |payload|
    gh_request_context = GitHub.context

    message = {
      actor: serializer.user(payload[:actor]),
      owner: serializer.user(payload[:owner]),
      request_context: serializer.request_context(gh_request_context),
      repository: serializer.repository(payload[:repository]),
      after: payload[:after],
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8),
      feature_flags: payload[:feature_flags],
    }

    publish(message,
      topic: "github.v0.AlephdIndexRepository",
      schema: "github.v1.RepositoryPush",
      partition_key: message[:repository][:id], topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("repository.post_receive_commits") do |payload|
    commits = payload[:commits]
    serialized_users = Hash.new { |hash, user| hash[user] = serializer.user(user) }

    messages = begin
      commits.map do |commit|
        {
          authored_at: commit.authored_date,
          committed_at: commit.committed_date,
          oid: commit.oid,
          author: {
            email: commit.author_email,
            name: commit.author_name,
            user: serialized_users[commit.author],
          },
          repository: serializer.repository(commit.repository),
          repository_owner: serializer.repository_owner(commit.repository.owner),
          diff_stats: serializer.commit_diff_stats(commit.diff_stats),
        }
      end
    rescue GitRPC::InvalidRepository
      # The repo disappeared (was deleted) immediately after being pushed to,
      # or created. Don't report partial data for the push.
      []
    end

    messages.each do |message|
      publish(
        message,
        schema: "github.v1.PostReceiveCommit",
        partition_key: message.fetch(:repository).fetch(:id), topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
      )
    end
  end

  subscribe("repository.deleted") do |payload|
    deleted_repository = payload[:deleted_repository]
    deleted_repo_next_global_id = deleted_repository&.global_relay_id
    unless GitHub.enterprise?
      begin
        deleted_repo_next_global_id = deleted_repository&.next_global_id
      rescue ArgumentError
        deleted_repo_next_global_id = ""
      end
    end

    message = {
      actor: serializer.user(payload[:actor]),
      deleted_repository: serializer.repository(deleted_repository, overrides: { next_global_id: deleted_repo_next_global_id }),
    }

    publish(message, schema: "github.v1.RepositoryDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.restored") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      restored_repository: serializer.repository(payload[:restored_repository]),
    }

    publish(message, schema: "github.v1.RepositoryRestored", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.invite") do |payload|
    gh_request_context = GitHub.context

    message = {
      actor: serializer.user(payload[:actor]),
      invitee: serializer.user(payload[:invitee]),
      request_context: serializer.request_context(gh_request_context),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryInvite", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.push_vulnerability_notification") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryPushVulnerabilityNotification", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.commit_status") do |payload|
    status = payload[:status]

    message = {
      database_id: status.id,
      context: status.context,
      commit_sha: status.sha,
      state: status.state.upcase,
      repository_id: status.repository_id,
      branch_names: status.branches.map { |name| name.dup.force_encoding("UTF-8") },
    }

    publish(message, schema: "github.v1.RepositoryCommitStatusCreated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.repository_empty_state.click") do |payload|
    gh_request_context = GitHub.context

    message = {
      request_context: serializer.request_context(gh_request_context),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:event_target],
      repository_context: payload[:repository_context],
    }

    publish(message, schema: "github.v1.RepositoryEmptyStateClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.repository_toc_menu.click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])

    gh_request_context = GitHub.context

    message = {
      request_context: serializer.request_context(gh_request_context),
      actor: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      target: payload[:target],
    }

    publish(message, schema: "github.v1.RepositoryTocMenuClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.missing_branch_redirect") do |payload|
    repo = payload[:repository]

    gh_request_context = GitHub.context

    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(gh_request_context),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      missing_branch_was_master: payload[:missing_branch_was_master],
    }

    publish(message.freeze, schema: "github.repositories.v1.MissingBranchRedirect",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.rename_branch") do |payload|
    repo = payload[:repository]

    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      old_branch: serializer.force_utf8(payload[:old_branch]),
      new_branch: serializer.force_utf8(payload[:new_branch]),
      default_branch: payload[:default_branch],
    }.freeze

    publish(message, schema: "github.repositories.v1.RenameBranch",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.issue_template_update") do |payload|
    repo = payload[:repository]

    gh_request_context = GitHub.context

    message = {
      actor: serializer.user(payload[:actor]),
      owner: serializer.user(repo.owner),
      repository: serializer.repository(repo),
      filename: payload[:filename],
      sha: payload[:sha],
      messages: payload[:messages],
      request_context: serializer.request_context(gh_request_context),
    }.freeze

    publish(message, schema: "github.issue_templates.v0.TemplateUpdateError",
            publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.internal_clone_complete") do |payload|
    source_repository = payload[:source_repository]
    destination_repository = payload[:destination_repository]

    message = {
      source_repository: serializer.repository(source_repository),
      destination_repository: serializer.repository(destination_repository)
    }.freeze

    publish(message, schema: "github.repositories.v1.InternalCloneComplete",
            publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.bulk.invite") do |payload|
    message = {
     actor: serializer.user(payload[:actor]),
     repository: serializer.repository(payload[:repository]),
     successful_user_invites: payload[:successful_user_invites],
     successful_email_invites: payload[:successful_email_invites],
     failed_user_invites: payload[:failed_user_invites],
     failed_email_invites: payload[:failed_email_invites],
     organization: serializer.organization(payload[:organization]),
   }

    publish(message, schema: "github.v1.RepositoryBulkInvite")
  end

  subscribe("repository.import_completed") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      final_status: serializer.enum_from_string(payload[:completed_status]),
    }

    publish(message, schema: "github.repositories.v2.Imported")
  end

  subscribe("repository.transfer_email") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      email_reason: serializer.enum_from_string(payload[:email_reason]),
      user: serializer.user(payload[:user]),
      target_id: payload[:target_id],
    }

    publish(message, schema: "github.repositories.v1.TransferEmail")
  end

  subscribe("repo.add_member") do |payload|
    repository = payload[:repo]
    message = {
      actor: serializer.user(payload[:actor]),
      member: serializer.user(payload[:user]),
      repository: {
          id: repository.id,
          name: repository.name,
          visibility: repository.visibility,
          parent_id: repository.parent_id,
          stargazer_count: [repository.stargazer_count, 0].max,
          organization_id: repository.organization_id,
          owner_id: repository.owner_id,
      },
      repository_owner_customer_id: Licensing::Customer.id_for(repository),
      is_repository_advisory_workspace: repository.advisory_workspace?,
    }

    publish(message, schema: "github.v1.RepositoryAddMember")
  end

  subscribe("repository.details_updated") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      description: payload[:description],
      homepage: payload[:homepage],
    }

    publish(message, schema: "github.repositories.v1.RepositoryDetailsUpdated")
  end
end
