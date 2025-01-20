# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("team.notification.setting") do |payload|
    message = {
      team_id: payload[:team_id],
      organization_id: payload[:organization_id],
      org_plan: payload[:org_plan],
      business_id: payload[:business_id],
      business_type: payload[:business_type],
      notification_setting: payload[:notification_setting]
    }

    publish(message, schema: "github.notifications.v0.TeamNotificationSetting")
  end
end
