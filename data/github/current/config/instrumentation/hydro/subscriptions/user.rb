# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("user.change_new_repository_default_branch_setting") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      old_default_branch: payload[:old_default_branch],
      new_default_branch: payload[:new_default_branch],
      enforced: payload[:enforced],
    }

    business = payload[:business]
    if business
      message[:business] = serializer.business(business)
    else
      message[:repository_owner] = serializer.repository_owner(payload[:repository_owner])
    end

    publish(message.freeze, schema: "github.users.v1.ChangeNewRepositoryDefaultBranchSetting", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.change_status") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      emoji: payload[:emoji],
      message: payload[:message],
      new_status: serializer.user_status(payload[:user_status]),
    }

    publish(message, schema: "github.v1.UserStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.signup") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      email: serializer.user_email(payload[:signup_email]),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      funcaptcha_session_id: GitHub.context[:funcaptcha_session_id],
      funcaptcha_solved: GitHub.context[:funcaptcha_solved],
      funcaptcha_response: serializer.funcaptcha_response(GitHub.context[:funcaptcha_response]),
      elected_to_receive_marketing_email: payload[:elected_to_receive_marketing_email],
      visitor_id: GitHub.context[:visitor_id].to_s,
    }

    if GitHub.flipper[:octocaptcha_arkose_V4_api_migration].enabled? && GitHub.context[:funcaptcha_response].present?
      arkose_captcha_response_v4 = serializer.arkose_captcha_response_v4(GitHub.context[:funcaptcha_response])
      if arkose_captcha_response_v4.present?
        message[:arkose_captcha_response_v4] = arkose_captcha_response_v4
      end

      funcaptcha_response = GitHub.context[:funcaptcha_response]
      if funcaptcha_data_exchange = GitHub.context[:funcaptcha_data_exchange].presence
        funcaptcha_response[:decoded_data_exchange] = funcaptcha_data_exchange
      end
      message[:raw_arkose_captcha_response_v4] = funcaptcha_response.to_json
    end

    publish(message, schema: "github.v1.UserSignup", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.successful_login") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      return_to: payload[:return_to],
      known_device: payload[:authentication_record]&.known_device?,
      known_location: payload[:authentication_record]&.known_location?,
      email: serializer.user_email(payload[:primary_email]),
      elected_to_receive_marketing_email: payload[:elected_to_receive_marketing_email],
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      visitor_id: GitHub.context[:visitor_id].to_s,
      passwordless: payload[:passwordless],
    }

    publish(message, schema: "github.v1.SuccessfulLogin", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.failed_login") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      passwordless: payload[:passwordless],
    }

    publish(message, schema: "github.v1.FailedLogin", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.logout") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      known_device: payload[:known_device],
      known_location: payload[:known_location],
      email: serializer.user_email(payload[:actor].primary_user_email),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.v1.UserLogout", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.user_country_change") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      previous_country_code: payload[:previous_location][:country_code],
      previous_country_name: payload[:previous_location][:country_name],
      previous_region: payload[:previous_location][:region],
      previous_region_name: payload[:previous_location][:region_name],
      previous_city: payload[:previous_location][:city],
      anomalous_session: payload[:anomalous_session],
    }

    publish(message, schema: "github.v1.UserCountryChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.destroy") do |payload|
    deleted_user = payload[:user]
    deleted_user_next_global_id = deleted_user&.global_relay_id
    unless GitHub.enterprise?
      begin
        deleted_user_next_global_id = deleted_user&.next_global_id
      rescue ArgumentError
        deleted_user_next_global_id = ""
      end
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user], overrides: { next_global_id: deleted_user_next_global_id }),
      actor: serializer.user(payload[:actor]),
      delete_type: payload[:delete_type] || :UNKNOWN,
      actor_was_staff: payload[:actor_was_staff],
      email: serializer.user_email(payload[:email]),
      organization_customer_id: Licensing::Customer.id_for(payload[:user])
    }

    publish(message, schema: "github.v1.UserDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.add_email") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      actor: serializer.user(payload[:actor]),
      primary_email: serializer.user_email(payload[:primary_email]),
      added_email: serializer.user_email(payload[:added_email]),
    }

    publish(message, schema: "github.v1.UserAddEmail", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.remove_email") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      actor: serializer.user(payload[:actor]),
      primary_email: serializer.user_email(payload[:primary_email]),
      removed_email: serializer.user_email(payload[:removed_email]),
    }

    publish(message, schema: "github.v1.UserRemoveEmail", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.follow") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      followee: serializer.user(payload[:followee]),
      actor: serializer.user(payload[:actor]),
      followed_at: payload[:followed_at],
    }

    publish(message, schema: "github.v1.UserFollow", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.unfollow") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      followee: serializer.user(payload[:followee]),
      followee_id: payload[:followee_id],
      actor: serializer.user(payload[:actor]),
      unfollowed_at: payload[:unfollowed_at],
    }

    publish(message, schema: "github.v1.UserUnfollow", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.last_ip_update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      previous_ip: serializer.ip_address(payload[:previous_ip]),
      current_ip: serializer.ip_address(payload[:current_ip]),
      previous_location: serializer.actor_location(payload[:previous_location]),
      current_location: serializer.actor_location(payload[:current_location]),
      user_ids_for_device: payload[:user_ids_for_device],
      user_logins_for_device: payload[:user_logins_for_device],
      previous_device_id: payload[:previous_device_id],
      updated_at: payload[:updated_at],
    }

    publish(message, schema: "github.v1.UserIPAddressUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/(user|organization)\.profile_readme_action/) do |payload|
    change_type = case payload[:change_type]
    when Repositories::Push::ChangedFile::ADDITION
      "CREATE"
    when Repositories::Push::ChangedFile::DELETION
      "DELETE"
    when Repositories::Push::ChangedFile::MODIFYING, Repositories::Push::ChangedFile::RENAMING
      "UPDATE"
    else
      payload[:change_type]
    end

    readme_body = if payload[:repository]&.public?
      serializer.specimen_data(payload[:readme_body])
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(payload[:repository]),
      owner: serializer.user(payload[:owner]),
      actor: serializer.user(payload[:actor]),
      change_type: change_type,
      readme_body: readme_body,
      occurred_at: Time.zone.now,
    }

    publish(message, schema: "github.v1.ProfileReadmeAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.email_link_click") do |payload|
    message = {
      email_source: payload[:email_source],
      user: serializer.user(payload[:user]),
      auto_subscribed: payload[:auto_subscribed],
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.v1.EmailLinkClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.password_reset_create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      account: serializer.user(payload[:account]),
      error_type: payload[:error_type],
      email_address: payload[:email_address],
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.v1.PasswordResetCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.password_update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      account: serializer.user(payload[:account]),
      update_type: payload[:update_type],
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.v1.PasswordUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.reminders.integration_error") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      error: payload[:error],
      organization: serializer.organization(payload[:organization]),
    }

    publish(message, schema: "github.v1.ReminderIntegrationError", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.change_color_mode") do |payload|
    new_mode = ColorMode.from_db_value(payload[:color_mode])
    old_mode = ColorMode.from_db_value(payload[:color_mode_previous])

    message = {
      user_id: payload[:user].id,
      color_mode: new_mode.hydro_mapping,
      color_mode_previous: old_mode.hydro_mapping,
      source: payload[:source],
    }

    publish(message, schema: "github.v1.ChangeColorMode", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.color_mode_promo_click") do |payload|
    publish({ user_id: payload[:user_id] }, schema: "github.v1.ColorModePromoClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.color_mode_profile_promo_click") do |payload|
    publish({ user_id: payload[:user_id] }, schema: "github.v1.ColorModeProfilePromoClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.change_user_theme") do |payload|
    message = {
      user_id: payload[:user].id,
      theme_type: payload[:theme_type],
      user_theme: payload[:user_theme],
      user_theme_previous: payload[:user_theme_previous],
      source: payload[:source],
    }

    publish(message, schema: "github.v1.ChangeUserTheme", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("user.migration_start") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
    }

    publish(message, schema: "github.v1.AccountDataExport")
  end

  subscribe("browser.settings_context_dropdown.click") do |payload|
    user = User.find_by(id: payload[:user_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(user),
      event_context: payload[:event_context],
      target: payload[:target],
      target_name: payload[:target_name],
      target_id: payload[:target_id],
      target_link: payload[:target_link]
    }

    publish(message, schema: "github.v1.SettingsContextDropdown", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
