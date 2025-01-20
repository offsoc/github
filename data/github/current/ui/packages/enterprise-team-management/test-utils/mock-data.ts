import type {EnterpriseTeamManagementPayload} from '../routes/EnterpriseTeamManagement'

export function getEnterpriseTeamManagementRoutePayload(): EnterpriseTeamManagementPayload {
  return {
    enterpriseSlug: 'acme-corp',
    enterpriseTeam: {
      name: 'Acme Engineering',
      slug: 'acme-engineering',
      idpGroup: {id: '1', text: 'Group 1', member_count: 5},
      syncToOrganizations: false,
      isSecurityManager: false,
    },
    idpGroups: [
      {id: '1', text: 'Group 1', member_count: 5},
      {id: '2', text: 'Group 2', member_count: 5},
      {id: '3', text: 'Group 3', member_count: 5},
    ],
    idpGroupsDisabled: false,
    enterpriseManaged: true,
    enabledForOrganizations: false,
    enabledForOrganizationSecurityManager: false,
    canSyncToOrganizations: true,
    maxSyncMembers: 5000,
    maxSyncOrgs: 500,
    showEnterpriseSecurityManagerAssignmentPage: false,
  }
}

export function getEnterpriseTeamManagementRoutePayloadNoIdpMapped(): EnterpriseTeamManagementPayload {
  return {
    enterpriseSlug: 'acme-corp',
    enterpriseTeam: {
      name: 'Acme Engineering',
      slug: 'acme-engineering',
      syncToOrganizations: false,
      isSecurityManager: false,
    },
    idpGroups: [
      {id: '1', text: 'Group 1', member_count: 5},
      {id: '2', text: 'Group 2', member_count: 5},
      {id: '3', text: 'Group 3', member_count: 5},
    ],
    idpGroupsDisabled: false,
    enterpriseManaged: true,
    enabledForOrganizations: false,
    enabledForOrganizationSecurityManager: false,
    canSyncToOrganizations: true,
    maxSyncMembers: 5000,
    maxSyncOrgs: 500,
    showEnterpriseSecurityManagerAssignmentPage: false,
  }
}

export function getEnterpriseTeamManagementRoutePayloadNoTeam(): EnterpriseTeamManagementPayload {
  return {
    enterpriseSlug: 'acme-corp',
    idpGroups: [
      {id: '1', text: 'Group 1', member_count: 5},
      {id: '2', text: 'Group 2', member_count: 5},
      {id: '3', text: 'Group 3', member_count: 5},
    ],
    idpGroupsDisabled: false,
    enterpriseManaged: true,
    enabledForOrganizations: false,
    enabledForOrganizationSecurityManager: false,
    canSyncToOrganizations: true,
    maxSyncMembers: 5000,
    maxSyncOrgs: 500,
    showEnterpriseSecurityManagerAssignmentPage: false,
  }
}
