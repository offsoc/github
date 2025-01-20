# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("customer_success_campaign.email") do |payload|
    business = payload[:business]

    message = {
      actor: serializer.user(payload[:user]),
      business: serializer.business(business),
      support_plan: business&.calculated_support_plan,
      campaign_email_sent: payload[:email_sent],
      campaign_name: payload[:campaign_name],
      campaign_email_name: payload[:campaign_email_name]
    }

    publish(message, schema: "github.v1.CustomerSuccessCampaignEmail")
  end
end
