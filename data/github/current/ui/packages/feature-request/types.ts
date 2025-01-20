export interface FeatureRequestInfo {
  showFeatureRequest: boolean
  alreadyRequested: boolean
  dismissed: boolean
  featureName: string
  requestPath: string
  isEnterpriseRequest?: boolean
  dismissedAt?: string
  billingEntityId?: string
}
