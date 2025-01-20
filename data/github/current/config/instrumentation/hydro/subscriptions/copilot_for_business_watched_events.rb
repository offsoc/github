# typed: true
# frozen_string_literal: true

###### Enterprise Level ######

# Event: an organization is removed
GlobalInstrumenter.subscribe("enterprise_account.organization_remove") do |name, _start, _ending, transaction_id, payload|
  enterprise_id, actor_id, organization_id = payload.values_at(:enterprise_id, :actor_id, :organization_id)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:enterprise_id, :organization_id], payload: payload, event_name: name) unless enterprise_id && organization_id

  Copilot::SeatManagement::EnterpriseJob.perform_later(
    action: :remove_organization,
    actor_id: actor_id,
    enterprise_id: enterprise_id,
    organization_id: organization_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# Event: an organization is added
GlobalInstrumenter.subscribe("enterprise_account.organization_add") do |name, _start, _ending, transaction_id, payload|
  enterprise_id, actor_id, organization_id = payload.values_at(:enterprise_id, :actor_id, :organization_id)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:enterprise_id, :organization_id], payload: payload, event_name: name) unless enterprise_id && organization_id

  Copilot::SeatManagement::EnterpriseJob.perform_later(
    action: :add_organization,
    actor_id: actor_id,
    enterprise_id: enterprise_id,
    organization_id: organization_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

GitHub.subscribe("copilot_enterprise_team.update") do |name, _start, _ending, transaction_id, payload|
  team_id = payload.fetch(:id, nil)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:id], payload: payload, event_name: name) unless team_id

  Copilot::SeatManagement::EnterpriseTeamJob.perform_later(
    team_id: team_id,
    action: :update,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# This is emitted by EnterpriseTeamAssignment on create
GitHub.subscribe("enterprise_team.copilot.assignment") do |name, _start, _ending, transaction_id, payload|
  team_id = payload.fetch(:id, nil)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:id], payload: payload, event_name: name) unless team_id

  Copilot::SeatManagement::EnterpriseTeamJob.perform_later(
    team_id: team_id,
    action: :enterprise_team_assigned,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# This is emitted by EnterpriseTeamAssignment on destroy
GitHub.subscribe("enterprise_team.copilot.unassignment") do |name, _start, _ending, transaction_id, payload|
  team_id = payload.fetch(:id, nil)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:id], payload: payload, event_name: name) unless team_id

  Copilot::SeatManagement::EnterpriseTeamJob.perform_later(
    team_id: team_id,
    action: :enterprise_team_unassigned,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# This is emitted when changes happen to EnterpriseTeams/external groups, such as when a member is added or removed (see BaseGroupProvisioner)
GitHub.subscribe("enterprise_team.copilot.update") do |name, _start, _ending, transaction_id, payload|
  team_id = payload.fetch(:id, nil)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:id], payload: payload, event_name: name) unless team_id

  Copilot::SeatManagement::EnterpriseTeamJob.perform_later(
    team_id: team_id,
    action: :enterprise_team_updated,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# Enterprise (BUSINESS) Trial stuff
#
# When a GHEC Business Trial is modified, we get a GlobalInstrumenter 'enterprise_account.trial' event
#
# Event: trial is modified - has `status` field (CREATED, UPGRADED, EXTENDED, EXPIRED, CANCELLED, RESET)
GlobalInstrumenter.subscribe("enterprise_account.trial") do |name, _start, _ending, transaction_id, payload|
  enterprise, status, actor = payload.values_at(:enterprise, :status, :actor)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:enterprise, :status], payload: payload, event_name: name) unless enterprise && status
  next if status == :CREATED || status == :RESET # we don't need to get created or reset events (when the enterprise has ended/reset trial and restarts).
  Copilot::BusinessTrials::EnterpriseTrialSyncJob.perform_later(enterprise.id, status, actor, transaction_id, payload)
end

###### Organization Level ######

