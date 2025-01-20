# frozen_string_literal: true

# These are Hydro event subscriptions related to user Profile.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("profile.update") do |payload|
    current_profile = payload[:current_profile]
    previous_profile = payload[:previous_profile]

    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_actor = serializer.user(payload[:actor])
    serialized_current_profile = serializer.profile(current_profile)
    serialized_previous_social_accounts = previous_profile.social_accounts.map do |account|
      serializer.social_account(account)
    end
    serialized_current_social_accounts = current_profile.social_accounts.map do |account|
      serializer.social_account(account)
    end

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      previous_profile: serializer.profile(previous_profile),
      current_profile: serialized_current_profile,
      spamurai_form_signals: serialized_spamurai_form_signals,
      changed_attribute_names: payload[:changed_attribute_names],
      previous_social_accounts: serialized_previous_social_accounts,
      current_social_accounts: serialized_current_social_accounts,
    }.merge(serializer.profile_specimen_data_fields(current_profile))

    publish(message, schema: "github.v1.ProfileUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    if current_profile.bio != previous_profile.bio
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: :UPDATE,
        content_type: :PROFILE_BIO,
        actor: serialized_actor,
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProfileUpdate"),
        content_database_id: serialized_current_profile[:id],
        content_global_relay_id: current_profile.global_relay_id,
        content_created_at: serialized_current_profile[:created_at],
        content_updated_at: serialized_current_profile[:updated_at],
        title: serializer.specimen_data(current_profile.name),
        content: serializer.specimen_data(current_profile.bio),
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_actor,
        repository: nil,
        content_visibility: :PUBLIC,
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end


    if current_profile.pronouns != previous_profile.pronouns
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: :UPDATE,
        content_type: :PRONOUN,
        actor: serialized_actor,
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.ProfileUpdate"),
        content_database_id: serialized_current_profile[:id],
        content_global_relay_id: current_profile.global_relay_id,
        content_created_at: serialized_current_profile[:created_at],
        content_updated_at: serialized_current_profile[:updated_at],
        title: serializer.specimen_data(current_profile.name),
        content: serializer.specimen_data(current_profile.pronouns),
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_actor,
        repository: nil,
        content_visibility: :PUBLIC,
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end

    payload.fetch(:created_social_accounts, []).each do |account|
      creation_message = {
        request_context: serialized_request_context,
        actor: serialized_actor,
        spamurai_form_signals: serialized_spamurai_form_signals,
        social_account: serializer.social_account(account),
      }

      publish(creation_message, schema: "github.v1.SocialAccountCreate")
    end

    payload.fetch(:destroyed_social_accounts, []).each do |account|
      destruction_message = {
        request_context: serialized_request_context,
        actor: serialized_actor,
        social_account: serializer.social_account(account),
      }

      publish(destruction_message, schema: "github.v1.SocialAccountDestroy")
    end
  end

  subscribe("profile_picture.update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      avatar: serializer.avatar(payload[:avatar]),
    }

    publish(message, schema: "github.v1.PrimaryAvatarUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("profile_activity_tab.visibility_changed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      visibility: payload[:visibility].upcase.to_sym,
    }

    publish(message, schema: "github.v1.ProfileActivityTabVisibilityChange")
  end

  subscribe("profile_activity_event.visibility_changed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      visibility: payload[:visibility].upcase.to_sym,
      event_id: payload[:event_id],
    }

    publish(message, schema: "github.feeds.v0.ProfileActivityEventVisibilityChange")
  end
end
