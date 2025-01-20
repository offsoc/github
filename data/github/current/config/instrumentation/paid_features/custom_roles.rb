# frozen_string_literal: true

require "instrumentation/global_events"

GlobalInstrumenter.subscribe("billing.plan_change") do |event|
  payload = event.payload
  user = User.find_by(id: payload[:user_id])
  delete_custom_roles = !GitHub.enterprise? &&
    user.organization? &&
    !user.custom_roles_supported?

  if delete_custom_roles
    user.all_custom_roles.each { |role| Permissions::CustomRoles.destroy!(role) }
  end
end
