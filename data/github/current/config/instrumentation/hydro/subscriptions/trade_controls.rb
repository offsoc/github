# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("trade_restriction.flag") do |payload|
    reasons = { ip: "IP_ADDRESS", email: "EMAIL" }
    message = {
      account: serializer.user(payload[:user]),
      reason: reasons[payload[:reason]],
      country: payload[:country],
      region: payload[:region],
      ip_address: payload[:ip],
      email_address: payload[:email],
      restricted_on_creation: payload[:restricted_on_creation],
      last_enforcement_date: payload[:last_enforcement_date],
      last_override_date: payload[:last_override_date],
    }

    publish(message, schema: "github.trade_restrictions.v0.TradeRestrictionFlag", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("trade_restriction.unflag") do |payload|
    message = {
      account: serializer.user(payload[:user]),
      actor: serializer.user(payload[:actor]),
      reason: payload[:reason],
      restricted_on_creation: payload[:restricted_on_creation],
      last_enforcement_date: payload[:last_enforcement_date],
      last_override_date: payload[:last_override_date],
    }

    publish(message, schema: "github.trade_restrictions.v0.TradeRestrictionUnflag", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("trade_restriction.organization_enforce") do |payload|
    message = {
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      restriction_reason: payload[:restriction_reason],
      organization_member_count: payload[:organization_member_count],
      organization_public_repos_count: payload[:organization_public_repos_count],
      organization_private_repos_count: payload[:organization_private_repos_count],
      organization_trade_restricted_member_count:  payload[:organization_trade_restricted_member_count],
      organization_time_since_creation_in_days: payload[:organization_time_since_creation_in_days],
      organization_total_paid_amount_in_cents: payload[:organization_total_paid_amount_in_cents],
      email_address: payload[:email_address],
      percentage_of_trade_restricted_admins: payload[:percentage_of_trade_restricted_admins],
      website_url: payload[:website_url],
      location: payload[:location],
      percentage_of_trade_restricted_billing_managers: payload[:percentage_of_trade_restricted_billing_managers],
      percentage_of_trade_restricted_members: payload[:percentage_of_trade_restricted_members],
      restricted_on_creation: payload[:restricted_on_creation],
      last_enforcement_date: payload[:last_enforcement_date],
      last_override_date: payload[:last_override_date],
    }

    publish(message, schema: "github.trade_restrictions.v0.TradeRestrictionOrganizationEnforce", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sdn_trade_screening.result_available") do |payload|
    message = {
      country: payload[:country],
      external_user_id: payload[:external_user_id],
      request_id: payload[:request_id],
      request_type: payload[:request_type],
      status: payload[:status],
      actor_type: payload[:actor_type],
    }

    publish(message, schema: "github.trade_screening.v0.TradeScreeningResult")
  end

  subscribe("sdn_llama2.request_made") do |message|
    publish(message, schema: "github.trade_screening.v0.Llama2Request")
  end

  subscribe("sdn_eis_bus.messages_received") do |message|
    publish(message, schema: "github.trade_screening.v0.EisResponse")
  end
end
