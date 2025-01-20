# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :manage_team_sync_mappings do |access|
    access.allow :v3_org_admin
    access.allow :team_maintainer

    access.allow :org_member_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :update_group_mappings_state do |access|
    access.ensure_context :user

    access.allow :org_member_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user
      actor.respond_to?(:integration) && actor.integration.group_syncer_github_app?
    end
  end
end
