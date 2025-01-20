# typed: strict
# frozen_string_literal: true

GitHub.subscribe("external_identity.provision") do |_name, _start, _ending, _transaction_id, payload|
  EnterpriseTeamIdentityProvisionEventsJob.enqueue(payload)
end

GitHub.subscribe("external_identity.deprovision") do |_name, _start, _ending, _transaction_id, payload|
  EnterpriseTeamIdentityProvisionEventsJob.enqueue(payload)
end

GitHub.subscribe("external_group.add_member") do |_name, _start, _ending, _transaction_id, payload|
  EnterpriseTeamGroupMapping.active.where(external_group_id: payload[:external_group_id]).find_each do |group_mapping|
    group_mapping.enterprise_team&.instrument_add_member(User.find(payload[:user_id]))
  end
end

GitHub.subscribe("external_group.remove_member") do |_name, _start, _ending, _transaction_id, payload|
  EnterpriseTeamGroupMapping.active.where(external_group_id: payload[:external_group_id]).find_each do |group_mapping|
    group_mapping.enterprise_team&.instrument_remove_member(User.find(payload[:user_id]))
  end
end

GitHub.subscribe("business.add_organization") do |_name, _start, _ending, _transaction_id, payload|
  business = Business.find_by(id: payload[:business_id])
  next unless EnterpriseTeam.enabled_for_organizations?(business: business)
  business&.enterprise_teams&.where(sync_to_organizations: "all")&.each do |enterprise_team|
    EnterpriseTeamOrganizationMappingJob.perform_later(enterprise_team.id)
  end
end

GitHub.subscribe("business.remove_organization") do |_name, _start, _ending, _transaction_id, payload|
  business = Business.find_by(id: payload[:business_id])
  next unless EnterpriseTeam.enabled_for_organizations?(business: business)
  business&.enterprise_teams&.where(sync_to_organizations: "all")&.each do |enterprise_team|
    ClearEnterpriseTeamOrganizationMappingsJob.enqueue(enterprise_team.id, organization_ids: [payload[:org_id]])
  end
end

GitHub.subscribe("enterprise_team.update") do |_name, _start, ending, _transaction_id, payload|
  enterprise_team = EnterpriseTeam.find_by(id: payload[:id], sync_to_organizations: "all")
  next if enterprise_team.nil?
  next unless EnterpriseTeam.enabled_for_organizations?(business: enterprise_team.business)

  EnterpriseTeamOrganizationReconciliationJob.enqueue(enterprise_team_id: payload[:id], out_of_sync_time: ending)
end

GlobalInstrumenter.subscribe("advanced_security.enabled") do |_name, _start, _ending, _transaction_id, payload|
  repo = Repository.find_by(id: payload[:repository_id])
  business = repo&.business

  next if repo.nil? || business.nil?
  next unless EnterpriseTeam.enabled_for_organizations?(business: business)

  business.enterprise_teams.where(sync_to_organizations: "all").each do |enterprise_team|
    EnterpriseTeamOrganizationMappingJob.perform_later(enterprise_team.id, organization_id: repo.organization_id)
  end
end

GlobalInstrumenter.subscribe("advanced_security.disabled") do |_name, _start, _ending, _transaction_id, payload|
  repo = Repository.find_by(id: payload[:repository_id])
  business = repo&.business

  next if repo.nil? || business.nil?
  next unless EnterpriseTeam.enabled_for_organizations?(business: business)

  org_has_other_ghas_enabled_repo = RepositorySecurityCenterConfig
    .where(ghas_enabled: true, owner_type: "ORGANIZATION", owner_id: repo.organization_id)
    .where.not(repository_id: repo.id)
    .distinct
    .exists?

  next if org_has_other_ghas_enabled_repo

  business.enterprise_teams.where(sync_to_organizations: "all").each do |enterprise_team|
    ClearEnterpriseTeamOrganizationMappingsJob.enqueue(enterprise_team.id, organization_ids: [T.must(repo.organization_id)])
  end
end
