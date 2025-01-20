# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("security_campaigns.security_campaign_create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      query: payload[:query],
      repo_count: payload[:repo_count],
      alert_count: payload[:alert_count],
      organization: serializer.organization(payload[:security_campaign].organization),
      manager: serializer.user(payload[:security_campaign].manager),
      description: payload[:security_campaign].description,
      security_campaign: serialized_campaign(payload[:security_campaign])
    }

    publish(message, schema: "github.security_campaigns.v0.SecurityCampaignCreate")
  end

  subscribe("security_campaigns.security_campaign_delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:security_campaign].organization),
      manager: serializer.user(payload[:security_campaign].manager),
      security_campaign: serialized_campaign(payload[:security_campaign])
    }

    publish(message, schema: "github.security_campaigns.v0.SecurityCampaignDelete")
  end

  def serialized_campaign(campaign)
    {
      id: campaign.id,
      number: campaign.number,
      name: campaign.name,
      organization_id: campaign.organization_id,
      manager_id: campaign.manager_id,
      due_date: campaign.ends_at,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    }
  end
end
