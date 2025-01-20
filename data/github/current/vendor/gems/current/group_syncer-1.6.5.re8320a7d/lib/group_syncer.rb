# frozen_string_literal: true

module GroupSyncer
  require_relative "group_syncer/client"
  require_relative "../services/group_syncer/v1/health_twirp"
  require_relative "../services/group_syncer/v1/groups_twirp"
  require_relative "../services/group_syncer/v1/tenants_twirp"
  require_relative "../services/group_syncer/v1/team_mappings_twirp"
end
