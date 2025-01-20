export type BypassActor = {
  id?: number
  _id?: number
  actorId: number | string | null
  actorType: BypassActorType
  name: string
  _enabled: boolean
  _dirty: boolean
  bypassMode: ActorBypassMode
  owner?: string
}

export type BypassActorType =
  | 'RepositoryRole'
  | 'Team'
  | 'Integration'
  | 'OrganizationAdmin'
  | 'DeployKey'
  | 'EnterpriseTeam'
  | 'EnterpriseOwner'

export enum ActorBypassMode {
  ALWAYS = 0,
  PRS_ONLY = 1,
}

export const enum OrgAdminBypassMode {
  NoOrgBypass = 'no_org_bypass',
  OrgBypassPRsOnly = 'org_bypass_prs_only',
  OrgBypassAny = 'org_bypass_any',
}
