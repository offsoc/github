import type {EnterpriseSecurityManagersPayload} from '../routes/EnterpriseSecurityManagers'

export function getEnterpriseSecurityManagersRoutePayload(): EnterpriseSecurityManagersPayload {
  return {
    readonly: false,
    canRemoveTeams: true,
  }
}

export function getEnterpriseSecurityManagersRouteReadonlyPayload(): EnterpriseSecurityManagersPayload {
  return {
    readonly: true,
    canRemoveTeams: true,
  }
}

export function getEnterpriseSecurityManagersRouteDeleteDisabledPayload(): EnterpriseSecurityManagersPayload {
  return {
    readonly: false,
    canRemoveTeams: false,
  }
}
