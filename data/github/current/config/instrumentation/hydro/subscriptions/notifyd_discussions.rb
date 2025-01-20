# frozen_string_literal: true

require "notifyd-client"

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("discussion.create") do |payload|
    discussion = payload[:discussion]
    next unless discussion
    actor = payload[:actor]
    next unless actor

    # Do not notify if the discussion was converted from an issue / team discussion
    converted_at = discussion.converted_at
    updated_at = discussion.updated_at
    next if discussion.converting? || converted_at && updated_at <= converted_at

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: discussion.id,
      subject_klass: discussion.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: "create",
        current_body: discussion.body,
      }
    )
  end

  subscribe("discussion.update") do |payload|
    discussion = payload[:discussion]
    next unless discussion
    actor = payload[:actor]
    next unless actor
    previous_body = payload[:previous_body]
    next unless previous_body

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: discussion.id,
      subject_klass: discussion.class.name,
      context: {
        operation: "update",
        actor_id: actor.id,
        actor_login: actor.display_login,
        previous_body: previous_body,
        current_body: discussion.body,
      }
    )
  end

  subscribe("discussion_comment.create") do |payload|
    discussion_comment = payload[:discussion_comment]
    next unless discussion_comment
    actor = payload[:actor]
    next unless actor

    # Do not notify if the discussion was converted from an issue / team discussion
    if discussion = discussion_comment.discussion
      converted_at = discussion.converted_at
      updated_at = discussion.updated_at
      next if converted_at && updated_at <= converted_at
    end

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: discussion_comment.id,
      subject_klass: discussion_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: "create",
        current_body: discussion_comment.body,
      }
    )
  end

  subscribe("discussion_comment.update") do |payload|
    discussion_comment = payload[:discussion_comment]
    next unless discussion_comment
    actor = payload[:actor]
    next unless actor
    previous_body = payload[:previous_body]
    next unless previous_body

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: discussion_comment.id,
      subject_klass: discussion_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: "update",
        previous_body: previous_body,
        current_body: discussion_comment.body,
      }
    )
  end
end
