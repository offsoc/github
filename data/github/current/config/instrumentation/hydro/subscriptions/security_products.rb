# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("security_products.organization_advanced_security_license_toggled_per_repository") do |payload|
    message = {
      repository_id: payload[:repository_id],
      organization_advanced_security_license_toggled: payload[:original_message].to_h
    }

    # Using the repo id as partition key can ensure that events for a given repo are processed in order
    # Note that when using aqueduct bridge partition key is not respected, and events are not processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(
      message,
      partition_key: partition_key,
      schema: "github.security_center.v0.OrganizationAdvancedSecurityLicenseToggledPerRepository",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("security_products.organization_advanced_security_license_toggled") do |payload|
    message = {
      organization_id: payload[:organization_id],
      enabled: payload[:enabled],
      license_toggled_for_org_at: payload[:license_toggled_for_org_at],
    }

    # Using the org id as partition key can ensure that events for a given org are processed in order
    # Note that when using aqueduct bridge partition key is not respected, and events are not processed in order
    partition_key = payload[:organization_id]

    Hydro::PublishRetrier.publish(
      message,
      partition_key: partition_key,
      schema: "github.security_center.v0.OrganizationAdvancedSecurityLicenseToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("security_products.enterprise_advanced_security_license_toggled") do |payload|
    message = {
      business_id: payload[:business_id],
      enabled: payload[:enabled],
      license_toggled_at: payload[:license_toggled_at],
    }

    # Using the business id as partition key can ensure that events for a given business are processed in order
    # Note that when using aqueduct bridge partition key is not respected, and events are not processed in order
    partition_key = payload[:business_id]

    Hydro::PublishRetrier.publish(
      message,
      partition_key: partition_key,
      schema: "github.security_center.v0.EnterpriseAdvancedSecurityLicenseToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
