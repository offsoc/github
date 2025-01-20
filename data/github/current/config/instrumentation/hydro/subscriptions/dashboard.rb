# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("user_dashboard_pin.created") do |payload|
    payload[:pinned_item_type] = "UNKNOWN" unless %w(repository gist user organization team issue pull_request project).include?(payload[:pinned_item_type].downcase)

    message = { position: payload[:position] }
    message[:pinned_item_id] = payload[:pinned_item_id] if payload[:pinned_item_id]
    message[:pinned_item_type] = payload[:pinned_item_type].upcase if payload[:pinned_item_type]
    message[:user] = serializer.user(payload[:user]) if payload[:user]

    publish(message, schema: "github.v1.UserDashboardPinCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_dashboard_pin.deleted") do |payload|
    payload[:pinned_item_type] = "UNKNOWN" unless %w(repository gist user organization team issue pull_request project).include?(payload[:pinned_item_type].downcase)

    message = { position: payload[:position] }
    message[:pinned_item_id] = payload[:pinned_item_id] if payload[:pinned_item_id]
    message[:pinned_item_type] = payload[:pinned_item_type].upcase if payload[:pinned_item_type]
    message[:user] = serializer.user(payload[:user]) if payload[:user]

    publish(message, schema: "github.v1.UserDashboardPinDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user_dashboard_shortcut.create") do |payload|
    message = {
      search_type: serializer.enum_from_string(payload[:search_type]),
      user: serializer.user(payload[:user]),
      scoping_repository_id: payload[:scoping_repository_id],
      shortcut_id: payload[:shortcut_id],
      context: serializer.enum_from_string(payload[:context]),
    }

    publish(message, schema: "github.v1.UserDashboardShortcutCreate")
  end

  subscribe("user_dashboard_shortcut.destroy") do |payload|
    message = {
      search_type: serializer.enum_from_string(payload[:search_type]),
      user: serializer.user(payload[:user]),
      scoping_repository_id: payload[:scoping_repository_id],
      context: serializer.enum_from_string(payload[:context]),
    }

    publish(message, schema: "github.v1.UserDashboardShortcutDestroy")
  end

  subscribe("dashboard.page_view") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      currently_starred_repos_count: payload[:currently_starred_repos_count],
      currently_following_users_count: payload[:currently_following_users_count],
      events_shown: payload[:events_shown],
      banner_shown: payload[:banner_shown],
      banner_dismissable: payload[:banner_dismissable],
      page_type: payload[:page_type].to_s.upcase.to_sym.presence,
      dashboard_version: payload[:dashboard_version],
    }

    publish(message, schema: "github.v1.DashboardPageView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.dashboard.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      event_context: payload[:event_context],
      target: payload[:target],
      record_id: payload[:record_id],
      dashboard_context: payload[:dashboard_context] == "user" ? :USER : :ORG,
      dashboard_version: payload[:dashboard_version],
      metadata: payload[:metadata],
    }

    publish(message, schema: "github.v1.DashboardClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.dashboard.collection_repo_click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      collection: payload[:collection_slug],
      repository: serializer.repository(repository),
      target: payload[:target],
    }

    if topic = Topic.find_by_name(payload[:topic_name])
      message[:topic] = serializer.topic(topic)
    end

    publish(message, schema: "github.v1.DashboardCollectionRepoClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
