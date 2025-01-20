# frozen_string_literal: true

# Hydro event subscriptions for custom repository roles.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("custom_repository_roles.role_created") do |payload|
    message = {
      role: serializer.custom_repository_role(payload[:role]),
      org_custom_roles_count: payload[:org_custom_roles_count]
    }

    publish(message, schema: "github.custom_repository_roles.v0.CustomRepositoryRoleCreated")
  end

  subscribe("custom_repository_roles.role_deleted") do |payload|
    message = {
      role: serializer.custom_repository_role(payload[:role]),
      org_custom_roles_count: payload[:org_custom_roles_count]
    }

    publish(message, schema: "github.custom_repository_roles.v0.CustomRepositoryRoleDeleted")
  end

  subscribe("custom_repository_roles.role_updated") do |payload|
    message = {
      role: serializer.custom_repository_role(payload[:role])
    }

    publish(message, schema: "github.custom_repository_roles.v0.CustomRepositoryRoleUpdated")
  end
end
