import type {SavingStatus} from '../components/State'
import type {OrganizationRecord} from './settings-types'

/**
 * Encapsulate the custom route API response
 */
export type CustomRoutesPayload = {
  organizationRecords: OrganizationRecord[]
  verificationEnabled: boolean
  newsiesAvailable: boolean
  globalEmailAddress: string
}

/**
 * Manage state key for each CustomRouteRow, usually an organization login or reserved keyword
 */
export type CustomRouteKey = string
export const DRAFT_KEY = '__draft'

/**
 * Managed state value for each CustomRouteRow
 */
export type CustomRouteState = {
  status: SavingStatus /// Current save status
  email: string | null /// Email address for custom route
}

/**
 * Organization login map to its custom route state
 */
export type RouteStateMap = Map<CustomRouteKey, CustomRouteState>

/**
 * Organization login map to its DB record
 */
export type OrganizationMap = Map<CustomRouteKey, OrganizationRecord>

export enum RouteActions {
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
}
type RouteDeleteAction = {
  type: RouteActions.DELETE
}
type RouteUpdateAction = {
  type: RouteActions.UPDATE
} & Partial<CustomRouteState>

/**
 * Required parameters for dispatch calls
 */
type RouteActionBase = {
  type: RouteActions
  login: string
}

/**
 * Actions that can be performed on the custom route settings
 */
export type RouteStateAction = RouteActionBase & (RouteDeleteAction | RouteUpdateAction)
