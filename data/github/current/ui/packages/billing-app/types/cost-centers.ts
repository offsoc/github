import type {CostCenterState, CostCenterType, ResourceType} from '../enums/cost-centers'
import type {AdminRole} from './common'

export interface CostCenter {
  costCenterKey: CostCenterKey
  name: string
  resources: Resource[]
  costCenterState?: CostCenterState
}

export interface CostCenterKey {
  customerId: string
  targetType: CostCenterType
  targetId: string
  uuid: string
}

export interface Resource {
  id: string
  type: ResourceType
}

export interface GetAllCostCentersRequest {
  customerId: string
}

export interface GetAllCostCentersResponse {
  adminRoles: AdminRole[]
  activeCostCenters: CostCenter[]
  archivedCostCenters: CostCenter[]
  hasUserScopedCostCenters: boolean
}

export interface CreateCostCenterRequest {
  name: string
  resources: Resource[]
  targetId: string
}

export interface UpdateCostCenterRequest {
  name: string
  originalTargetId: string
  resourcesToAdd: Resource[]
  resourcesToRemove: Resource[]
  targetId: string
}

export interface Subscription {
  subscriptionId: string
  displayName: string
}

export type CostCenterPicker = 'org' | 'repo'