# Event: an organization or user has their billing unlocked
GitHub.subscribe("billing.unlock") do |_name, _start, _ending, _transaction_id, payload|
  id = payload.values_at(:user_id)
  org = Organization.find_by(id: id)

  next unless org&.organization?

  Copilot::Organization.new(org).handle_billing_unlock!
end

# Event: business_plus organization extends trial
GitHub.subscribe("billing.trial_extend") do |name, _start, _ending, transaction_id, payload|
  org_id = payload.values_at(:org_id)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], payload: payload, event_name: name) unless org_id

  Copilot::BusinessTrials::OrganizationTrialSyncJob.perform_later(org_id, :EXTENDED, transaction_id, payload)
end

# Event: business_plus organization ends trial
GitHub.subscribe("billing.trial_end") do |name, _start, _ending, transaction_id, payload|
  org_id = payload.values_at(:org_id)
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], payload: payload, event_name: name) unless org_id

  Copilot::BusinessTrials::OrganizationTrialSyncJob.perform_later(org_id, :EXPIRED, transaction_id, payload)
end

# Event: a user is added to the org
GitHub.subscribe("org.add_member") do |name, _start, _ending, transaction_id, payload|
  user, user_id, organization, organization_id, invitation_email, actor_id =
    payload.values_at(:user, :user_id, :org, :org_id, :invitation_email, :actor_id)
  user_id         ||= user&.id
  organization_id ||= organization&.id

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:user_id, :org_id], payload: payload, event_name: name) unless user_id && organization_id

  Copilot::SeatManagement::OrganizationMemberJob.perform_after_waiting_period(
    1.minute, # Avoid race with membership creation
    action: :add_member, # this is kept for backwards compatibility
    user_id: user_id,
    organization_id: organization_id,
    transaction_id: transaction_id,
    invitation_email: invitation_email,
    payload: payload,
    actor_id: actor_id,
  )
end

# Event: org is archived
GitHub.subscribe("org.archive") do |name, _start, _ending, transaction_id, payload|
  org_id, actor_id = payload.values_at(:org_id, :actor_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], event_name: name, payload: payload) unless org_id
  organization = Organization.find_by(id: org_id)
  if organization.nil?
    customer_id = nil
  else
    copilot_org = Copilot::Organization.new(organization)
    customer_id = copilot_org.customer_for&.id
  end

  Copilot::SeatManagement::OrganizationJob.perform_later(
    action: :organization_archived,
    organization_id: org_id,
    customer_id: customer_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id,
  )

end

# Event: org is suspended
GitHub.subscribe("org.suspend") do |name, _start, _ending, transaction_id, payload|
  org_id, actor_id = payload.values_at(:org_id, :actor_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], event_name: name, payload: payload) unless org_id
  organization = Organization.find_by(id: org_id)
  if organization.nil?
    customer_id = nil
  else
    copilot_org = Copilot::Organization.new(organization)
    customer_id = copilot_org.customer_for&.id
  end

  Copilot::SeatManagement::OrganizationJob.perform_later(
    action: :organization_suspended,
    organization_id: org_id,
    customer_id: customer_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id,
  )

end

# Event: org is deleted
GitHub.subscribe("org.delete") do |name, _start, _ending, transaction_id, payload|
  org_id, actor_id = payload.values_at(:org_id, :actor_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], event_name: name, payload: payload) unless org_id

  Copilot::SeatManagement::OrganizationJob.perform_later(
    action: :organization_destroyed,
    organization_id: org_id,
    customer_id: nil,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id,
  )
end

# Event: org is deleted
GitHub.subscribe("org.before_destroy") do |name, _start, _ending, transaction_id, payload|
  org_id, actor_id = payload.values_at(:org_id, :actor_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], event_name: name, payload: payload) unless org_id
  organization = Organization.find_by(id: org_id)
  if organization.nil?
    customer_id = nil
  else
    copilot_org = Copilot::Organization.new(organization)
    customer_id = copilot_org.customer_for&.id
  end
  Copilot::SeatManagement::OrganizationJob.perform_later(
    action: :organization_destroying,
    organization_id: org_id,
    customer_id: customer_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id,
  )

