# typed: true
# frozen_string_literal: true

# Hydro event subscriptions that must publish a message to the ModerationAction topic for DSA compliance.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("repository.apply_content_warning") do |payload|
    moderation_types = [:LABELLED, :DEMOTED]
    is_test = test_event?(payload[:actor], payload[:repository].owner)
    tos_reason = TrustSafety::ContentWarnings.moderation_action_reason_for(payload[:category])
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    source = :USER_REPORT

    moderation_types << :INTERACTION_RESTRICTED if payload[:type] == "Interstitial"

    content_moderation = {
      global_relay_id: serialized_repository[:global_relay_id],
      content_type: "repository",
      content: "#{GitHub.url}/#{payload[:repository].name_with_display_owner}",
      content_created_at: serialized_repository[:created_at],
      content_updated_at: serialized_repository[:updated_at],
      moderation_types: moderation_types,
      formats: [:TEXT, :IMAGE]
    }

    message = {
      actor: serialized_actor,
      repository: serialized_repository,
      type: payload[:type].capitalize.to_sym,
      category: payload[:category],
      sub_category: payload[:sub_category],
      custom_sub_category: payload[:custom_sub_category],
      notify_fork_owners: payload[:notify_fork_owners],
      instructions: payload[:instructions],
    }

    publish(message, schema: "github.v1.ApplyContentWarning")
    publish_moderation_action("repository.apply_content_warning", serialized_actor, source, content_moderation:, is_test:, tos_reason:)
  end

  subscribe("staff.mark_as_spammy") do |payload|
    is_test = test_event?(payload[:actor], payload[:account])

    serialized_account = serializer.user(payload[:account])
    serialized_actor = serializer.user(payload[:actor])

    account_moderation = {
      account: serialized_account,
      moderation_type: payload[:moderation_type],
      end_timestamp: payload[:moderation_end_timestamp]
    }

    content_moderation = {
      content_created_at: payload[:content_created_at].presence || DateTime.now,
      formats: payload[:content_formats].presence || [:TEXT]
    }

    publish_moderation_action(
      "staff.mark_as_spammy",
      serialized_actor,
      payload[:dsa_source],
      countries: payload[:dsa_countries],
      tos_reason: payload[:tos_reason].upcase.to_sym,
      account_moderation:,
      content_moderation:,
      is_test:
    )
  end

  subscribe("user.suspend") do |payload|
    is_test = test_event?(payload[:actor], payload[:account])

    serialized_account = serializer.user(payload[:account])
    serialized_actor = serializer.user(payload[:actor])

    account_moderation = {
      account: serialized_account,
      moderation_type: payload[:moderation_type],
      end_timestamp: payload[:moderation_end_timestamp]
    }

    content_moderation = {
      content_created_at: payload[:content_created_at].presence || DateTime.now,
      formats: payload[:content_formats].presence || [:TEXT]
    }

    publish_moderation_action(
      "user.suspend",
      serialized_actor,
      payload[:dsa_source],
      tos_reason: payload[:tos_reason].upcase.to_sym,
      countries: payload[:dsa_countries],
      account_moderation:,
      content_moderation:,
      is_test:
    )
  end

  subscribe("repository.disabled_dsa") do |payload|
    is_test = test_event?(payload[:actor], payload[:repository].owner)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    source = payload[:source]&.to_sym
    tos_reason = payload[:tos_reason]&.to_sym

    content_moderation = {
      global_relay_id: serialized_repository[:global_relay_id],
      content_type: "repository",
      content: "#{GitHub.url}/#{payload[:repository].name_with_display_owner}",
      content_created_at: serialized_repository[:created_at],
      content_updated_at: serialized_repository[:updated_at],
      moderation_types: [:DISABLED],
      formats: payload[:content_formats]&.map(&:to_sym) || [:TEXT, :IMAGE]
    }

    publish_moderation_action(
      "repository.disabled",
      serialized_actor,
      source,
      content_moderation:,
      is_test:,
      tos_reason: payload[:tos_reason]&.to_sym
    )
  end

  subscribe("repository.disabled") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      disabled_at: payload[:disabled_at].try(:to_i),
      reason: payload[:reason].upcase.to_sym,
      details: payload[:details],
      dmca_takedown_url: payload[:dmca_takedown_url],
    }

    publish(message, schema: "github.v1.RepositoryDisabled")
  end

  subscribe("repository.country_blocked") do |payload|
    is_test = test_event?(payload[:actor], payload[:repository].owner)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    countries = payload[:country_codes]
    source = payload[:source]&.to_sym

    content_moderation = {
      global_relay_id: serialized_repository[:global_relay_id],
      content_type: "repository",
      content: "#{GitHub.url}/#{payload[:repository].name_with_display_owner}",
      content_created_at: serialized_repository[:created_at],
      content_updated_at: serialized_repository[:updated_at],
      moderation_types: [:DISABLED],
      formats: payload[:content_formats]&.map(&:to_sym)
    }

    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      blocked_at: payload[:blocked_at].try(:to_i),
      type: payload[:type].upcase.to_sym,
      country_codes: payload[:country_codes],
      country_names: payload[:country_names],
      details: payload[:details],
      public_block_notice_url: payload[:public_block_notice_url],
    }

    publish(message, schema: "github.v1.RepositoryCountryBlocked")
    publish_moderation_action(
      "repository.country_blocked",
      serialized_actor,
      source,
      countries:,
      content_moderation:,
      is_test:,
      tos_reason: payload[:tos_reason]&.to_sym
    )
  end

  subscribe("repository.visibility_downgraded") do |payload|
    is_test = test_event?(payload[:actor], payload[:repository].owner)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(payload[:repository])
    tos_reason = :SCOPE_OF_PLATFORM_SERVICES
    source = :USER_REPORT

    content_moderation = {
      global_relay_id: serialized_repository[:global_relay_id],
      content_type: "repository",
      content: "#{GitHub.url}/#{payload[:repository].name_with_display_owner}",
      content_created_at: serialized_repository[:created_at],
      content_updated_at: serialized_repository[:updated_at],
      moderation_types: [:DEMOTED, :INTERACTION_RESTRICTED],
      formats: [:TEXT, :IMAGE]
    }

    publish_moderation_action("repository.visibility_downgraded", serialized_actor, source, content_moderation:, is_test:, tos_reason:)
  end

  subscribe("staff.delete_gist") do |payload|
    is_test = test_event?(payload[:actor], payload[:gist].owner)
    serialized_actor = serializer.user(payload[:actor])
    serialized_gist = serializer.gist(payload[:gist])
    source = payload[:source]&.to_sym

    content_moderation = {
      global_relay_id: serialized_gist[:global_relay_id],
      content_type: "gist",
      content: payload[:gist].url,
      content_created_at: serialized_gist[:created_at],
      content_updated_at: payload[:gist].updated_at,
      moderation_types: [:REMOVED],
      formats: payload[:content_formats]&.map(&:to_sym)
    }

    publish_moderation_action(
      "staff.delete_gist",
      serialized_actor,
      source,
      content_moderation:,
      is_test:,
      tos_reason: payload[:tos_reason]&.to_sym
    )
  end

  subscribe("comment.toggle_minimize") do |payload|
    serialized_actor = serializer.user(payload[:actor])
    actor_was_staff = payload[:actor_was_staff]

    message = {
      actor: serialized_actor,
      actor_was_staff: actor_was_staff,
      event_type: serializer.enum_from_string(payload[:event_type]),
      reason: payload[:reason],
      comment_id: payload[:comment_id],
      comment_type: serializer.enum_from_string(payload[:comment_type]),
      classifier: serializer.enum_from_string(payload[:classifier]),
      user: serializer.user(payload[:user]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.CommentToggleMinimize", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    if actor_was_staff && payload[:event_type] == "minimize"
      tos_reason = :SCOPE_OF_PLATFORM_SERVICES
      source = :USER_REPORT

      is_test = test_event?(payload[:actor], payload[:user])

      content_moderation = {
        global_relay_id: payload[:comment].global_relay_id,
        content_type: payload[:comment_type].to_s.underscore,
        content: payload[:comment].body,
        content_created_at: payload[:comment].created_at,
        moderation_types: [:DISABLED, :INTERACTION_RESTRICTED],
        formats: [:TEXT]
      }

      publish_moderation_action("comment.toggle_minimize", serialized_actor, source, content_moderation:, is_test:, tos_reason:)
    end
  end

  # Publishes to the ModerationAction topic, messages are used to build statement of reasons for DSA compliance.
  def publish_moderation_action(
      action,
      serialized_actor,
      source,
      countries: nil,
      account_moderation: nil,
      content_moderation: nil,
      service_moderation: nil,
      sponsors_moderation: nil,
      is_test: false,
      tos_reason: nil,
      reason: nil
    )
    T.bind(self, Hydro::EventForwarder)

    message = {
      account_moderation:,
      action:,
      actor: serialized_actor,
      content_moderation:,
      countries:,
      is_test:,
      reason:,
      service_moderation:,
      source:,
      sponsors_moderation:,
      tos_reason:,
    }

    publish(message, schema: "github.moderation.v0.ModerationAction")
  end

  # Was this event produced by a Hubber testing a moderation action feature on their own test account?
  def test_event?(actor, user)
    return false if actor.nil? || user.nil?

    user_email = user.is_a?(Business) || user.is_a?(Organization) ? user.billing_email : user.email
    parsed_user_email = user_email.split("+").first + "@" + user_email.split("@").last

    actor.emails.any? { |e| e.email == parsed_user_email }
  end
end
