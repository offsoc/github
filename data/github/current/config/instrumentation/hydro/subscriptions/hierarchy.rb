# frozen_string_literal: true

# These are Hydro event subscriptions related to Hierarchy.
# Currently, the primary users of Hierarchy are Tasklist Blocks.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("tasklist.add") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
    }

    publish(message, schema: "github.v1.TasklistAdd")
  end

  subscribe("tasklist.render") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(payload[:viewer]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      item_count: payload[:item_count],
      render_target: payload[:render_target],
    }

    publish(message, schema: "github.v1.TasklistRender")
  end

  subscribe("tasklist.rename") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
    }

    publish(message, schema: "github.v1.TasklistRename")
  end

  subscribe("tasklist.item.add") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      item_type: payload[:item_type],
    }

    publish(message, schema: "github.v1.TasklistItemAdd")
  end

  subscribe("tasklist.item.remove") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      item_type: payload[:item_type],
    }

    publish(message, schema: "github.v1.TasklistItemRemove")
  end

  subscribe("tasklist.item.convert") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:issue_repository]),
      tracking_issue: serializer.issue(payload[:issue]),
      title: payload[:draft_title],
      issue_id: payload[:created_issue_id],
      issue_id_value: payload[:created_issue_id],
      source: payload[:source],
    }

    publish(message, schema: "github.v1.ConvertTaskToIssueClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("tasklist.item.metadata_menu_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      parent_repository: serializer.repository(payload[:parent_repository]),
      parent_issue: serializer.issue(payload[:parent_issue]),
      child_issue: serializer.issue(payload[:child_issue]),
      menu_type: payload[:menu_type],
    }

    publish(message, schema: "github.v1.TasklistItemMetadataMenuClick")
  end

  subscribe(/(browser\.)?tasklist.item.link_click/) do |payload|
    message = {
      link_type: payload[:link_type],
      repository_id: payload[:repository_id],
      originating_url: payload[:originating_url],
      child_url: payload[:child_url],
      user_id: payload[:user_id],
    }

    publish(message, schema: "github.v1.TasklistLinkClick")
  end

  subscribe(/(browser\.)?tasklist_block.user_action/) do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      tasklist_block_id: payload[:tasklist_block_id],
      action: payload[:action],
    }

    publish(message, schema: "github.v1.TasklistBlockUserAction")
  end

  subscribe("tasklist.diff") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      tasklist_block_diff: payload[:tasklist_block_diff],
      tasklist_item_diff: payload[:tasklist_item_diff],
    }

    publish(message, schema: "github.v1.TasklistDiff")
  end

  subscribe(/(browser\.)?add_tasklist.click/) do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:user_id])),
      issue_id: serializer.issue(Issue.find_by(id: payload[:issue_id])),
      originating_url: payload[:originating_url],
    }

    publish(message, schema: "github.v1.AddTasklistButtonClick")
  end

  subscribe("sub_issue.add") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      source_issue_repository: serializer.repository(Repository.find_by(id: payload[:source_issue_repository_id])),
      source_issue: Hydro::EntitySerializer.issue(payload[:source_issue]),
      target_issue: Hydro::EntitySerializer.issue(payload[:target_issue]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      existing: payload[:existing],
      transfer: payload[:transfer],
    }

    publish(message, schema: "github.v1.SubIssueAdd")
  end

  subscribe("sub_issue.remove") do |payload|
    message = {
      actor: serializer.user(User.find_by(id: payload[:actor_id])),
      source_issue_repository: serializer.repository(Repository.find_by(id: payload[:source_issue_repository_id])),
      source_issue: Hydro::EntitySerializer.issue(payload[:source_issue]),
      target_issue: Hydro::EntitySerializer.issue(payload[:target_issue]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.v1.SubIssueRemove")
  end

  subscribe("sub_issue.list.recalculate") do |payload|
    message = {
      source_issue: Hydro::EntitySerializer.issue(payload[:source_issue]),
      total: payload[:total],
      completed: payload[:completed],
      percent_completed: payload[:percent_completed],
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.v1.SubIssueListRecalculate")
  end
end
