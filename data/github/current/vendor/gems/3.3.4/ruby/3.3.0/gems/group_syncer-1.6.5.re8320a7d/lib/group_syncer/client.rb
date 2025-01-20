# frozen_string_literal: true

module GroupSyncer
  class Client

    # Public
    #
    # connection - A Faraday::Connection pointing to the group-syncer service.
    def initialize(connection)
      @connection = connection
    end

    def alive?
      res = ping
      res.error.nil?
    end

    def ping
      health_client.ping({})
    end

    def list_groups(org_id:, query:, page_size: nil, page_token: nil)
      groups_client.list(org_id: org_id, query: query, page_size: page_size, page_token: page_token)
    end

    def list_group_members(team_id:, group_id:)
      groups_client.list_members(team_id: team_id, group_id: group_id)
    end

    def register_tenant(org_id:, external_provider_type:, external_provider_id: nil, status:, token: nil, url: nil)
      tenants_client.register(
        org_id: org_id,
        external_provider_id: external_provider_id,
        external_provider_type: external_provider_type,
        status: status,
        token: token,
        url: url
      )
    end

    def update_team_mappings(org_id:, team_id:, group_ids:)
      team_mappings_client.update(org_id: org_id, team_id: team_id, group_ids: group_ids)
    end

    def list_team_mappings(org_id:, team_id:)
      team_mappings_client.list(org_id: org_id, team_id: team_id)
    end

    def sync_team(org_id:, team_id:)
      team_mappings_client.sync(org_id: org_id, team_id: team_id)
    end

    private

    attr_reader :connection

    # Health Client

    def health_client
      @health_client ||= GroupSyncer::V1::HealthClient.new(connection)
    end

    # Groups Client

    def groups_client
      @groups_client ||= GroupSyncer::V1::GroupsClient.new(connection)
    end

    # Tenants Client

    def tenants_client
      @tenants_client ||= GroupSyncer::V1::TenantsClient.new(connection)
    end

    # TeamMappings Client

    def team_mappings_client
      @team_mappings_client ||= GroupSyncer::V1::TeamMappingsClient.new(connection)
    end
  end
end