end

# Event: a member is removed from the org
GitHub.subscribe("org.remove_member") do |name, _start, _ending, transaction_id, payload|
  user, user_id, organization, organization_id = payload.values_at(:user, :user_id, :org, :org_id)
  user_id         ||= user&.id
  organization_id ||= organization&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:user_id, :org_id], payload: payload, event_name: name) unless user_id && organization_id

  Copilot::SeatManagement::OrganizationRemoveMemberJob.perform_later(
    user_id: user_id,
    organization_id: organization_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# Event: a member is restored back into the org
GitHub.subscribe("org.restore_member") do |name, _start, _ending, transaction_id, payload|
  user, user_id, organization, organization_id, actor_id = payload.values_at(:user, :user_id, :org, :org_id, :actor_id)
  user_id         ||= user&.id
  organization_id ||= organization&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:user_id, :org_id], payload: payload, event_name: name) unless user_id && organization_id

  Copilot::SeatManagement::OrganizationMemberJob.perform_later(
    action: :restore_member, # this is kept for backwards compatibility
    user_id: user_id,
    organization_id: organization_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id
  )
end
# Event: a user account transforms into an org
GitHub.subscribe("org.transform") do |name, _start, _ending, _transaction_id, payload|
  org_id = payload[:org_id]

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:org_id], payload: payload, event_name: name) unless org_id

  Copilot::SeatManagement::OrgTransformFromIndividualJob.perform_later(org_id: org_id)
end

# User level
GitHub.subscribe("external_identity.deprovision") do |name, _start, _ending, transaction_id, payload|
  external_identity_id = payload[:id]
  user, user_id = payload.values_at(:user, :user_id)
  user_id ||= user&.id

  next Copilot::Instrumentation::EventSubscriber.log_missing(
    missing: [:external_identity_id, :user_id],
    payload: payload,
    event_name: name,
  ) unless user_id && external_identity_id

  Copilot::SeatManagement::ExternalIdentityJob.perform_later(
    action: :deprovision,
    user_id: user_id,
    external_identity_id: external_identity_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

GitHub.subscribe("external_identity.provision") do |name, _start, _ending, transaction_id, payload|
  external_identity_id = payload[:id]
  user, user_id = payload.values_at(:user, :user_id)
  user_id ||= user&.id

  next Copilot::Instrumentation::EventSubscriber.log_missing(
    missing: [:external_identity_id, :user_id],
    payload: payload,
    event_name: name,
  ) unless user_id && external_identity_id

  Copilot::SeatManagement::ExternalIdentityJob.perform_later(
    action: :provision,
    user_id: user_id,
    external_identity_id: external_identity_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

GitHub.subscribe("user.delete") do |name, _start, _ending, transaction_id, payload|
  user, user_id = payload.values_at(:user, :user_id)
  user_id ||= user&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:user_id], payload: payload, event_name: name) unless user_id

  Copilot::FreeUserCleanupJob.set(wait: 5.minutes).perform_later(user_id)

  Copilot::SeatManagement::UserJob.perform_later(
    action: :destroy,
    user_id: user_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

GitHub.subscribe("user.destroy") do |name, _start, _ending, transaction_id, payload|
  user, user_id = payload.values_at(:user, :user_id)
  user_id ||= user&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:user_id], payload: payload, event_name: name) unless user_id

  Copilot::FreeUserCleanupJob.set(wait: 5.minutes).perform_later(user_id)

  Copilot::SeatManagement::UserJob.perform_later(
    action: :destroy,
    user_id: user_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

# Team level

GitHub.subscribe("team.add_member") do |name, _start, _ending, transaction_id, payload|
  team, team_id, organization, organization_id, user, user_id, actor_id = payload.values_at(:team, :team_id, :org, :org_id, :user, :user_id, :actor_id)
  team_id         ||= team&.id
  organization_id ||= organization&.id
  user_id         ||= user&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:team_id, :org_id, :user_id], payload: payload, event_name: name) unless team_id && organization_id && user_id
  Copilot::SeatManagement::OrganizationTeamJob.perform_later(
    action: :add_member,
    user_id: user_id,
    organization_id: organization_id,
    team_id: team_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id
  )
