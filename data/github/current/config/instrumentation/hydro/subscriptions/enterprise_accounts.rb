# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to enterprise accounts.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("enterprise_account.profile_view") do |payload|
    enterprise = payload[:enterprise]
    actor = payload[:actor]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      enterprise: serializer.business(enterprise),
      actor: serializer.user(actor),
      actor_is_owner: enterprise&.owner?(actor),
      actor_is_billing_manager: enterprise&.billing_manager?(actor),
      actor_is_organization_member: enterprise&.user_is_member_of_owned_org?(actor),
    }

    publish(message, schema: "github.enterprise_account.v0.ProfileView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.enterprise_account.profile_organization_click") do |payload|
    enterprise = Business.find_by id: payload[:enterprise_id]
    organization = Organization.find_by id: payload[:organization_id]
    actor = User.find_by id: payload[:actor_id]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      enterprise: serializer.business(enterprise),
      organization: serializer.organization(organization),
      actor: serializer.user(actor),
      actor_is_owner: enterprise&.owner?(actor),
      actor_is_billing_manager: enterprise&.billing_manager?(actor),
      actor_is_organization_member: enterprise&.user_is_member_of_owned_org?(actor),
    }

    publish(message, schema: "github.enterprise_account.v0.ProfileOrganizationClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("enterprise_account.admin_reinvited") do |payload|
    message = {
      old_invitation: serializer.enterprise_admin_invitation(payload[:old_invitation]),
      new_invitation: serializer.enterprise_admin_invitation(payload[:new_invitation]),
      times_reinvited: payload[:times_reinvited],
    }

    publish(message, schema: "github.enterprise_account.v0.AdminReinvited", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("enterprise_account.organization_add") do |payload|
    organization = Organization.find_by id: payload[:organization_id]
    enterprise = Business.find_by id: payload[:enterprise_id]
    actor = User.find_by id: payload[:actor_id]
    new_organization = payload[:new_organization]
    previous_plan = payload[:previous_plan]

    message = {
      organization: serializer.organization(organization),
      enterprise: serializer.business(enterprise),
      actor: serializer.user(actor),
      new_organization: new_organization,
      enterprise_trial: T.must(enterprise).trial?,
      previous_plan: previous_plan
    }

    publish(message, schema: "github.enterprise_account.v0.OrganizationAdd", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("enterprise_account.organization_add_per_repository") do |payload|
    seconds, nanos = payload.dig(:organization_add_envelope, :timestamp).values
    original_event_timestamp = Google::Protobuf::Timestamp.new(seconds: seconds, nanos: nanos)

    message = {
      repository_id: payload[:repository_id],
      organization_add: payload[:organization_add]&.to_h,
      organization_add_envelope: {
        timestamp: original_event_timestamp
      }
    }

    publish \
      message,
      schema: "github.enterprise_account.v0.OrganizationAddPerRepository",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
  end

  subscribe("enterprise_account.organization_remove") do |payload|
    organization = Organization.find_by id: payload[:organization_id]
    enterprise = Business.including_deleted.find_by id: payload[:enterprise_id]
    actor = User.find_by id: payload[:actor_id]

    message = {
      organization: serializer.organization(organization),
      enterprise: serializer.business(enterprise),
      actor: serializer.user(actor),
      enterprise_trial: T.must(enterprise).trial?,
      new_plan: T.must(organization).plan.name
    }

    publish(message, schema: "github.enterprise_account.v0.OrganizationRemove", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("enterprise_account.organization_remove_per_repository") do |payload|
    seconds, nanos = payload.dig(:organization_remove_envelope, :timestamp).values
    original_event_timestamp = Google::Protobuf::Timestamp.new(seconds: seconds, nanos: nanos)

    message = {
      repository_id: payload[:repository_id],
      organization_remove: payload[:organization_remove]&.to_h,
      organization_remove_envelope: {
        timestamp: original_event_timestamp
      }
    }

    publish \
      message,
      schema: "github.enterprise_account.v0.OrganizationRemovePerRepository",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
  end

  subscribe("enterprise_account.organization_transfer") do |payload|
    organization = Organization.find_by id: payload[:organization_id]
    source_enterprise = Business.find_by id: payload[:source_enterprise_id]
    destination_enterprise = Business.find_by id: payload[:destination_enterprise_id]
    actor = User.find_by id: payload[:actor_id]
    site_admin_transfer = payload[:site_admin_transfer]

    message = {
      organization: serializer.organization(organization),
      source_enterprise: serializer.business(source_enterprise),
      destination_enterprise: serializer.business(destination_enterprise),
      actor: serializer.user(actor),
      completed_at: payload[:completed_at],
      failed_at: payload[:failed_at],
      failed_reason: payload[:failed_reason],
      site_admin_transfer: site_admin_transfer,
    }

    publish \
      message,
      schema: "github.enterprise_account.v0.OrganizationTransfer",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
  end

  subscribe("enterprise_account.organization_transfer_per_repository") do |payload|
    message = {
      repository_id: payload[:repository_id],
      organization_transfer: payload[:organization_transfer]&.to_h,
    }

    publish \
      message,
      schema: "github.enterprise_account.v0.OrganizationTransferPerRepository",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
  end

  subscribe("enterprise_account.organization_upgrade") do |payload|
    organization = Organization.find_by id: payload[:organization_id]
    enterprise = Business.find_by id: payload[:enterprise_id]
    actor = User.find_by id: payload[:actor_id]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(organization),
      enterprise: serializer.business(enterprise),
      actor: serializer.user(actor),
      organization_previous_plan: payload[:organization_previous_plan],
      organization_previous_customer_id: payload[:organization_previous_customer_id],
      billing_type: payload[:billing_type],
      status: payload[:status],
      marketplace_subscription: payload[:marketplace_subscription],
      coupon_transfer_attempted: payload[:coupon_transfer_attempted],
      coupon_transfer_succeeded: payload[:coupon_transfer_succeeded],
      coupon_code: payload[:coupon_code],
    }

    publish(message, schema: "github.enterprise_account.v0.OrganizationUpgrade", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("enterprise_account.organization_upgrade_failure") do |payload|
    organization = Organization.find_by id: payload[:organization_id]
    actor = User.find_by id: payload[:actor_id]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(organization),
      actor: serializer.user(actor),
      organization_plan: payload[:organization_plan],
      billing_type: payload[:billing_type],
      has_active_coupon: payload[:has_active_coupon],
      coupon_code: payload[:coupon_code],
      error_message: payload[:error_message],
      slug: payload[:slug],
    }

    publish(message, schema: "github.enterprise_account.v0.OrganizationUpgradeFailure", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("enterprise_account.creation_from_coupon_redemption") do |payload|
    enterprise = Business.find_by(id: payload[:enterprise_id])
    organization = Organization.find_by id: payload[:organization_id]
    actor = User.find_by id: payload[:actor_id]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(organization),
      enterprise: serializer.business(enterprise),
      slug: payload[:slug],
      actor: serializer.user(actor),
      status: payload[:status],
      organization_previous_plan: payload[:organization_previous_plan],
      coupon: payload[:coupon],
    }

    publish(message, schema: "github.enterprise_account.v0.CreationFromCouponRedemption", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("enterprise_account.organization_upgrade_per_repository") do |payload|
    seconds, nanos = payload.dig(:organization_upgrade_envelope, :timestamp).values
    original_event_timestamp = Google::Protobuf::Timestamp.new(seconds: seconds, nanos: nanos)

    message = {
      repository_id: payload[:repository_id],
      organization_upgrade: payload[:organization_upgrade]&.to_h,
      organization_upgrade_envelope: {
        timestamp: original_event_timestamp
      }
    }

    publish \
      message,
      schema: "github.enterprise_account.v0.OrganizationUpgradePerRepository",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
  end


  subscribe("enterprise_account.owner_role_change_in_organization") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      role_changed_to: payload[:role_changed_to]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.OwnerRoleChangeInOrganization",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.remove_member") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      actor: serializer.user(payload[:actor]),
      user: serializer.user(payload[:user]),
      reason: payload[:reason]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.EnterpriseRemoveMember",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.remove_admin") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      actor: serializer.user(payload[:actor]),
      user: serializer.user(payload[:user]),
      role: payload[:role].to_s,
      reason: payload[:reason],
      new_role: payload[:new_role].to_s
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.EnterpriseRemoveAdmin",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.rename_slug") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      slug_was: payload[:slug_was],
      slug: payload[:slug]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.EnterpriseRenameSlug",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.toggle_source_ip_disclosure") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      actor: serializer.user(payload[:actor]),
      state: payload[:state]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.ToggleSourceIpDisclosure",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.trial") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      actor: serializer.user(payload[:actor]),
      user_initiated: payload[:user_initiated],
      status: payload[:status],
      expiration_timestamp: payload[:expiration_timestamp],
      upgraded_organization: serializer.organization(payload[:upgraded_organization]),
      metered: payload[:metered],
      emu: payload[:emu],
      context: payload[:context]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.Trial",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.salesforce_trial_update") do |payload|
    return unless GitHub.flipper[:salesforce_trial_event].enabled?(payload[:actor])

    business = payload[:enterprise]
    return unless business

    zuora_account_id = business&.customer&.zuora_account_id
    zuora_account_number = business&.customer&.zuora_account_number
    billing_information = serializer.business_billing_information(business)
    shipping_information = serializer.business_shipping_information(business)

    message = {
      enterprise: serializer.business(business),
      actor: serializer.user(payload[:actor]),
      user_initiated: payload[:user_initiated],
      status: payload[:status],
      expiration_timestamp: payload[:expiration_timestamp],
      upgraded_organization: serializer.organization(payload[:upgraded_organization]),
      metered: payload[:metered],
      emu: payload[:emu],
      enterprise_name: business.name,
      billing_email: business.billing_email,

      # not available until billing information is added
      **(billing_information ? { billing_information: billing_information } : {}),
      **(zuora_account_id.present? ? { zuora_account_id: zuora_account_id } : {}),
      **(zuora_account_number.present? ? { zuora_account_number: zuora_account_number } : {}),

      # not available until shipping information is added
      **(shipping_information ? { shipping_information: shipping_information } : {}),

      # the following fields are only available during :CREATED event:
      **(payload[:billing_full_name].present? ? { billing_full_name: payload[:billing_full_name] } : {}),
      **(!payload[:marketing_consent].nil? ? { marketing_consent: payload[:marketing_consent].to_s } : {}),

      # the following fields are only available during :UPGRADED event:
      **(payload[:talk_to_sales].present? ? { talk_to_sales: payload[:talk_to_sales] } : {}),
      **(payload[:payment_method].present? ? { payment_method: payload[:payment_method] } : {}),
    }

    Hydro::PublishRetrier.publish(
      message,
      schema: "github.enterprise_account.v0.SalesforceTrialUpdate",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.report_export") do |payload|
    message = {
      enterprise: serializer.business(payload[:enterprise]),
      enterprise_size: payload[:enterprise_size],
      actor: serializer.user(payload[:actor]),
      report_name: payload[:report_name],
      notification_sent: payload[:notification_sent]
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.EnterpriseReportExport",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("enterprise_account.expired_trial_deletion") do |payload|
    enterprise = Business.including_deleted.find_by(id: payload[:enterprise_id])

    message = {
      enterprise: serializer.business(enterprise),
      trial_deletion_date: payload[:trial_deletion_date],
      days_to_deletion: payload[:days_to_deletion],
      action_taken: payload[:action_taken],
    }

    publish(
      message,
      schema: "github.enterprise_account.v0.ExpiredTrialDeletion",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end
end
