# typed: true
# frozen_string_literal: true

# These are uncategorized Hydro event subscriptions.
# To make this more manageable and provide better ownership tracking:
# 1. Create a new file in `config/instrumentation/hydro/subscriptions` with a
#    `Hydro::EventForwarder.configure(source: GlobalInstrumenter)` block like below.
# 2. Add new or move existing subscriptions to that file.
# 3. Add an ownership line for your new file in SERVICEOWNERS

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(/repository_secret\.(create|remove)/) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(payload[:owner]),
      actor: serializer.user(payload[:actor]),
      name: payload[:name],
      state: payload[:state],
    }

    publish(message, schema: "github.v1.RepositorySecretChanged", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/issue\.(pinned|unpinned)/) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      state: payload[:state],
      issue: serializer.issue(payload[:issue]),
    }
    publish(message, schema: "github.v1.IssuePinUpdated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.deleted") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      issue: serializer.issue(payload[:issue]),
    }
    publish(message, schema: "github.v1.IssueDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.transferred") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      old_repository: serializer.repository(payload[:old_repository]),
      old_issue: serializer.issue(payload[:old_issue]),
      new_repository: serializer.repository(payload[:new_repository]),
      new_issue: serializer.issue(payload[:new_issue]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.v1.IssueTransferred")
  end

  subscribe("repository_image.created") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      uploader: serializer.user(payload[:uploader]),
      repository_image: serializer.repository_image(payload[:repository_image]),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryImageCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_image.deleted") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      destroyed_repository_image: serializer.repository_image(payload[:repository_image]),
    }

    publish(message, schema: "github.v1.RepositoryImageDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/package\.(published|downloaded)/) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      action: payload[:action].to_s.upcase.to_sym,
      registry_package_id: payload[:registry_package_id],
      package_version: payload[:version],
      package_size: payload[:package_size],
      user_agent: payload[:user_agent],
    }

    publish(message, schema: "github.package_registry.v0.PackageEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_deleted") do |payload|
    request_context = GitHub.context.to_hash
    message = {
      request_context: serializer.request_context(request_context),
      actor: serializer.user(payload[:actor]),
      package: serializer.package(payload[:package], total_size: payload[:storage_bytes], version_count: payload[:version_count]),
      deleted_at: payload[:deleted_at],
      storage_service: serializer.package_file_storage_service(payload[:storage_service]),
      user_agent: payload[:user_agent],
      via_actions: payload[:via_actions],
      event_id: request_context[:request_id] || SecureRandom.uuid,
    }

    publish(message, schema: "package_registry.v0.PackageDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_published") do |payload|
    request_context = GitHub.context.to_hash
    message = {
      request_context: serializer.request_context(request_context),
      actor: serializer.user(payload[:actor]),
      package: serializer.package(payload[:package], total_size: payload[:total_size], version_count: payload[:version_count]),
      published_at: payload[:published_at],
      storage_service: serializer.package_file_storage_service(payload[:storage_service]),
      user_agent: payload[:user_agent],
      via_actions: payload[:via_actions],
      event_id: request_context[:request_id] || SecureRandom.uuid,
      republished: payload[:republished],
      package_deleted_name: payload[:package_deleted_name]
    }

    publish(message, schema: "package_registry.v0.PackagePublished", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_version_deleted") do |payload|
    request_context = GitHub.context.to_hash
    message = {
      request_context: serializer.request_context(request_context),
      actor: serializer.user(payload[:actor]),
      package: serializer.package(payload[:package]),
      version: serializer.package_version(payload[:version], files_count: payload[:files_count], size: payload[:size]),
      deleted_at: payload[:deleted_at],
      storage_service: serializer.package_file_storage_service(payload[:storage_service]),
      user_agent: payload[:user_agent],
      via_actions: payload[:via_actions],
      event_id: request_context[:request_id] || SecureRandom.uuid,
      bulk_delete: payload[:bulk_delete]
    }

    publish(message, schema: "package_registry.v0.PackageVersionDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_version_downloaded") do |payload|
    publish(payload, schema: "package_registry.v0.PackageVersionDownloaded", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_file_destroyed") do |payload|
    request_context = GitHub.context.to_hash
    message = {
        artifact_id: payload[:artifact_id],
        storage_service: serializer.package_file_storage_service(payload[:storage_service]),
        event_id: request_context[:request_id] || SecureRandom.uuid,
        repository: { id: payload[:repository_id] },
    }

    publish(message, schema: "package_registry.v0.PackageFileDestroyed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_version_published") do |payload|
    request_context = GitHub.context.to_hash
    message = {
      request_context: serializer.request_context(request_context),
      actor: serializer.user(payload[:actor]),
      package: serializer.package(payload[:package]),
      version: serializer.package_version(payload[:version], files_count: payload[:files_count], size: payload[:size]),
      published_at: payload[:published_at],
      storage_service: serializer.package_file_storage_service(payload[:storage_service]),
      user_agent: payload[:user_agent],
      repository: serializer.repository(payload[:repository]),
      via_actions: payload[:via_actions],
      event_id: request_context[:request_id] || SecureRandom.uuid,
      republished: payload[:republished],
      bulk_publish: payload[:bulk_publish],
      version_deleted_name: payload.has_key?(:version_deleted_name) ? payload[:version_deleted_name] : nil
    }

    publish(message, schema: "package_registry.v0.PackageVersionPublished", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_file_published") do |payload|
    request_context = GitHub.context.to_hash
    message = {
        request_context: serializer.request_context(request_context),
        actor: serializer.user(payload[:actor]),
        package: serializer.package(payload[:package]),
        version: serializer.package_version(payload[:version], files_count: payload[:files_count], size: payload[:size]),
        published_at: payload[:published_at],
        storage_service: serializer.package_file_storage_service(payload[:storage_service]),
        user_agent: payload[:user_agent],
        repository: serializer.repository(payload[:repository]),
        via_actions: payload[:via_actions],
        file: serializer.package_file(payload[:file]),
        event_id: request_context[:request_id] || SecureRandom.uuid,
    }

    publish(message, schema: "package_registry.v0.PackageFilePublished", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_version_migration_initiated") do |payload|
    publish(payload, schema: "registry_metadata.v0.VersionMigrationInitiated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.package_migration_complete") do |payload|
    publish(payload, schema: "registry_metadata.v0.IndexPackage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("package_registry.namespace_cache_invalidate") do |payload|
    publish(payload, schema: "registry_metadata.v0.PackagesNamespaceCacheInvalidate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("packages.package_transferred") do |payload|
    request_context = GitHub.context.to_hash
    message = {
      request_context: serializer.request_context(request_context),
      actor: serializer.user(payload[:actor]),
      package: serializer.package(payload[:package], total_size: payload[:size]),
      transferred_at: payload[:transferred_at],
      storage_service: serializer.package_file_storage_service(payload[:storage_service]),
      user_agent: payload[:user_agent],
      repository: serializer.repository(payload[:repository]),
      previous_repository: serializer.repository(payload[:previous_repository]),
      previous_owner_user: serializer.user(payload[:previous_owner_user]),
      previous_owner_org: serializer.organization(payload[:previous_owner_org]),
      previous_owner_id: payload[:previous_owner_id],
      previous_owner_global_id: payload[:previous_owner_global_id],
      event_id: request_context[:request_id] || SecureRandom.uuid,
    }

    publish(message, schema: "package_registry.v0.PackageTransferred", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/(browser\.)?code_navigation\.(view_blob_symbols_available|view_blob_symbols_unavailable|view_blob_language_not_supported|click_on_symbol|navigate_to_definition|click_on_blob_definitions|navigate_to_blob_definition|click_on_references|navigate_to_reference|click_on_definitions|retry_definition|retry_references|retry_after_timeout)/) do |payload|
    repository = Repository.find_by(id: payload[:repository_id])
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(repository),
      action: payload[:action].to_s.upcase.to_sym,
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8),
      language: payload[:language],
      backend: payload[:backend],
      code_nav_context: payload[:code_nav_context],
      retry_backend: payload[:retry_backend],
      cross_repo_results_included: payload[:cross_repo_results_included],
      in_repo_result_count: payload[:in_repo_result_count],
      cross_repo_result_count: payload[:cross_repo_result_count],
    }
    message[:actor] = serializer.user(User.find_by(id: payload[:user_id])) if payload[:user_id]

    publish(message, schema: "github.code_navigation.v0.JumpToEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_clone.created") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      clone_repository: serializer.repository(payload[:clone_repository]),
      template_repository: serializer.repository(payload[:template_repository]),
    }

    publish(message, schema: "github.v1.RepositoryCloneCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("profile_pin.created") do |payload|
    message = { position: payload[:position], internal_view: payload[:internal_view] }
    message[:repository_id] = payload[:repository_id] if payload[:repository_id]
    message[:gist_id] = payload[:gist_id] if payload[:gist_id]
    message[:user] = serializer.user(payload[:user]) if payload[:user]
    if payload[:organization]
      message[:organization] = serializer.organization(payload[:organization])
    end

    publish(message, schema: "github.v1.ProfilePinCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("profile_pin.deleted") do |payload|
    message = { position: payload[:position], internal_view: payload[:internal_view] }
    message[:repository_id] = payload[:repository_id] if payload[:repository_id]
    message[:gist_id] = payload[:gist_id] if payload[:gist_id]
    message[:user] = serializer.user(payload[:user]) if payload[:user]
    if payload[:organization]
      message[:organization] = serializer.organization(payload[:organization])
    end

    publish(message, schema: "github.v1.ProfilePinDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("update_manifest.repository") do |payload|
    # publisher must be selected by the caller (usually a job) that
    # can determine how many events are likely to be published
    publisher = payload.delete(:publisher) || GitHub.hydro_publisher

    manifest_file = {
      filename: payload[:manifest_file][:filename],
      path: payload[:manifest_file][:path],
      git_ref: payload[:manifest_file][:git_ref].to_s,
      pushed_at: payload[:manifest_file][:pushed_at],
      blob_oid: payload[:manifest_file][:blob_oid],
    }

    message = {
      repository_id: payload[:repository_id],
      owner_id: payload[:owner_id],
      repository_private: payload[:repository_private],
      repository_fork: payload[:repository_fork],
      repository_nwo:  payload[:repository_nwo],
      repository_stargazer_count:  payload[:repository_stargazer_count],
      manifest_file: manifest_file,
      is_backfill: payload.fetch(:is_backfill, false),
    }

    # if snapshot_metadata key is populated, then the manifest_file
    # is a package-lock.json and the associated package.json OID and
    # Git commit/ref data will be needed downstream for DS-API snapshot
    # submission
    if payload[:snapshot_metadata]
      snapshot_metadata = {
        associated_manifest: payload[:snapshot_metadata][:associated_manifest],
        push_id: payload[:snapshot_metadata][:push_id],
        ref: payload[:snapshot_metadata][:ref],
        commit_sha: payload[:snapshot_metadata][:commit_sha],
      }
      message[:snapshot_metadata] = snapshot_metadata
    end

    publish(message,
            topic: "github.dependencygraph.v1.RepositoryManifestFileChange",
            schema: "github.dependencygraph.v0.RepositoryManifestFileChange",
            partition_key: message[:repository_id],
            publisher: publisher,
            topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_email.verify") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      actor: serializer.user(payload[:actor]),
      previous_primary_email: serializer.user_email(payload[:previous_primary_email]),
      current_primary_email: serializer.user_email(payload[:current_primary_email]),
      verified_email: serializer.user_email(payload[:verified_email]),
    }

    publish(message, schema: "github.v1.UserEmailVerify", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("contact_form.submit") do |payload|
    contact_request = payload[:contact_request]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      name: contact_request.name.to_s,
      email: contact_request.email.to_s,
      subject: contact_request.subject.to_s,
      body: contact_request.comments.to_s,
      form_type: contact_request.flavor.to_s.gsub("-", "_").upcase,
      referring_url: contact_request.referring_url.to_s,
      reported_content_url: contact_request.content_url.to_s,
    }

    if contact_request.classifier.present?
      classifier = contact_request.classifier
      possible_classifiers = Platform::Enums::AbuseReportReason.values.keys
      sanitized_classifier = possible_classifiers.include?(classifier) ? classifier : "UNSPECIFIED"
      message[:reported_content_classifier] = sanitized_classifier
    end

    if (content_object = contact_request.content_object)
      message[:reported_content_type] = contact_request.content_type.underscore.upcase
      message[:reported_content_id] = content_object.id
      message[:reported_content] = [
        content_object.try(:title),
        content_object.try(:body),
      ].compact.join("\n")
    end

    message[:reported_user] = serializer.user(payload[:reported_user]) if payload[:reported_user].present?
    message[:reported_integration] = serializer.integration(payload[:reported_integration]) if payload[:reported_integration].present?

    publish(message, schema: "github.v1.ContactFormSubmission", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue_link_batch.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      source_repository: serializer.repository(payload[:source_repository]),
      source_issue: serializer.issue(payload[:source_issue]),
      total_issue_links: payload[:total_issue_links],
      xrepo_issue_links: payload[:xrepo_issue_links],
      link_type: payload[:link_type]
    }

    publish(message, schema: "github.v1.IssueLinkBatchCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue_link_batch.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      source_repository: serializer.repository(payload[:source_repository]),
      source_issue: serializer.issue(payload[:source_issue]),
      total_issue_links: payload[:total_issue_links],
      xrepo_issue_links: payload[:xrepo_issue_links],
      link_type: payload[:link_type]
    }

    publish(message, schema: "github.v1.IssueLinkBatchDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.check_suite_image.expand") do |payload|

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      check_suite_id: serializer.user(payload[:client][:check_suite_id]),
      check_run_id: serializer.user(payload[:client][:check_run_id]),
      github_app_id: serializer.user(payload[:client][:github_app_id]),
      filename: serializer.user(payload[:client][:filename]),
    }

    publish(message, schema: "github.v1.CheckSuiteImageExpand", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.check_suite.external_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      check_suite_id: serializer.user(payload[:client][:check_suite_id]),
      check_run_id: serializer.user(payload[:client][:check_run_id]),
      github_app_id: serializer.user(payload[:client][:github_app_id]),
      external_link_url: serializer.user(payload[:client][:link_url]),
      external_link_text: serializer.user(payload[:client][:link_text]),
    }

    publish(message, schema: "github.v1.CheckSuiteExternalClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.create_org.click") do |payload|
    user = payload[:client][:user]
    message = {
      request_context:      serializer.request_context(GitHub.context.to_hash),
      user:                 serializer.user(user),
      action:               payload[:action],
      category:             payload[:category],
      created_at:           Time.zone.now,
      label:                payload[:label],
      location:             payload[:location]&.to_sym,
      organizations_count:  serializer.owned_organization_count(user),
    }

    publish(message, schema: "github.v1.CreateOrgButtonClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.user-hovercard-hover") do |payload|
    user = User.find_by(id: payload[:userId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(user),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.UserHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.repository-hovercard-hover") do |payload|
    repo = Repository.find_by(id: payload[:repositoryId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      repository: serializer.repository(repo),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.RepositoryHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.team-hovercard-hover") do |payload|
    team = Team.find_by(id: payload[:teamId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      team: serializer.team(team),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.TeamHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.issue-hovercard-hover") do |payload|
    issue = Issue.find_by(id: payload[:pullRequestOrIssueId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      issue: serializer.issue(issue),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.IssueHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.pull-request-hovercard-hover") do |payload|
    pr = PullRequest.find_by(id: payload[:pullRequestOrIssueId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      pull_request: serializer.pull_request(pr),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.PullRequestHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.organization-hovercard-hover") do |payload|
    organization = Organization.find_by(id: payload[:organizationId])

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      organization: serializer.organization(organization),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.OrganizationHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.commit-hovercard-hover") do |payload|
    commit_id = payload[:commitGlobalRelayId]&.to_s
    decoded_commit_id = nil
    commit = if commit_id
      if Platform::Helpers::GlobalId.next?(commit_id)
        parsed_id = Platform::Helpers::GlobalId.parse(commit_id)
        Platform::Security::RepositoryAccess.with_viewer(payload[:actor]) do
          Platform::Objects::Commit.load_from_next_global_id(parsed_id).sync
        end
      else
        decoded_commit_id = Platform::Helpers::NodeIdentification.from_global_id(commit_id).last
        Platform::Security::RepositoryAccess.with_viewer(payload[:actor]) do
          Platform::Objects::Commit.load_from_global_id(decoded_commit_id).sync
        end
      end
    end

    message = {
      actor: serializer.user(payload[:client][:user]),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      commit: serializer.commit(commit),
      context: serializer.hovercard_context_string(payload[:subject]),
    }

    publish(message, schema: "github.v1.CommitHovercardHover", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("spam.notification") do |payload|
    message = {
      actor_login: payload[:actor].try(:login),
      channel: payload[:channel],
      message: payload[:message],
    }

    publish(message, schema: "hamzo.v0.ChatterboxNotification", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("account.rename") do |payload|
    message = {
      request_context: payload[:serialized_request_context],
      actor: serializer.user(payload[:actor]),
      account: serializer.user(payload[:account]),
      previous_login: payload[:previous_login],
      current_login: payload[:current_login],
      spamurai_form_signals: payload[:serialized_spamurai_form_signals],
    }

    publish(message, schema: "github.v1.AccountRename", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("payout.transfer") do |payload|
    message = {
      account: serializer.user(payload[:account]),
      total_transfer_amount_in_cents: payload[:total_transfer_amount_in_cents],
      match_amount_in_cents: payload[:match_amount_in_cents],
      sponsorship_amount_in_cents: payload[:sponsorship_amount_in_cents],
      destination_account_type: serializer.destination_account_type(payload[:destination_account_type]),
      destination_account_id: payload[:destination_account_id],
      payment_gateway: serializer.payment_gateway(payload[:payment_gateway]),
      matched: payload[:matched],
    }

    publish(message, schema: "github.payouts.v0.Transfer", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("octocaptcha.signup") do |payload|
    event_id = Base64.encode64("#{payload[:event_type]}-#{payload[:session_id]}-#{payload[:occurred_at].to_i}")
    message = {
      event_id: event_id,
      occurred_at: payload[:occurred_at],
      event_type: payload[:event_type],
      session_id: payload[:session_id],
      show_captcha: payload[:show_captcha],
      show_one_page_flow: true,
      validation_value: payload[:validation_value],
      validation_error: payload[:validation_error],
      signup_time: payload[:signup_time],
      funcaptcha_response: serializer.funcaptcha_response(payload[:funcaptcha_response]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      source_page: payload[:source_page],
      email_address: payload[:email_address],
      raw_funcaptcha_response_data: payload[:funcaptcha_response] && payload[:funcaptcha_response].to_json,
    }

    publish(message, schema: "github.v1.OctocaptchaSignup", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("octocaptcha.log") do |payload|
    publish(payload, schema: "github.v1.OctocaptchaLog")
  end

  subscribe("user_profile.page_view") do |payload|
    message = {
      profile_user: serializer.user(payload.fetch(:profile_user)),
      profile_viewer: serializer.user(payload.fetch(:profile_viewer)),
      request_context: serializer.request_context(GitHub.context.to_hash),
      has_organization_memberships: payload.fetch(:has_organization_memberships),
      scoped_org_id: payload.fetch(:scoped_org_id),
      selected_tab: payload.fetch(:selected_tab),
      profile_readme_rendered: payload.fetch(:profile_readme_rendered, false),
    }

    publish(message, schema: "github.v1.UserProfileView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_profile.repositories.page_view") do |payload|
    message = {
      profile_user: serializer.user(payload.fetch(:profile_user)),
      profile_viewer: serializer.user(payload.fetch(:profile_viewer)),
      request_context: serializer.request_context(GitHub.context.to_hash),
      is_organization: payload.fetch(:is_organization),
      selected_sort: payload.fetch(:selected_sort),
    }

    publish(message, schema: "github.v1.UserProfileRepositoriesView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.user_profile.highlights_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      scoped_org_id: payload.fetch(:scoped_org_id),
      client_timestamp: payload[:client][:timestamp].try(:to_i),
      server_timestamp: Time.zone.now,
      target_url: payload.fetch(:target_url),
      target_type: payload.fetch(:target_type),
      originating_request_id: payload.fetch(:originating_request_id),
    }

    publish(message, schema: "github.v1.UserProfileHighlightsClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.user_profile.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      profile_user: serializer.user(User.find(payload.fetch(:profile_user_id))),
      client_timestamp: payload[:client][:timestamp].try(:to_i),
      server_timestamp: Time.zone.now,
      originating_request_id: payload.fetch(:originating_request_id),
      target: payload.fetch(:target),
    }

    publish(message, schema: "github.v1.UserProfileClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.clone_or_download.click") do |payload|
    repo = if payload[:repository_id]
      Repository.find_by(id: payload[:repository_id])
    end
    gist = if payload[:gist_id]
      Gist.find_by(id: payload[:gist_id])
    end
    owner = if repo && repo.owner
      serializer.user(repo.owner)
    elsif gist && gist.owner
      serializer.user(gist.owner)
    end
    message = {
      actor: serializer.user(payload[:client][:user]),
      feature_clicked: payload[:feature_clicked],
      owner: owner,
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      git_repository_type: payload[:git_repository_type],
    }
    message[:repository] = serializer.repository(repo) if repo
    message[:gist] = serializer.gist(gist) if gist
    publish(message, schema: "github.v1.CloneDownloadClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("check_suite.status_changed") do |payload|
    message = {
      check_suite_id: payload[:check_suite_id],
      previous_status: payload[:previous_status],
      current_status: payload[:current_status],
      repository_id: payload[:repository_id],
      head_sha: payload[:head_sha],
      conclusion: payload[:conclusion],
      app: serializer.integration(payload[:app]),
    }

    publish(message, schema: "github.v1.CheckSuiteStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("check_run.status_changed") do |payload|
    message = {
      check_run_id: payload[:check_run_id],
      previous_status: payload[:previous_status],
      current_status: payload[:current_status],
      previous_conclusion: payload[:previous_conclusion],
      current_conclusion: payload[:current_conclusion],
    }

    publish(message, schema: "github.v1.CheckRunStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/user\.beta_feature\.(enroll|unenroll)/) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      feature: payload[:feature].upcase,
      action: payload[:action].upcase,
      organization: serializer.organization(payload[:organization]),
    }

    publish(message, schema: "github.v1.BetaFeatureEnrollmentEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.per_seat_plan_callout.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(User.find(payload[:actor_id])),
      organization: serializer.user(Organization.find(payload[:organization_id])),
      callout_page: payload[:callout_page],
      callout_location: payload[:callout_location],
      callout_text: payload[:callout_text],
      callout_destination: payload[:callout_destination],
      current_plan: payload[:current_plan],
    }

    publish(message, schema: "github.v1.PerSeatPlanCalloutClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sso_page.view") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      org: serializer.organization(payload[:org]),
      business: serializer.business(payload[:business]),
    }

    publish(message, schema: "github.v1.SsoPageView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.suggested_changes.target.click") do |payload|
    target_type = if payload[:target_type]
      payload[:target_type].upcase.to_sym
    else
      :TARGET_TYPE_UNKNOWN
    end

    relationship_to_suggestion = if payload[:relationship_to_suggestion]
      payload[:relationship_to_suggestion].upcase.to_sym
    else
      :RELATIONSHIP_TYPE_UNKNOWN
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      target_type: target_type,
      pull_request_id: payload[:pull_request_id],
      relationship_to_suggestion: relationship_to_suggestion,
    }

    publish(message, schema: "github.v1.SuggestedChangesClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_analysis.update") do |payload|
    case payload[:owner]
    when Business
      owner_type = :ENTERPRISE
    when Organization
      owner_type = :ORGANIZATION
    when User
      owner_type = :USER
    else
      owner_type = :UNKNOWN
    end

    message = {
      event_name: payload[:event_name],
      owner_id: payload[:owner].id,
      owner_type: owner_type,
      actor: serializer.user(payload[:actor]),
    }

    Hydro::PublishRetrier.publish(message, schema: "github.security_settings.v1.SecuritySettingsUpdate")
  end

  subscribe("delete_manifest.repository") do |payload|
    # publisher must be selected by the caller (usually a job) that
    # can determine how many events are likely to be published
    publisher = payload.delete(:publisher) || GitHub.hydro_publisher

    manifest_file = {
      filename: payload[:manifest_file][:filename],
      path: payload[:manifest_file][:path],
      git_ref: payload[:manifest_file][:git_ref].to_s,
      pushed_at: payload[:manifest_file][:pushed_at],
    }

    message = {
      repository_id: payload[:repository_id],
      repository_private: payload[:repository_private],
      repository_fork: payload[:repository_fork],
      manifest_file: manifest_file,
      repository_nwo: payload[:repository_nwo],
      owner_id: payload[:owner_id],
    }

    # if snapshot_metadata key is populated, then the manifest_file
    # is a package-lock.json and the associated package.json and
    # Git commit/ref data will be needed by the DS-API snapshot
    # submission PoC
    if payload[:snapshot_metadata]
      snapshot_metadata = {
        push_id: payload[:snapshot_metadata][:push_id],
        ref: payload[:snapshot_metadata][:ref],
        commit_sha: payload[:snapshot_metadata][:commit_sha],
      }
      message[:snapshot_metadata] = snapshot_metadata
    end

    Hydro::PublishRetrier.publish(message,
                                  schema: "github.dependencygraph.v0.RepositoryManifestFileDeleted",
                                  publisher: publisher,
                                  topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("integration.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      integration: serializer.integration(payload[:integration]),
      actor: serializer.user(payload[:actor]),
      from_manifest: payload[:from_manifest],
    }

    # TODO: ecosystem-apps/issues/5723 Add the ability to support the owner being a Business in the hydro schema.
    message[:owner] = serializer.user(payload[:owner]) unless payload[:owner].is_a?(Business)

    if payload[:from_manifest]
      manifest_json = JSON.generate(payload[:manifest])
      message[:manifest_json] = manifest_json
      message[:manifest_hash] = Digest::SHA256.base64digest(manifest_json)
    end

    publish(message, schema: "github.v1.IntegrationCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("branch_protection_rule.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      branch_protection_rule: serializer.branch_protection_rule(payload[:branch_protection_rule]),
      action: :CREATE,
    }

    publish(message, schema: "github.v1.BranchProtectionRuleChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("branch_protection_rule.update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      branch_protection_rule: serializer.branch_protection_rule(payload[:branch_protection_rule]),
      action: :UPDATE,
    }

    publish(message, schema: "github.v1.BranchProtectionRuleChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("branch_protection_rule.destroy") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      branch_protection_rule: serializer.branch_protection_rule(payload[:branch_protection_rule]),
      action: :DESTROY,
    }

    publish(message, schema: "github.v1.BranchProtectionRuleChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("stratocaster.timeline_update") do |payload|
    message = {
      index_key: payload[:index_key],
      event_id: payload[:event_id],
      current_ref: GitHub.current_ref,
    }

    options = {
      schema: Stratocaster::TIMELINE_UPDATE_SCHEMA,
      partition_key: payload[:index_key],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 },
    }

    if GitHub.dynamic_lab?
      options[:topic] = Stratocaster::REVIEW_LAB_TIMELINE_TOPIC
    end

    GitHub.stratocaster.publish_to_hydro do
      publish_without_error_reporting(message, **options)
    end
  end

  subscribe("browser.feature_gate_upsell.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      feature_name: payload[:feature_name]&.upcase,
    }

    publish(message, schema: "github.v1.FeatureGateUpsellClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("newsletter.preference.change") do |payload|
    publish(payload, schema: "github.v1.NewsletterPreferenceChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("blob.excerpt") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      path: payload[:path],
      blob_oid: payload[:blob_oid],
      first_line: payload[:first_line],
      last_line: payload[:last_line],
      direction: payload[:direction],
    }

    publish(message, schema: "github.v1.BlobExcerptLoaded", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("blob.edit.page_view") do |payload|
    path = payload[:path]&.dup&.force_encoding(Encoding::UTF_8)
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      target_repository: serializer.repository(payload[:target_repository]),
      branch: payload[:branch]&.dup&.force_encoding(Encoding::UTF_8),
      can_commit_to_branch: payload[:can_commit_to_branch],
      path: path,
      file_extension: serializer.file_extension(path),
    }

    publish(message, schema: "github.v1.BlobEditPageView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("blob.new.page_view") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      target_repository: serializer.repository(payload[:target_repository]),
      branch: payload[:branch]&.dup&.force_encoding(Encoding::UTF_8),
      can_commit_to_branch: payload[:can_commit_to_branch],
    }

    publish(message, schema: "github.v1.BlobNewPageView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/blob\.(new|edit|delete)\.succeeded/) do |payload|
    path = payload[:path]&.dup&.force_encoding(Encoding::UTF_8)
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      target_repository: serializer.repository(payload[:target_repository]),
      branch: payload[:branch]&.dup&.force_encoding(Encoding::UTF_8),
      can_commit_to_branch: payload[:can_commit_to_branch],
      target_branch: payload[:target_branch]&.dup&.force_encoding(Encoding::UTF_8),
      path: path,
      file_extension: serializer.file_extension(path),
      action: serializer.enum_from_string(payload[:action]),
    }

    publish(message, schema: "github.v1.BlobActionSucceeded", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/\Aaqueduct\.double-publish\z/) do |payload|
    message = payload.slice(:application, :endpoint, :duration)
    publish(message, schema: "aqueduct.v0.ClientTiming", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pages.build") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:actor]),
      page: serializer.page(payload[:page]),
      repository_owner: serializer.user(payload[:repository_owner]),
    }
    publish(message, schema: "github.v1.RepositoryPagesBuild", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pages.cname_change") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:actor]),
      page: serializer.page(payload[:page]),
      cname: payload[:cname]&.to_s,
      old_cname: payload[:old_cname]&.to_s,
    }
    publish(message, schema: "github.v1.RepositoryPagesCnameChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("pages.visibility_change") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:actor]),
      page: serializer.page(payload[:page]),
      public: payload[:public]
    }
    publish(message, schema: "github.v1.RepositoryPagesVisibilityChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("analytics.event") do |payload|
    message = {
      request_context: serializer.request_context(
        GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)
      ),
      actor: serializer.user(payload[:actor]),
      action: payload[:action],
      category: payload[:category],
      label: payload[:label]
    }

    publish(message, schema: "github.analytics.v0.Event")
  end

  subscribe("browser.analytics.event") do |payload|
    message = {
      request_context: serializer.request_context(
        GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)
      ),
      actor: serializer.user(payload[:client][:user]),
      action: payload[:action],
      category: payload[:category],
      label: payload[:label]
    }

    publish(message, schema: "github.analytics.v0.Event")
  end

  subscribe("browser.authentication.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      auth_type: payload[:auth_type].presence || :AUTH_TYPE_UNKNOWN,
      location_in_page: payload[:location_in_page],
    }
    if payload[:repository_id]
      repo = Repository.find_by(id: payload[:repository_id])
      message[:repository] = serializer.repository(repo) if repo
      message[:owner] = serializer.user(repo.owner) if repo&.owner
    end
    publish(message, schema: "github.v1.AuthenticationClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.repository.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:target],
    }
    if payload[:repository_id]
      repo = Repository.find_by(id: payload[:repository_id])
      message[:repository] = serializer.repository(repo) if repo
      message[:owner] = serializer.user(repo.owner) if repo&.owner
    end
    publish(message, schema: "github.v1.RepositoryClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.repository_create.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:event_target],
    }

    publish(message, schema: "github.v1.RepositoryCreateClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.delivery") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      reason: payload[:reason],
    }

    publish(message, schema: "github.notifications.v0.NotificationDelivery", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.read") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "READ",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.unread") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "UNREAD",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.archive") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "ARCHIVE",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.unarchive") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "UNARCHIVE",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.unsubscribe") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "UNSUBSCRIBE",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.star") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "STAR",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("notifications.unstar") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: payload[:handler].to_s.upcase,
      action: "UNSTAR",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.notifications.read") do |payload|
    user = payload[:client][:user]

    message = {
      user: serializer.user(user),
      list_type: payload[:list_type],
      list_id: payload[:list_id].to_s,
      thread_type: payload[:thread_type],
      thread_id: payload[:thread_id].to_s,
      comment_type: payload[:comment_type],
      comment_id: payload[:comment_id].to_s,
      handler: "WEB",
      action: "READ",
      version: payload.has_key?(:version) ? payload[:version].to_s.upcase : nil, # If key doesn't exist use default value
    }

    publish(message, schema: "github.notifications.v0.NotificationUserAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe "team_sync_tenant.status_change" do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      organization: serializer.organization(payload[:organization]),
      team_sync_tenant: serializer.team_sync_tenant(payload[:team_sync_tenant]),
      previous_status: serializer.team_sync_tenant_status_mapping(payload[:previous_status]),
      current_status: serializer.team_sync_tenant_status_mapping(payload[:current_status]),
    }
    publish(message, schema: "github.v1.TeamSyncTenantStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe "team_group_mapping.update" do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      team: serializer.team(payload[:team]),
      organization: serializer.organization(payload[:organization]),
      team_sync_tenant: serializer.team_sync_tenant(payload[:team_sync_tenant]),
      current_mappings: Array(payload[:current_mappings]).map { |mapping| serializer.team_group_mapping(mapping) },
      previous_group_ids: Array(payload[:previous_group_ids]),
    }
    publish(message, schema: "github.v1.TeamGroupMappingUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.convert_task_to_issue.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      target_type: payload[:target_type].upcase.to_sym,
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      tracking_issue: serializer.issue(payload[:tracking_issue]),
      title: payload[:title],
      issue_id: payload[:issue_id],
      issue_id_value: payload[:issue_id],
    }
    publish(message, schema: "github.v1.ConvertTaskToIssueClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.issue_cross_references.click") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      issue: serializer.issue(Issue.find_by(id: payload[:issue_id])),
      pull_request: serializer.pull_request(PullRequest.find_by(id: payload[:pull_request_id])),
      reference_location: payload[:reference_location],
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.IssueClosedByXrefsClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.issue_timeline_filter_menu.click") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      issue: serializer.issue(Issue.find_by(id: payload[:issue_id])),
      filter_selection: payload[:filter_selection],
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.IssueTimelineFilterClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.show_annotation.click") do |payload|
    pr = PullRequest.find_by(id: payload[:pull_request_id])
    repo = Repository.find_by(id: payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      pull_request: serializer.pull_request(pr),
      repository: serializer.repository(repo),
      actor: serializer.user(payload[:client][:user]),
      non_diff_entry: payload[:non_diff_entry],
    }

    publish(message, schema: "github.v1.ShowAnnotationClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("actions.dreamlifter_joined_waitlist") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.actions.v0.DreamlifterJoinedWaitlist", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("mobile.joined_waitlist") do |payload|
    message = {
      is_android: payload[:is_android],
      is_ios: payload[:is_ios],
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.mobile.v0.WaitlistRegistration", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("actions.artifact_storage_event") do |payload|
    message = {
      artifact_id: payload[:artifact_id],
      artifact_name: payload[:artifact_name],
      artifact_repository_owner_id: payload[:artifact_repository_owner_id],
      artifact_repository_id: payload[:artifact_repository_id],
      artifact_repository_visibility: serializer.enum_from_string(payload[:artifact_repository_visibility]),
      artifact_size_in_bytes: payload[:artifact_size_in_bytes],
      check_suite_id: payload[:check_suite_id],
      artifact_event_type: serializer.enum_from_string(payload[:event_type]),
      expires_at: payload[:expires_at],
      previously_expired_at: payload[:previously_expired_at],
      artifact_global_id: payload[:artifact_global_id],
      created_at: payload[:created_at],
    }

    publish(message, schema: "github.actions.v0.ArtifactStorageEvent", partition_key: payload[:artifact_id], topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.actions.onboarding_setup_workflow_click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      workflow_template: payload[:workflow_template],
      view_section: payload[:view_section],
      view_rank: payload[:view_rank],
      templates_count: payload[:templates_count],
      template_creator: payload[:template_creator],
      new_with_filter_view: payload[:new_with_filter_view],
      # Currently, correlation_id value is the request_id of actioncontroller actions/new request while request_context's request_id
      # is of browser event request. The correlation_id will help in correlating the controller hydro events with browser events. Also,
      # its value can a valid uuid if we add same uuid to controller request events.
      correlation_id: payload[:correlation_id],
      category: payload[:category],
      search_query: payload[:search_query]
    }

    publish(message, schema: "github.actions.v0.OnboardingSetupWorkflowClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.actions.setup_actions_popover_click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      click_type: serializer.enum_from_string(payload[:click_type]),
    }

    publish(message, schema: "github.actions.v0.SetupActionsPopoverClick")
  end

  subscribe("browser.actions.workflow_upgrade_popover_click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      location: payload[:location],
    }

    publish(message, schema: "github.actions.v0.WorkflowUpgradePopoverClick")
  end

  subscribe("webhook.delivery_metadata") do |payload|
    hook, hook_event, hook_payload, hook_custom_delivery = payload.values_at(:hook, :hook_event, :hook_payload, :hook_custom_delivery)

    message = ActiveRecord::Base.connected_to(role: :reading) do
      {
        delivery_guid: hook_payload[:guid],
        delivery_type: hook_custom_delivery ? hook_custom_delivery : :HOOKSHOT,
        github_request_id: payload[:request_id],
        hook_id: hook.id,
        hook_url: payload[:safe_hook_url],
        hook_event: hook_event.event_type,
        hook_action: hook_event.try(:action),
        hook_actor: serializer.user(hook_event.actor),
        hook_installation_target_type: hook.installation_target_type.underscore.upcase.gsub("/", "_").to_sym,
        hook_installation_target_id: hook.installation_target_id,
        hook_creator: serializer.user(hook.creator),
        hook_oauth_application: serializer.app(hook.oauth_application),
        hook_payload_bytes: hook_payload.to_json(dangerously_allow_all_keys: true).bytesize,
        hook_target_repository: serializer.repository(hook_event.target_repository),
        hook_target_organization: serializer.organization(hook_event.target_organization),
        hook_integration_installation_id: hook_payload.dig(:payload, :installation, :id),
      }
    end

    publish(message, schema: "github.webhooks.v0.DeliveryMetadata", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("webhook.dropped_event_metadata") do |payload|
    message = ActiveRecord::Base.connected_to(role: :reading) do
      {
        event_type: payload[:event_type],
        event_action: payload[:event_action],
        filtered_reason: payload[:filtered_reason],
        guid: payload[:guid],
        target_repository_id: payload[:target_repository_id],
        target_organization_id: payload[:target_organization_id],
        triggered_at: payload[:triggered_at],
        request_id: payload[:request_id],
      }
    end

    publish(message, schema: "github.webhooks.v0.DroppedEventMetadata")
  end

  subscribe("label.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      label: serializer.label(payload[:label]),
      issue_id: payload[:issue_id],
    }

    publish(message, schema: "github.v1.LabelCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("label.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      label: serializer.label(payload[:label]),
    }

    publish(message, schema: "github.v1.LabelUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("label.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      label: serializer.label(payload[:label]),
    }

    publish(message, schema: "github.v1.LabelDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("wiki.create") do |payload|
    wiki_content = [payload[:page_name], payload[:page_body]].compact.join(" ")

    message = {
      actor: serializer.user(payload[:actor]),
      page_body: payload[:page_body],
      page_name: payload[:page_name],
      page_url: payload[:page_url],
      repository: serializer.repository(payload[:repository]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository_owner: serializer.repository_owner(payload[:repository]),
      actor_is_member: serializer.user_repository_member?(payload[:repository], payload[:actor]),
      page_body_size: serializer.string_bytesize(payload[:page_body]),
      specimen_wiki_content: serializer.specimen_data(wiki_content),
    }

    publish(message, schema: "github.v1.WikiCreate")
  end

  subscribe("wiki.update") do |payload|
    wiki_content = [payload[:page_name], payload[:page_body]].compact.join(" ")

    message = {
      actor: serializer.user(payload[:actor]),
      page_body: payload[:page_body],
      page_name: payload[:page_name],
      page_url: payload[:page_url],
      repository: serializer.repository(payload[:repository]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository_owner: serializer.repository_owner(payload[:repository]),
      actor_is_member: serializer.user_repository_member?(payload[:repository], payload[:actor]),
      page_body_size: serializer.string_bytesize(payload[:page_body]),
      specimen_wiki_content: serializer.specimen_data(wiki_content),
    }

    publish(message, schema: "github.v1.WikiUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.contact_link.click") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:actor_id])),
      repository: serializer.repository(Repository.find_by(id: payload[:repository_id])),
      request_context: serializer.request_context(GitHub.context.to_hash),
      contact_link: serializer.contact_link(payload[:contact_link]),
    }

    publish(message, schema: "github.v1.ContactLinkClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.blank_issue.click") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:actor_id])),
      repository: serializer.repository(Repository.find_by(id: payload[:repository_id])),
      request_context: serializer.request_context(GitHub.context.to_hash),
      blank_issue_clicked: payload[:blank_issue_clicked],
    }

    publish(message, schema: "github.v1.BlankIssueClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("key_link.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repo]),
      repository_owner: serializer.user(payload[:repo].owner),
      prefix: payload[:key_prefix],
      template: payload[:url_template],
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamuri_form_signals]),
    }

    publish(message, schema: "github.v1.KeyLinkCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_asset.create") do |payload|
    user_asset = payload[:user_asset]

    message = {
      actor: serializer.user(user_asset.uploader),
      user_asset: serializer.user_asset(user_asset),
    }

    publish(message, schema: "github.v1.UserAssetCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_asset.uploaded") do |payload|
    user_asset = payload[:user_asset]

    message = {
      actor: serializer.user(user_asset.uploader),
      user_asset: serializer.user_asset(user_asset),
      upload_ip: serializer.ip_address(payload[:upload_ip]),
    }

    publish(message, schema: "github.v1.UserAssetScan", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_asset.scan_requested") do |payload|
    user_asset = payload[:user_asset]

    message = {
      actor: serializer.user(user_asset.uploader),
      user_asset: serializer.user_asset(user_asset),
      upload_ip: serializer.ip_address(payload[:upload_ip]),
    }

    publish(message, schema: "github.v1.UserAssetScan", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("two_factor_account_recovery.updated") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      action_type: payload[:action_type] || :ACTION_TYPE_UNKNOWN,
      evidence_type: payload[:evidence_type] || :EVIDENCE_TYPE_UNKNOWN,
    }

    publish(message, schema: "github.v1.TwoFactorRecoveryRequestChanged", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("automated_two_factor_account_recovery_request_review") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      review_required: payload[:review_required],
      reason_type: payload[:reason_type] || :REASON_TYPE_UNKNOWN,
      audit_log_event_type: payload[:audit_log_event_type],
      email_status_type: payload[:email_status_type] || :EMAIL_STATUS_TYPE_UNKNOWN,
      org_membership_type: payload[:org_membership_type] || :ORGANIZATION_MEMBERSHIP_TYPE_UNKNOWN
    }

    publish(message, schema: "github.v1.AutomatedTwoFactorRecoveryRequestReview", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.release_compare.click") do |payload|
    actor = User.find_by(id: payload.fetch(:actor_id))
    repository = Repository.find_by(id: payload.fetch(:repository_id))

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(actor),
      repository: serializer.repository(repository),
      current_tag_name: payload[:current_tag],
      previous_tag_name: payload[:previous_tag],
      location: payload[:location],
    }

    publish(message, schema: "github.v1.ReleaseCompareLinkClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_incident_response.remediation_complete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      account: serializer.user(payload[:account]),
      account_global_relay_id: payload[:account_id],
      successful_remediations: payload[:successful_remediations],
      failed_remediations: payload[:failed_remediations],
      errors: payload[:errors],
      staffnote: payload[:staffnote],
      email_body_template: payload[:email_body_template],
      incident_response_id: payload[:incident_response_id],
      batch_count: payload[:batch_count],
      batch_index: payload[:batch_index],
      inputs: payload[:inputs],
    }

    publish(message, schema: "github.v1.SecurityIncidentRemediation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.global_header.user_menu_dropdown.click") do |payload|
    user = User.find_by(id: payload[:user_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(user),
      target: payload[:target],
      request_url: payload[:request_url],
    }

    publish(message, schema: "github.v1.GlobalHeaderUserMenuClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("render.seats_show") do |payload|
    user = User.find_by(id: payload[:user_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(user),
      current_org_plan: payload[:current_org_plan],
      current_seats_count: payload[:current_seats_count],
      current_org_id: payload[:current_org_id],
    }

    publish(message, schema: "github.v1.ShowOrgSeatsSetting")
  end

  subscribe("browser.feature_flag_decision") do |payload|
    octo_cookie = payload.dig(:client, :context, :octolytics_id)
    feature = payload[:feature]
    visitor = Analytics::Visitor.with_octolytics_id(octo_cookie)

    if feature && octo_cookie && visitor
      message = {
        feature_flag: feature,
        decision: payload.dig(:client, :context, :feature_flag_enabled) ? "ENABLED" : "DISABLED",
        visitor_id: visitor.id.to_s
      }

      publish(message, schema: "github.v1.FeatureFlagDecision", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("environment.deleted") do |payload|
    deleted_env = payload[:deleted_environment]
    deleted_env_next_global_id = GitHub.enterprise? ? deleted_env&.global_relay_id : deleted_env&.next_global_id

    message = {
      actor: serializer.user(payload[:actor]),
      deleted_environment: serializer.environment(deleted_env, overrides: { next_global_id: deleted_env_next_global_id }),
    }
    publish(message, schema: "github.v1.EnvironmentDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("jobs.lock-not-acquired") do |payload|
    message = {
      serialized: GitHub::JSON.dump(payload[:job].serialize)
    }
    publish(message, schema: "github.v1.AqueductJob", topic: "github.v1.DiscardedJob", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("jobs.noop") do |payload|
    message = {
      serialized: GitHub::JSON.dump(payload[:serialized])
    }
    publish(message, schema: "github.v1.AqueductJob", topic: "github.v1.NoopScheduledJob", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.view_rendered") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:client][:user]),
      name: payload[:name],
    }

    publish(message, schema: "github.v1.ViewRendered")
  end

  subscribe("repository.remove_content_warning") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RemoveContentWarning")
  end

  subscribe("repository.enabled") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      enabled_at: payload[:enabled_at].try(:to_i),
    }

    publish(message, schema: "github.v1.RepositoryEnabled")
  end

  subscribe("repository.country_unblocked") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      unblocked_at: payload[:unblocked_at].try(:to_i),
      type: payload[:type].upcase.to_sym,
      country_codes: payload[:country_codes],
      country_names: payload[:country_names],
    }

    publish(message, schema: "github.v1.RepositoryCountryUnblocked")
  end
end
