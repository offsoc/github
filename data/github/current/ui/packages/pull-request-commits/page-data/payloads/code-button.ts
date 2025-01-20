export type CodeButtonData = {
  contactPath: string
  currentUserIsEnterpriseManaged?: boolean
  enterpriseManagedBusinessName?: string
  isLoggedIn: boolean
  newCodespacePath: string
  repositoryPolicyInfo: RepoPolicyInfo
  hasAccessToCodespaces: boolean
}

export type RepoPolicyInfo = {
  allowed: boolean
  canBill: boolean
  changesWouldBeSafe: boolean
  disabledByBusiness: boolean
  disabledByOrganization: boolean
  hasIpAllowLists: boolean
}
