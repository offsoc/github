# frozen_string_literal: true

# Hydro event subscriptions for custom organization roles.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("custom_organization_roles.role_created") do |payload|
    message = {
      role: serializer.custom_organization_role(payload[:role]),
      org_custom_org_roles_count: payload[:org_custom_org_roles_count]
    }

    publish(message, schema: "github.custom_organization_roles.v0.CustomOrganizationRoleCreated")
  end

  subscribe("custom_organization_roles.role_deleted") do |payload|
    message = {
      role: serializer.custom_organization_role(payload[:role]),
      org_custom_org_roles_count: payload[:org_custom_org_roles_count]
    }

    publish(message, schema: "github.custom_organization_roles.v0.CustomOrganizationRoleDeleted")
  end

  subscribe("custom_organization_roles.role_updated") do |payload|
    message = {
      role: serializer.custom_organization_role(payload[:role])
    }

    publish(message, schema: "github.custom_organization_roles.v0.CustomOrganizationRoleUpdated")
  end
end
