# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Pull Requests.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("pull_request.create") do |payload|
    pull = payload[:pull_request]

    next unless pull.present?

    actor = pull.user
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(actor)
    serialized_repository = serializer.repository(pull.repository)
    serialized_repository_owner = serializer.user(pull.repository.owner)
    serialized_issue = serializer.issue(pull.issue)
    serialized_issue_creator = serializer.user(payload[:issue_creator])
    serialized_changed_files = pull.changed_files_for_instrumentation.map { |file| serializer.changed_file(file, overrides: { change_type: file.change_type_symbol }) }
    serialized_pull_request = serializer.pull_request(pull, overrides: { changed_files: serialized_changed_files })
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_title = serializer.specimen_data(pull.title)
    serialized_specimen_body = serializer.specimen_data(pull.body)
    serialized_head_repository = serializer.repository(pull.head_repository)

    hydro_payload = {
      pull_request: serialized_pull_request,
      issue: serialized_issue,
      actor: serialized_actor,
      actor_profile_location: actor&.profile_location,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      title: pull.title,
      body: pull.body,
      head_repository: serialized_head_repository,
      feature_flags: pull.head_repository.pull_request_create_feature_flags,
      blob_languages: pull.all_languages_in_diff,
    }

    publish(hydro_payload, partition_key: hydro_payload[:repository][:id], schema: "github.v1.PullRequestCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :PULL_REQUEST,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.PullRequestCreate"),
      content_database_id: serialized_pull_request[:id],
      content_global_relay_id: serialized_pull_request[:global_relay_id],
      content_created_at: serialized_pull_request[:created_at],
      content_updated_at: serialized_pull_request[:updated_at],
      title: serialized_specimen_title,
      content: serialized_specimen_body,
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_scan(pull, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  # Technically PullRequest updates are also Issue updates when the title or body is changed.
  # Here we subscribe to issue.update which gets published by Issue#instrument_hydro_update_event
  # which is called in each API we expose to end users including the v3 API, the GraphQL API,
  # and the IssuesController which is used by the PullRequest edit form on the website.
  subscribe("issue.update") do |payload|
    pull = payload[:issue].pull_request

    next unless pull.present?

    actor = pull.user
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(pull.repository)
    serialized_repository_owner = serializer.user(pull.repository.owner)
    serialized_pull_request = serializer.pull_request(pull)
    serialized_issue = serializer.issue(pull.issue)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_title = serializer.specimen_data(pull.title)
    serialized_specimen_body = serializer.specimen_data(pull.body)

    hydro_payload = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      pull_request: serialized_pull_request,
      issue: serialized_issue,
      previous_title: payload[:previous_title],
      current_title: payload[:current_title],
      previous_body: payload[:previous_body],
      current_body: payload[:current_body],
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(pull.repository).pull_request_scanning_service_flags,
    }

    publish(hydro_payload, schema: "github.v1.PullRequestUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :PULL_REQUEST,
      actor: serialized_actor,
      original_type_url: nil, # there is no original_type_url for PullRequest update right now
      content_database_id: serialized_pull_request[:id],
      content_global_relay_id: serialized_pull_request[:global_relay_id],
      content_created_at: serialized_pull_request[:created_at],
      content_updated_at: serialized_pull_request[:updated_at],
      title: serialized_specimen_title,
      content: serialized_specimen_body,
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_scan(pull, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("issue_comment.create") do |payload|
    pull = payload[:issue].pull_request

    next unless pull.present?

    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(pull.repository)
    serialized_repository_owner = serializer.user(pull.repository.owner)
    serialized_pull_request = serializer.pull_request(pull)
    serialized_issue = serializer.issue(payload[:issue])
    serialized_issue_comment = serializer.issue_comment(payload[:issue_comment])

    hydro_payload = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_comment: serialized_issue_comment,
      body: payload[:issue_comment].body,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(pull.repository).pull_request_scanning_service_flags,
    }

    publish(hydro_payload, schema: "github.v1.PullRequestTimelineCommentCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    publish_secret_scanning_pr_comment_scan(payload[:issue_comment], serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("issue_comment.update") do |payload|
    pull = payload[:issue].pull_request

    next unless pull.present?

    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(pull.repository)
    serialized_repository_owner = serializer.user(pull.repository.owner)
    serialized_pull_request = serializer.pull_request(pull)
    serialized_issue = serializer.issue(payload[:issue])
    serialized_issue_comment = serializer.issue_comment(payload[:issue_comment])

    hydro_payload = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_comment: serialized_issue_comment,
      previous_body: serializer.force_utf8(payload[:previous_body]),
      current_body: serializer.force_utf8(payload[:issue_comment].body),
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(pull.repository).pull_request_scanning_service_flags,
    }

    publish(hydro_payload, schema: "github.v1.PullRequestTimelineCommentUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    publish_secret_scanning_pr_comment_scan(payload[:issue_comment], serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe(/browser.rerequest_review\.(sidebar|mergebox)/) do |payload|
    actor = User.find_by(id: payload[:actor_id])
    subject = User.find_by(id: payload[:subject_id])
    pull = PullRequest.find_by(id: payload[:pull_request_id])

    next unless pull.present?

    message = {
      pull_request: serializer.pull_request(pull),
      actor: serializer.user(actor),
      subject_user: serializer.user(subject),
      repository: serializer.repository(pull.repository),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      action: serializer.enum_from_string(payload[:action]),
      as_code_owner: false,
    }

    publish(message, schema: "github.v1.PullRequestReviewRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/pull_request_review_request\.(create|remove)/) do |payload|
    actor = payload[:actor]
    subject_user = payload[:subject_type] == "User" ? serializer.user(payload[:subject_user]) : nil
    subject_team = payload[:subject_type] == "Team" ? serializer.team(payload[:subject_user]) : nil
    pull = payload[:pull_request]
    as_code_owner = payload[:as_code_owner]

    next unless pull.present?

    message = {
      pull_request: serializer.pull_request(pull),
      actor: serializer.user(actor),
      subject_user: subject_user,
      subject_team: subject_team,
      repository: serializer.repository(pull.repository),
      request_context: serializer.request_context(GitHub.context.to_hash),
      action: serializer.enum_from_string(payload[:action]),
      as_code_owner: as_code_owner,
    }

    publish(message, schema: "github.v1.PullRequestReviewRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.close") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]

    next unless pull.present?

    hydro_payload = {
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
    }

    if actor.present?
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestClose", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.merge") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]
    author = payload[:author]

    next unless pull.present?

    author_has_write_access = pull.author_association.member? ||
                              pull.author_association.collaborator? ||
                              pull.author_association.owner?

    serialized_changed_files = pull.changed_files_for_instrumentation.map { |file| serializer.changed_file(file, overrides: { change_type: file.change_type_symbol }) }

    hydro_payload = {
      pull_request: serializer.pull_request(pull, overrides: { changed_files: serialized_changed_files }),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
      protected_branch: serializer.protected_branch(payload[:protected_branch]),
      merge_action: payload[:merge_action],
      merge_method: payload[:merge_method],
      merge_state_status: payload[:merge_state_status],
      pr_approved: pull.reviews.map(&:state).include?(PullRequestReview.state_value(:approved)),
      actor_has_write_access: author_has_write_access,
      merge_commit_title: payload[:merge_commit_title],
      merge_commit_message: payload[:merge_commit_message]&.truncate(PullRequest::AnalyticsDependency::HYDRO_MAX_MERGE_COMMIT_MESSAGE_LENGTH),
      default_merge_commit_message_and_title: payload[:default_merge_commit_message_and_title],
      merge_commit_sha: payload[:merge_commit_sha],
    }

    if actor
      hydro_payload[:actor] = serializer.user(actor)
      hydro_payload[:actor_profile_location] = actor.profile_location
    end

    if author
      hydro_payload[:author] = serializer.user(author)
    end

    opener = pull.user
    if opener
      hydro_payload[:opener_login] = opener.login
      hydro_payload[:opener_profile_location] = opener.profile_location
    end

    publish(hydro_payload, schema: "github.v1.PullRequestMerge", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.in_progress") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]

    next unless pull.present?

    hydro_payload = {
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
      reviewable_state_was: payload[:reviewable_state_was],
    }

    if actor.present?
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestInProgress", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.synchronize") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]
    issue = payload[:issue]

    next unless pull.present?

    hydro_payload = {
      repository: serializer.repository(payload[:repository]),
      base_repository: serializer.repository(pull.base_repository),
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(issue),
      protected_branch: serializer.protected_branch(payload[:protected_branch]),
      ref: payload[:ref],
      before_oid: payload[:before],
      after_oid: payload[:after],
    }

    if actor
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestSynchronize")
  end

  subscribe("pull_request.ready_for_review") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]

    next unless pull.present?

    hydro_payload = {
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
      reviewable_state_was: payload[:reviewable_state_was],
    }

    if actor.present?
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestReadyForReview", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.converted_to_draft") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]

    next unless pull.present?

    hydro_payload = {
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
      reviewable_state_was: payload[:reviewable_state_was],
    }

    if actor.present?
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestConvertToDraft", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.reopen") do |payload|
    pull = payload[:pull_request]
    actor = payload[:actor]

    next unless pull.present?

    hydro_payload = {
      pull_request: serializer.pull_request(pull),
      issue: serializer.issue(pull.issue),
      repository: serializer.repository(pull.repository),
      repository_owner: serializer.user(pull.repository.owner),
    }

    if actor.present?
      hydro_payload[:actor] = serializer.user(actor)
    end

    publish(hydro_payload, schema: "github.v1.PullRequestReopen", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.auto_merge_enable") do |payload|
    hydro_payload = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      protected_branch: serializer.protected_branch(payload[:protected_branch]),
      unfulfilled_protected_branch_policy_reason_codes: payload[:unfulfilled_protected_branch_policy_reason_codes],
      auto_merge_request: serializer.auto_merge_request(payload[:auto_merge_request])
    }
    publish(hydro_payload, schema: "github.v1.PullRequestAutoMergeEnable", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.auto_merge_disable") do |payload|
    hydro_payload = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      disabled_message: payload[:disabled_message],
      protected_branch: serializer.protected_branch(payload[:protected_branch]),
      unfulfilled_protected_branch_policy_reason_codes: payload[:unfulfilled_protected_branch_policy_reason_codes],
      auto_merge_request: serializer.auto_merge_request(payload[:auto_merge_request])
    }
    publish(hydro_payload, schema: "github.v1.PullRequestAutoMergeDisable", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/pull_request_file\.(viewed|unviewed|dismissed)/) do |payload|
    message = {
      pull_request: serializer.pull_request(payload[:pull_request]),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      file_path: serializer.force_utf8(payload[:file_path]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      action: serializer.enum_from_string(payload[:action]),
    }

    publish(message, schema: "github.v1.MarkFileAsViewed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request_review_comment.create") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    serialized_repository_owner = serializer.user(payload[:repository_owner])
    serialized_pull_request = serializer.pull_request(payload[:pull_request])
    serialized_pull_request_creator = serializer.user(payload[:pull_request_creator])
    serialized_pull_request_review_comment = serializer.pull_request_review_comment(payload[:review_comment])
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:review_comment].body)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      pull_request: serialized_pull_request,
      pull_request_review_comment: serialized_pull_request_review_comment,
      issue: serializer.issue(payload[:issue]),
      specimen_body: serialized_specimen_body,
      pull_request_review: serializer.pull_request_review(payload[:pull_request_review]),
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).pull_request_scanning_service_flags,
    }

    publish(message, schema: "github.v1.PullRequestReviewCommentCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :PULL_REQUEST_REVIEW_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.PullRequestReviewCommentCreate"),
      content_database_id: serialized_pull_request_review_comment[:id],
      content_global_relay_id: serialized_pull_request_review_comment[:global_relay_id],
      content_created_at: serialized_pull_request_review_comment[:created_at],
      content_updated_at: serialized_pull_request_review_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_pull_request_creator,
      parent_content_database_id: serialized_pull_request[:id],
      parent_content_global_relay_id: serialized_pull_request[:global_relay_id],
      parent_content_created_at: serialized_pull_request[:created_at],
      parent_content_updated_at: serialized_pull_request[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_review_comment_scan(payload[:review_comment], serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("pull_request_review_comment.update") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    serialized_repository_owner = serializer.user(payload[:repository_owner])
    serialized_pull_request = serializer.pull_request(payload[:pull_request])
    serialized_pull_request_creator = serializer.user(payload[:pull_request_creator])
    serialized_pull_request_review_comment = serializer.pull_request_review_comment(payload[:review_comment])
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:review_comment].body)

    message = {
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      pull_request: serialized_pull_request,
      pull_request_review: serializer.pull_request_review(payload[:pull_request_review]),
      pull_request_review_comment: serialized_pull_request_review_comment,
      specimen_body: serialized_specimen_body,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).pull_request_scanning_service_flags,
      issue: serializer.issue(payload[:issue]),
    }

    publish(message, schema: "github.v1.PullRequestReviewCommentUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :PULL_REQUEST_REVIEW_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.PullRequestReviewCommentUpdate"),
      content_database_id: serialized_pull_request_review_comment[:id],
      content_global_relay_id: serialized_pull_request_review_comment[:global_relay_id],
      content_created_at: serialized_pull_request_review_comment[:created_at],
      content_updated_at: serialized_pull_request_review_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_pull_request_creator,
      parent_content_database_id: serialized_pull_request[:id],
      parent_content_global_relay_id: serialized_pull_request[:global_relay_id],
      parent_content_created_at: serialized_pull_request[:created_at],
      parent_content_updated_at: serialized_pull_request[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_review_comment_scan(payload[:review_comment], serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("pull_request_review_comment.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      pull_request_review: serializer.pull_request_review(payload[:pull_request_review]),
      pull_request_review_comment: serializer.pull_request_review_comment(payload[:review_comment]),
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
    }

    publish(message, schema: "github.v1.PullRequestReviewCommentDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request_review_thread.create") do |payload|
    message = {
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.PullRequestReviewThreadCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request_review_thread.delete") do |payload|
    message = {
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.PullRequestReviewThreadDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request_review_thread.resolved") do |payload|
    message = {
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
      repository: serializer.repository(payload[:pull_request_review_thread].repository),
      actor: serializer.user(payload[:actor]),
    }

    publish(
      message,
      schema: "github.pull_requests.v1.PullRequestReviewThreadResolveOrUnresolve",
      topic: "github.pull_requests.v1.PullRequestReviewThreadResolve"
    )
  end

  subscribe("pull_request_review_thread.unresolved") do |payload|
    message = {
      pull_request_review_thread: serializer.pull_request_review_thread(payload[:pull_request_review_thread]),
      repository: serializer.repository(payload[:pull_request_review_thread].repository),
      actor: serializer.user(payload[:actor]),
    }

    publish(
      message,
      schema: "github.pull_requests.v1.PullRequestReviewThreadResolveOrUnresolve",
      topic: "github.pull_requests.v1.PullRequestReviewThreadUnresolve"
    )
  end

  subscribe("pull_request_review.submit") do |payload|
    review = payload[:review]

    serialized_changed_files = review.pull_request.changed_files_for_instrumentation.map { |file| serializer.changed_file(file, overrides: { change_type: file.change_type_symbol }) }
    serialized_repository = serializer.repository(review.repository)
    serialized_repository_owner = serializer.user(review.repository.owner)
    serialized_actor = serializer.user(review.user)

    message = {
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      request_context: serializer.request_context(GitHub.context.to_hash),
      pull_request: serializer.pull_request(review.pull_request, overrides: { changed_files: serialized_changed_files }),
      pull_request_review: serializer.pull_request_review(review),
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(review.repository).pull_request_scanning_service_flags,
      issue: serializer.issue(review.pull_request.issue),
    }

    publish(message, schema: "github.v1.PullRequestReviewSubmit", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_review_scan(review, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("pull_request_review.update") do |payload|
    review, old_body = payload.values_at(:review, :old_body)
    serialized_repository = serializer.repository(review.repository)
    serialized_repository_owner = serializer.user(review.repository.owner)
    serialized_actor = serializer.user(review.user)

    message = {
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      pull_request: serializer.pull_request(review.pull_request),
      pull_request_review: serializer.pull_request_review(review),
      old_body: serializer.force_utf8(old_body),
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(review.repository).pull_request_scanning_service_flags,
      issue: serializer.issue(review.pull_request.issue),
    }

    publish(message, schema: "github.v1.PullRequestReviewEdit", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_pr_review_scan(review, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("pull_request_review.dismiss") do |payload|
    review, actor = payload.values_at(:review, :actor)

    message = {
      actor: serializer.user(actor),
      repository: serializer.repository(review.repository),
      pull_request: serializer.pull_request(review.pull_request),
      pull_request_review: serializer.pull_request_review(review),
    }

    publish(message, schema: "github.v1.PullRequestReviewDismiss", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.review_request_delegated") do |payload|
    pull_request_review_request_overrides = {
      actor: serializer.user(payload[:actor]),
      action: serializer.enum_from_string(payload[:action]),
    }

    message = {
      organization: serializer.organization(payload[:organization]),
      team: serializer.team(payload[:team]),
      repository: serializer.repository(payload[:repository]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      algorithm: payload[:algorithm].to_s.upcase,
      max_delegated_reviewers_count: payload[:max_delegated_reviewers_count],
      count_existing_reviewers: payload[:count_existing_reviewers],
      remove_team_request: payload[:remove_team_request],
      include_child_team_members: payload[:include_child_team_members],
      team_review_request: serializer.pull_request_review_request(
        payload[:team_review_request],
        overrides: pull_request_review_request_overrides
      ),
      assigned_review_requests: payload[:assigned_review_requests].map do |assigned_review_request|
        serializer.pull_request_review_request(
          assigned_review_request,
          overrides: pull_request_review_request_overrides
        )
      end
    }

    publish(message, schema: "github.v1.PullRequestReviewRequestDelegation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull_request.select_diff_range") do |payload|
    client_context = payload[:client][:context]
    message = {
      actor: serializer.user(User.find_by(id: payload[:actor_id])),
      repository: serializer.repository(Repository.find_by(id: payload[:repository_id])),
      pull_request: serializer.pull_request(PullRequest.find_by(id: payload[:pull_request_id])),
      starting_diff_position: client_context[:starting_diff_position],
      ending_diff_position: client_context[:ending_diff_position],
      line_count: client_context[:line_count],
      diff_type: payload[:diff_type],
      whitespace_ignored: payload[:whitespace_ignored],
    }

    publish(message, schema: "github.v1.PullRequestMultilineSelect", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull_request.diffbar_filter_by_revision") do |payload|
    pull = PullRequest.find_by(id: payload[:pull_request_id])

    next unless pull.present?

    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      pull_request: serializer.pull_request(pull),
      repository: serializer.repository(pull.repository),
      current_revision_number: payload[:current_revision_number],
      viewed_revision_number: payload[:viewed_revision_number],
      filter_selection: payload[:filter_selection]
    }

    publish(message, schema: "github.v1.PullRequestDiffbarFilterByRevision", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull_request.local_checkout") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      action: payload[:action],
      client_type: payload[:client_type],
    }

    publish(message, schema: "github.v1.PullRequestLocalCheckout", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull_request.merge_external") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      client_type: payload[:client_type],
    }

    publish(message, schema: "github.v1.PullRequestMergeExternal", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull-request-refresh") do |payload|
    pr = PullRequest.find_by(id: payload[:pull_request_id])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      pull_request: serializer.pull_request(pr),
      repository: serializer.repository(T.must(pr).repository),
      tab_context: serializer.pull_request_refresh_tab_context(payload[:tab_context]),
    }

    publish(message, schema: "github.v1.PullRequestRefresh", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.force_push_timeline_diff.click") do |payload|
    message = {
      pull_request_id: payload[:pull_request_id],
      repository_id: payload[:repository_id],
      event_id: payload[:event_id],
      user_id: payload[:client]&.[](:user)&.id,
    }

    publish(message, schema: "github.v1.ForcePushTimelineClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("suggested_change.applied") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      comment: serializer.pull_request_review_comment(payload[:comment]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      issue: serializer.issue(payload[:issue]),
      file_extension: payload[:file_extension],
      error: payload[:error],
      commit_sha: payload[:commit_sha],
    }

    publish(message, schema: "github.v1.SuggestedChangeApplied", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/(browser\.)?pull_request.user_action/) do |payload|
    payload[:data] ||= {}

    # github.v1.PullRequestUserAction schema does not support arbitrary fields, so
    # any 'custom' data from the client context should be merged into the `data` field
    client_context = payload.dig(:client, :context) || {}
    payload[:data][:state] = client_context.delete(:file_filter_checked) if client_context.has_key?(:file_filter_checked)
    payload[:data].merge!(client_context)

    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      category: payload[:category],
      action: payload[:action],
      data: payload[:data].transform_values(&:to_s),
      request_context: serializer.request_context(GitHub.context.to_hash)
    }

    message[:repository] = serializer.repository(Repository.find_by(id: payload[:repository_id])) if payload[:repository_id].present?

    pull = PullRequest.find_by(id: payload[:pull_request_id])
    message.merge!(
      repository: serializer.repository(pull.repository),
      pull_request: serializer.pull_request(pull)
    ) if pull.present?

    publish(message, schema: "github.v1.PullRequestUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pull_request.merge_conflict") do |payload|
    pull = payload.fetch(:pull)
    conflicts = payload.fetch(:conflicts)
    publish(
      PullRequests::Conflicts.to_hydro(
        pull: payload.fetch(:pull),
        base_commit_oid: payload.fetch(:base_commit_oid),
        head_commit_oid: payload.fetch(:head_commit_oid),
        conflicts: conflicts.fetch(:conflicted_files),
        more_conflicts_exist: conflicts.fetch(:more_conflicted_files),
        queued: payload.fetch(:queued),
      ),
      schema: "github.pull_requests.v1.MergeConflict",
      partition_key: pull.repository_id
    )
  end

  subscribe("merge_commit.requested") do |payload|
    message = {
      repository_id: payload[:repository_id],
      pull_request_id: payload[:pull_request_id],
    }

    publish(message, schema: "github.pull_requests.v1.MergeCommitRequested")
  end

  def publish_secret_scanning_pr_scan(pr, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(pr.repository)
      if content_scanning.enabled?
        encrypted_title = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(pr.title, pr.issue.id, pr.created_at)
        contents.push({ content_type: :PULL_REQUEST_TITLE, content: encrypted_title })  unless encrypted_title.nil?

        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(pr.body, pr.issue.id, pr.created_at)
        contents.push({ content_type: :PULL_REQUEST_BODY, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: pr.issue.id,
          content_number: pr.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(pr.repository).pull_request_scanning_service_flags,
          content_created_at: pr.created_at ? pr.created_at.getutc : nil,
          contents: contents,
        }
        T.unsafe(self).publish(scan_msg, topic: "github.secret_scanning.v1.PullRequestScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Pull Request Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_pull_request_scan",
        "exception.message": e.message,
      )
    end
  end

  def publish_secret_scanning_pr_comment_scan(comment, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(comment.repository)
      if content_scanning.enabled?
        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(comment.body, comment.id, comment.created_at)
        contents.push({ content_type: :PULL_REQUEST_COMMENT, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: comment.id,
          content_number: comment.issue.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(comment.repository).pull_request_scanning_service_flags,
          content_created_at: comment.created_at ? comment.created_at.getutc : nil,
          contents: contents,
        }
        T.unsafe(self).publish(scan_msg, topic: "github.secret_scanning.v1.PullRequestCommentScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Pull Request Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_pull_request_comment_scan",
        "exception.message": e.message,
      )
    end
  end

  def publish_secret_scanning_pr_review_scan(review, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(review.repository)
      if content_scanning.enabled?
        body = review.body
        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(body, review.id, review.created_at)
        # TODO: Change to :PULL_REQUEST_REVIEW once refactor is complete
        contents.push({ content_type: :PULL_REQUEST_TIMELINE_COMMENT, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: review.id,
          content_number: review.pull_request.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(review.repository).pull_request_scanning_service_flags,
          content_created_at: review.created_at ? review.created_at.getutc : nil,
          contents: contents,
        }
        T.unsafe(self).publish(scan_msg, topic: "github.secret_scanning.v1.PullRequestCommentScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Pull Request Review Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_pull_request_review_scan",
        "exception.message": e.message,
      )
    end
  end

  def publish_secret_scanning_pr_review_comment_scan(review_comment, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(review_comment.repository)
      if content_scanning.enabled?
        body = review_comment.body
        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(body, review_comment.id, review_comment.created_at)
        contents.push({ content_type: :PULL_REQUEST_REVIEW_COMMENT, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: review_comment.id,
          content_number: review_comment.pull_request.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(review_comment.repository).pull_request_scanning_service_flags,
          content_created_at: review_comment.created_at ? review_comment.created_at.getutc : nil,
          contents: contents,
        }
        T.unsafe(self).publish(scan_msg, topic: "github.secret_scanning.v1.PullRequestCommentScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Pull Request Review Comment Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_pull_request_review_comment_scan",
        "exception.message": e.message,
      )
    end
  end
end