end

GitHub.subscribe("team.destroy") do |name, _start, _ending, transaction_id, payload|
  team, team_id, organization, organization_id, actor_id = payload.values_at(:team, :team_id, :org, :org_id, :actor_id)
  team_id         ||= team&.id
  organization_id ||= organization&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:team_id, :org_id], payload: payload, event_name: name) unless team_id && organization_id

  Copilot::SeatManagement::OrganizationTeamJob.perform_later(
    action: :destroy_team,
    organization_id: organization_id,
    team_id: team_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id
  )
end

GitHub.subscribe("team.remove_member") do |name, _start, _ending, transaction_id, payload|
  team, team_id, organization, organization_id, user, user_id, actor_id = payload.values_at(:team, :team_id, :organization, :org_id, :user, :user_id, :actor_id)
  team_id         ||= team&.id
  organization_id ||= organization&.id
  user_id         ||= user&.id
  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:team_id, :org_id, :user_id], payload: payload, event_name: name) unless team_id && organization_id && user_id

  Copilot::SeatManagement::OrganizationTeamJob.perform_later(
    action: :remove_member,
    user_id: user_id,
    organization_id: organization_id,
    team_id: team_id,
    transaction_id: transaction_id,
    payload: payload,
    actor_id: actor_id
  )
end

# Invitation Level
GlobalInstrumenter.subscribe("organization.cancel_invitation") do |name, _start, _ending, transaction_id, payload|
  invitation, org, user = payload.values_at(:invitation, :organization, :user)

  invitation_id = invitation&.id
  org_id        ||= org&.id
  user_id       ||= user&.id

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:invitation_id, :org_id, :user_id], payload: payload, event_name: name) unless invitation_id && org_id

  Copilot::SeatManagement::OrganizationInvitationJob.perform_later(
    action: :cancel_invitation,
    invitation_id: invitation_id,
    organization_id: org_id,
    transaction_id: transaction_id,
    user_id: user_id,
    payload: payload,
  )
end

GlobalInstrumenter.subscribe("org.member_invite_expired") do |name, _start, _ending, transaction_id, payload|
  # this uses organization, not org
  invitation, org, user = payload.values_at(:invitation, :organization, :user)

  invitation_id = invitation&.id
  org_id        = org&.id
  user_id       ||= user&.id

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:invitation, :org_id, :email], payload: payload, event_name: name) unless invitation_id && org_id

  Copilot::SeatManagement::OrganizationInvitationJob.perform_later(
    action: :invite_expired,
    invitation_id: invitation_id,
    organization_id: org_id,
    transaction_id: transaction_id,
    user_id: user_id,
    payload: payload,
  )
end

GitHub.subscribe("org.confirm_business_invitation") do |name, _start, _ending, transaction_id, payload|
  invitation_id, org_id, business_id = payload.values_at(:invitation_id, :org_id, :business_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:invitation_id, :org_id, :business_id], payload: payload, event_name: name) unless invitation_id && org_id && business_id

  Copilot::Businesses::OrganizationInvitationConfirmationJob.perform_later(
    action: :confirm_invitation,
    invitation_id: invitation_id,
    business_id: business_id,
    organization_id: org_id,
    transaction_id: transaction_id,
    payload: payload,
  )
end

GitHub.subscribe("business.destroy") do |name, _start, _ending, transaction_id, payload|
  business_id = payload.fetch(:business_id)

  next Copilot::Instrumentation::EventSubscriber.log_missing(missing: [:business_id], payload: payload, event_name: name) unless business_id

  business_id = T.let(business_id, Integer)

  Copilot::Businesses::DestroyedBusinessCleanupJob.perform_later(business_id: business_id, transaction_id: transaction_id)
end
