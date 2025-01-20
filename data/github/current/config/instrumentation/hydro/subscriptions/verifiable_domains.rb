# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to verifiable domains and notification restrictions.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("verifiable_domains.domain_created") do |payload|
    message = {
      event_type: :CREATE,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainLifecycle", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.domain_approved") do |payload|
    message = {
      event_type: :APPROVED,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.domain_deleted") do |payload|
    message = {
      event_type: :DELETE,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainLifecycle", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.domain_unverified") do |payload|
    message = {
      event_type: :UNVERIFIED,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.domain_verified") do |payload|
    message = {
      event_type: :VERIFIED,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
      profile_domain_verified: payload[:profile_domain_verified]
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.domain_verify_attempt") do |payload|
    verification_result = case payload[:error]
    when nil
      :SUCCESS
    when :already_verified
      :ALREADY_VERIFIED
    when :rate_limited
      :RATE_LIMITED
    when :dns_record_not_found
      :DNS_RECORD_NOT_FOUND
    when :dns_resolve_error
      :DNS_RESOLVE_ERROR
    when :dns_error
      :DNS_ERROR
    else
      nil
    end

    message = {
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor]),
      result: verification_result,
      staff_action: payload[:staff_action]
    }

    publish(message, schema: "github.verifiable_domains.v1.DomainVerifyAttempt", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.notification_restrictions_disabled") do |payload|
    message = {
      status_type: :DISABLED,
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor])
    }

    publish(message, schema: "github.verifiable_domains.v1.NotificationRestrictionsChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.notification_restrictions_enabled") do |payload|
    message = {
      status_type: :ENABLED,
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      domains: payload[:domains].map(&:domain),
      actor: serializer.user(payload[:actor]),
      affected_users_count: payload[:affected_users_count]
    }

    publish(message, schema: "github.verifiable_domains.v1.NotificationRestrictionsChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("verifiable_domains.organization_profile_domain_verified") do |payload|
    domain_types = payload[:domain_types].map do |domain_type|
      case domain_type
      when :email
        :EMAIL
      when :website
        :WEBSITE
      end
    end
    message = {
      organization: serializer.organization(payload[:org]),
      organization_verified: payload[:verified],
      profile_domain_types: domain_types,
      domain: serializer.verifiable_domain(payload[:domain]),
      actor: serializer.user(payload[:actor])
    }

    publish(message, schema: "github.verifiable_domains.v0.OrganizationProfileDomainVerified", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
