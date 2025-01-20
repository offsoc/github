# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to organizations.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.organization.invite.click") do |payload|
    organization = Organization.find_by(id: payload[:organization_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      organization: serializer.organization(organization),
      event_context: payload[:event_type],
      invitee: payload[:invitee],
    }

    publish(message, schema: "github.v1.OrganizationInviteClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.organization.new.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
      overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:target],
    }

    publish(message, schema: "github.v1.OrganizationNewClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      number_of_organizations_adminable_by_actor: payload[:number_of_organizations_adminable_by_actor],
      first_organization_adminable_by_actor: serializer.organization(payload[:first_organization_adminable_by_actor]),
      actor_email: serializer.user_email(payload[:actor_email]),
      actor_profile: serializer.profile(payload[:actor_profile]),
      visitor_id: payload[:visitor_id],
    }

    publish(message, schema: "github.v1.OrganizationCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.cancel_invitation") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      email: payload[:email],
      user: serializer.user(payload[:user]),
      invitation: serializer.invitation(payload[:invitation]),
      organization_profile: serializer.profile(payload[:organization].profile)
    }

    publish(message, schema: "github.v1.OrganizationCancelInvitation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.invite_member") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      email: payload[:email],
      user: serializer.user(payload[:user]),
      invitation: serializer.invitation(payload[:invitation]),
      organization_profile: serializer.profile(payload[:organization].profile)
    }

    publish(message, schema: "github.v1.OrganizationInviteMember", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.retry_invitation") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      email: payload[:email],
      user: serializer.user(payload[:user]),
      invitation: serializer.invitation(payload[:invitation]),
      organization_profile: serializer.profile(payload[:organization].profile)
    }

    publish(message, schema: "github.v1.OrganizationRetryInvitation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.enterprise_owners_view") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
      enterprise: serializer.business(payload[:enterprise]),
      actor: serializer.user(actor = payload[:actor]),
    }

    publish(
      message,
      schema: "github.v1.OrganizationEnterpriseOwnersView",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("organization.bulk.invite") do |payload|
    message = {
     actor: serializer.user(payload[:actor]),
     organization: serializer.organization(payload[:organization]),
     successful_user_invites: payload[:successful_user_invites],
     successful_email_invites: payload[:successful_email_invites],
     failed_user_invites: payload[:failed_user_invites],
     failed_email_invites: payload[:failed_email_invites],
   }

    publish(message, schema: "github.v1.OrganizationBulkInvite", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("organization.toggle_source_ip_disclosure") do |payload|
    message = {
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      state: payload[:state]
    }

    publish(
      message,
      schema: "github.v1.OrganizationToggleSourceIpDisclosure",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("organization.soft_delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      organization: serializer.organization(payload[:organization]),
      billing_email: payload[:email]
    }

    publish(
      message,
      schema: "github.v1.OrganizationSoftDelete",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end

  subscribe("organization.restore") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      organization: serializer.organization(payload[:organization]),
      customer_id: payload[:customer_id]
    }

    publish(
      message,
      schema: "github.v1.OrganizationRestore",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      }
    )
  end
end
