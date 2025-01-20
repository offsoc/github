# frozen_string_literal: true

# These are Hydro event subscriptions related to Projects.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("project.create") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_project = serializer.project(payload[:project])
    serialized_owner_user = serializer.user(payload[:owner_user])
    serialized_owner_repo = serializer.repository(payload[:owner_repo])

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      project: serializer.project(payload[:project]),
      project_owner_user: serialized_owner_user,
      project_owner_repo: serialized_owner_repo,
      action: :CREATE,
    }

    publish(message, schema: "github.v1.ProjectEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      action_type: :CREATE,
      content_type: :PROJECT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProjectEvent"),
      content_database_id: serialized_project[:id],
      content_global_relay_id: serialized_project[:global_relay_id],
      content_created_at: serialized_project[:created_at],
      content_updated_at: serialized_project[:updated_at],
      title: serializer.specimen_data(payload[:project].name),
      content: serializer.specimen_data(payload[:project].body),
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_owner_user || serializer.user(payload[:owner_repo].owner),
      repository: serialized_owner_repo,
      content_visibility: serialized_project[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("project.update") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_project = serializer.project(payload[:project])
    serialized_owner_user = serializer.user(payload[:owner_user])
    serialized_owner_repo = serializer.repository(payload[:owner_repo])

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      action_type: :UPDATE,
      content_type: :PROJECT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProjectEvent"),
      content_database_id: serialized_project[:id],
      content_global_relay_id: serialized_project[:global_relay_id],
      content_created_at: serialized_project[:created_at],
      content_updated_at: serialized_project[:updated_at],
      title: serializer.specimen_data(payload[:project].name),
      content: serializer.specimen_data(payload[:project].body),
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_owner_user || serializer.user(payload[:owner_repo].owner),
      repository: serialized_owner_repo,
      content_visibility: serialized_project[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/\Aproject\.(update|delete|open|close)\z/) do |payload|
    actions = { update: "UPDATE", delete: "DELETE", open: "OPEN", close: "CLOSE" }

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      project: serializer.project(payload[:project]),
      project_owner_user: serializer.user(payload[:owner_user]),
      project_owner_repo: serializer.repository(payload[:owner_repo]),
      action: actions.fetch(payload[:action], "ACTION_UNKNOWN"),
    }

    publish(message, schema: "github.v1.ProjectEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("project_card.create") do |payload|
    project_card = payload[:card]
    project = payload[:project]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_project = serializer.project(project)
    serialized_owner = serializer.user(project.owner_type == "Repository" ? project.owner.owner : project.owner)
    serialized_repository = serializer.repository(project.owner_type == "Repository" ? project.owner : nil)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      project: serialized_project,
      card: serializer.project_card(project_card),
      action: :CREATE,
    }

    publish(message, schema: "github.v1.ProjectCardEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      action_type: :CREATE,
      content_type: :PROJECT_CARD,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProjectCardEvent"),
      content_database_id: project_card.id,
      content_global_relay_id: project_card.global_relay_id,
      content_created_at: project_card.created_at,
      content_updated_at: project_card.updated_at,
      content: serializer.specimen_data(project_card.note),
      parent_content_author: serializer.user(project.creator),
      parent_content_database_id: serialized_project[:id],
      parent_content_global_relay_id: serialized_project[:global_relay_id],
      parent_content_created_at: serialized_project[:created_at],
      parent_content_updated_at: serialized_project[:updated_at],
      owner: serialized_owner,
      repository: serialized_repository,
      content_visibility: serialized_project[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("project_card.update") do |payload|
    project_card = payload[:card]
    project = payload[:project]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_project = serializer.project(project)
    serialized_owner = serializer.user(project.owner_type == "Repository" ? project.owner.owner : project.owner)
    serialized_repository = serializer.repository(project.owner_type == "Repository" ? project.owner : nil)

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      action_type: :UPDATE,
      content_type: :PROJECT_CARD,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProjectCardEvent"),
      content_database_id: project_card.id,
      content_global_relay_id: project_card.global_relay_id,
      content_created_at: project_card.created_at,
      content_updated_at: project_card.updated_at,
      content: serializer.specimen_data(project_card.note),
      parent_content_author: serializer.user(project.creator),
      parent_content_database_id: serialized_project[:id],
      parent_content_global_relay_id: serialized_project[:global_relay_id],
      parent_content_created_at: serialized_project[:created_at],
      parent_content_updated_at: serialized_project[:updated_at],
      owner: serialized_owner,
      repository: serialized_repository,
      content_visibility: serialized_project[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/\Aproject_card\.(delete)\z/) do |payload|
    actions = { delete: "DELETE" }
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      project: serializer.project(payload[:project]),
      card: serializer.project_card(payload[:card]),
      action: actions.fetch(payload[:action], "ACTION_UNKNOWN"),
    }

    publish(message, schema: "github.v1.ProjectCardEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("project_card.move") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      automated: payload[:automated],
      project: serializer.project(payload[:project]),
      card: serializer.project_card(payload[:card]),
      source_column: serializer.project_column(payload[:source_column]),
      target_column: serializer.project_column(payload[:target_column]),
    }

    publish(message, schema: "github.projects.v0.ProjectCardMove", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("memex_ring.promoted") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      version: payload[:version],
      source_ring: payload[:source_ring],
      target_ring: payload[:target_ring],
    }

    publish(message, schema: "github.v1.MemexReleasePromoted")
  end

  subscribe("memex_ring.demoted") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      version: payload[:version],
      source_ring: payload[:source_ring],
      target_ring: payload[:target_ring],
    }

    publish(message, schema: "github.v1.MemexReleaseDemoted")
  end

  subscribe("memex_release.block") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      version: payload[:version],
      reason: payload[:reason],
    }

    publish(message, schema: "github.v1.MemexReleaseBlocked")
  end

  subscribe("memex_release.unblock") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      version: payload[:version],
    }

    publish(message, schema: "github.v1.MemexReleaseUnblocked")
  end

  subscribe("browser.memex_copy_project") do |payload|
    actor = User.find_by_id(payload[:actor_id])
    project = MemexProject.find_by_id(payload[:project_id])
    message = {
      actor: serializer.user(actor),
      memex_project: serializer.memex_project(project),
      name: "copy",
      ui: "web"
    }
    publish(message, schema: "github.memex.v1.Event", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("memex_event") do |payload|
    GitHub.tracer.in_span("hydro/subscribe/memex_event", kind: :internal, attributes: { "gh.memex.event.name" => payload[:name].to_s }) do
      serialized_request_context = serializer.request_context(GitHub.context.to_hash)
      serialized_actor = serializer.user(payload[:actor])
      serialized_project = serializer.memex_project(payload[:memex_project])
      serialized_repository = serializer.repository(payload[:repository])

      message = {
        actor: serialized_actor,
        memex_project: serialized_project,
        memex_project_column: serializer.memex_project_column(payload[:memex_project_column]),
        memex_project_item: serializer.memex_project_item(payload[:memex_project_item]),
        performed_at: payload[:performed_at] || Time.zone.now,
        name: payload[:name],
        ui: payload[:ui],
        context: payload[:context],
        memex_project_view: serializer.memex_project_view(payload[:memex_project_view]),
        repository: serialized_repository,
      }

      publish(message, schema: "github.memex.v1.Event", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

      if payload[:name] == MemexProjectItem::ON_CREATE_INSTRUMENTATION_KEY
        publish(
          project_item_message(message, serialized_request_context),
          schema: "github.memex.v0.ProjectItemCreate",
          topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
        )
      end

      if payload[:name] == MemexProjectItem::ON_UPDATE_INSTRUMENTATION_KEY
        serialized_creator = serializer.user(payload[:creator])
        publish(
          project_item_message(message, serialized_request_context).merge({
            previous_values: payload[:previous_values],
            creator: serialized_creator
          }),
          schema: "github.memex.v0.ProjectItemUpdate",
          topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
        )
      end

      if payload[:name] == MemexProjectItem::ON_DESTROY_INSTRUMENTATION_KEY && payload[:memex_project_item].present?
        publish(
          project_item_message(message, serialized_request_context),
          schema: "github.memex.v0.ProjectItemDestroy",
          topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
        )
      end

      if payload[:name] == MemexProjectColumnValue::ON_UPDATE_INSTRUMENTATION_KEY
        message = column_value_message(
          payload,
          {
            request_context: serialized_request_context,
            previous_value: serializer.force_utf8(payload[:previous_value])
          })

        publish(
          message,
          schema: "github.memex.v0.MemexProjectColumnValueUpdate",
          topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

        user_generated_content_msg = {
          request_context: serialized_request_context,
          spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
          action_type: :UPDATE,
          content_type: :MEMEX_PROJECT_COLUMN_VALUE,
          actor: serialized_actor,
          original_type_url: GitHub::Config::HydroConfig.build_type_url("github.memex.v0.MemexProjectEvent"),
          content_database_id: serialized_project[:id],
          content_global_relay_id: serialized_project[:global_relay_id],
          content_created_at: serialized_project[:created_at],
          content_updated_at: serialized_project[:updated_at],
          content: serializer.specimen_data(payload[:value]),
          parent_content_author: nil,
          parent_content_database_id: nil,
          parent_content_global_relay_id: nil,
          parent_content_created_at: nil,
          parent_content_updated_at: nil,
          repository: serialized_repository,
          content_visibility: payload[:public] ? :PUBLIC : :PRIVATE
        }

        publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
      end

      if payload[:name] == MemexProjectColumnValue::ON_CREATE_INSTRUMENTATION_KEY
        publish(column_value_message(payload, { request_context: serialized_request_context }), schema: "github.memex.v0.MemexProjectColumnValueCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

        user_generated_content_msg = {
          request_context: serialized_request_context,
          spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
          action_type: :CREATE,
          content_type: :MEMEX_PROJECT_COLUMN_VALUE,
          actor: serialized_actor,
          original_type_url: GitHub::Config::HydroConfig.build_type_url("github.memex.v0.MemexProjectEvent"),
          content_database_id: serialized_project[:id],
          content_global_relay_id: serialized_project[:global_relay_id],
          content_created_at: serialized_project[:created_at],
          content_updated_at: serialized_project[:updated_at],
          content: serializer.specimen_data(payload[:value]),
          parent_content_author: nil,
          parent_content_database_id: nil,
          parent_content_global_relay_id: nil,
          parent_content_created_at: nil,
          parent_content_updated_at: nil,
          repository: serialized_repository,
          content_visibility: payload[:public] ? :PUBLIC : :PRIVATE
        }

        publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
      end

      if payload[:name] == MemexProjectColumnValue::ON_DESTROY_INSTRUMENTATION_KEY
        publish(column_value_message(payload, { request_context: serialized_request_context }), schema: "github.memex.v0.MemexProjectColumnValueDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
      end

      if payload[:name] == MemexProjectColumn::ON_CREATE_INSTRUMENTATION_KEY
        column_value_create_message = {
          actor: serialized_actor,
          memex_project: serialized_project,
          memex_project_column: serializer.memex_project_column(payload[:memex_project_column]),
        }
        publish(column_value_create_message, schema: "github.memex.v1.MemexProjectColumnCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
      end
    end
  end

  subscribe("memex.project_item_move") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_item: serializer.memex_project_item(payload[:project_item]),
      project_view: serializer.memex_project_view(payload[:project_view]),
      project_column_value_records: payload[:project_column_value_records]
    }
    publish(
      message,
      schema: "github.memex.v0.MemexProjectItemMove",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
    )
  end

  subscribe("memex.project_item_metadata_update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      memex_project: serializer.memex_project(payload[:memex_project]),
      memex_project_item: serializer.memex_project_item(payload[:memex_project_item]),
      previous_values: payload[:previous_values],
    }
    publish(
      message,
      schema: "github.memex.v0.ProjectItemMetadataUpdate",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
    )
  end

  def column_value_message(payload, attrs = {})
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:memex_project]),
      project_column: serializer.memex_project_column(payload[:memex_project_column]),
      project_item: serializer.memex_project_item(payload[:memex_project_item]),
      project_view: serializer.memex_project_view(payload[:memex_project_view]),
      value: payload[:value]
    }

    message.merge(attrs)
  end

  def project_item_message(message, request_context)
    message.slice(:actor, :memex_project, :memex_project_item)
           .merge(request_context: request_context)
  end

  subscribe(/\Amemex_project\.(create|update|delete)\z/) do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_project = serializer.memex_project(payload[:project])
    serialized_owner = serializer.user(payload[:owner])
    action = payload[:action].upcase

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      project: serialized_project,
      project_owner: serialized_owner,
      action: action
    }
    publish(message, schema: "github.memex.v0.MemexProjectEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })

    unless action == :DELETE
      action_type = action == :CREATE ? :CREATE : :UPDATE
      # adds both the short description and the description together so that they can be passed as UGC
      content = [payload[:project].short_description, "\n" , payload[:project].description].join("")
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
        action_type: action_type,
        content_type: :MEMEX_PROJECT,
        actor: serialized_actor,
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.memex.v0.MemexProjectEvent"),
        content_database_id: serialized_project[:id],
        content_global_relay_id: serialized_project[:global_relay_id],
        content_created_at: serialized_project[:created_at],
        content_updated_at: serialized_project[:updated_at],
        title: serializer.specimen_data(payload[:project].title),
        content: serializer.specimen_data(content),
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_owner,
        repository: nil,
        content_visibility: payload[:public] ? :PUBLIC : :PRIVATE
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("memex_project_column.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      memex_project: serializer.memex_project(payload[:memex_project]),
      memex_project_column: serializer.memex_project_column(payload[:memex_project_column]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      previous_changes: payload[:memex_project_column].previous_changes&.to_json
    }

    publish(message, schema: "github.memex.v1.MemexProjectColumnUpdate")
  end

  subscribe("memex_project_column.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      memex_project: serializer.memex_project(payload[:memex_project]),
      memex_project_column: serializer.memex_project_column(payload[:memex_project_column]),
      request_context: serializer.request_context(GitHub.context.to_hash)
    }

    publish(message, schema: "github.memex.v1.MemexProjectColumnDestroy")
  end

  subscribe("memex_project_view.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_view: serializer.memex_project_view(payload[:project_view]),
      request_context: serializer.request_context(GitHub.context.to_hash)
    }

    publish(message, schema: "github.memex.v0.MemexProjectViewCreate")
  end

  subscribe("memex_project_view.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_view: serializer.memex_project_view(payload[:project_view]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.memex.v0.MemexProjectViewUpdate")
  end

  subscribe("memex_project_view.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_view: serializer.memex_project_view(payload[:project_view]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.memex.v0.MemexProjectViewDestroy")
  end


  subscribe("memex_project_chart.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_chart: serializer.memex_project_chart(payload[:project_chart])
    }

    publish(message, schema: "github.memex.v0.MemexProjectChartCreate")
  end

  subscribe("memex_project_chart.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_chart: serializer.memex_project_chart(payload[:project_chart])
    }

    publish(message, schema: "github.memex.v0.MemexProjectChartUpdate")
  end

  subscribe("memex_project_item.bulk_add") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      number_of_issues: payload[:issue_ids].length,
      number_of_prs: payload[:pull_request_ids].length,
      number_of_projects: payload[:project_ids].length,
      issue_ids: payload[:issue_ids],
      pr_ids: payload[:pull_request_ids],
      projects_ids: payload[:project_ids],
      added_from: payload[:source]
    }

    publish(message, schema: "github.v1.MemexBulkAddItems")
  end

  subscribe("memex_project_chart.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      project: serializer.memex_project(payload[:project]),
      project_chart: serializer.memex_project_chart(payload[:project_chart])
    }

    publish(message, schema: "github.memex.v0.MemexProjectChartDestroy")
  end

  subscribe("browser.project_card_xref_toggle.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      project: serializer.project(Project.find_by(id: payload[:project_id])),
      issue: serializer.issue(Issue.find_by(id: payload[:issue_id])),
      card: serializer.project_card(ProjectCard.find_by(id: payload[:card_id])),
      action: payload[:action],
    }
    publish(message, schema: "github.v1.ProjectCardXrefViewEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/draft_issue\.assignment\.(create|destroy)\Z/) do |payload|
    previous_assignee = payload[:previous_assignee]
    message = {
      actor: serializer.user(payload[:actor]),
      draft_issue: serializer.draft_issue(payload[:draft_issue]),
      project_item: serializer.memex_project_item(payload[:memex_project_item]),
      assignees: payload[:assignees].map { |user| serializer.user(user) },
      previous_assignee: previous_assignee ? serializer.user(payload[:previous_assignee]) : nil,
      project: serializer.memex_project(payload[:memex_project]),
      request_context: serializer.request_context(payload[:request_context])
    }
    publish(message, schema: "github.memex.v0.DraftIssueUpdateAssignee")
  end

  subscribe(/draft_issue\.update\Z/) do |payload|
    title = payload[:title]
    previous_title = payload[:previous_title]
    if title != previous_title
      message = {
        actor: serializer.user(payload[:actor]),
        draft_issue: serializer.draft_issue(payload[:draft_issue]),
        project_item: serializer.memex_project_item(payload[:project_item]),
        project: serializer.memex_project(payload[:project]),
        title: title,
        previous_title: previous_title,
        request_context: serializer.request_context(payload[:request_context])
      }
      publish(message, schema: "github.memex.v0.DraftIssueUpdateTitle")
    end
  end

  subscribe("draft_issue.convert_to_issue") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      draft_issue: serializer.draft_issue(payload[:draft_issue]),
      issue: serializer.issue(payload[:issue]),
      project: serializer.memex_project(payload[:project]),
      project_item: serializer.memex_project_item(payload[:project_item]),
      request_context: serializer.request_context(payload[:request_context])
    }

    publish(message, schema: "github.memex.v0.DraftIssueConvertToIssue")
  end

  subscribe("projects_without_limits_engagement") do |payload|
    publish(payload, schema: "github.memex.v0.ProjectsWithoutLimitsEngagement")
  end
end
