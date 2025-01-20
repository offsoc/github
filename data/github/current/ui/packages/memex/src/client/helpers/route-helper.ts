import type {RouteObject} from 'react-router-dom'

import {getEnabledFeatures} from './feature-flags'
import {getInitialState} from './initial-state'
import {ViewerPrivileges} from './viewer-privileges'

const PrivateRouteType = {
  ADMIN: 'ADMIN',
  WRITE: 'WRITE',
  DEFAULT: 'DEFAULT',
} as const
type PrivateRouteType = ObjectValues<typeof PrivateRouteType>

const isPermitted = (type: PrivateRouteType = PrivateRouteType.DEFAULT) => {
  const {hasAdminPermissions, hasWritePermissions} = ViewerPrivileges()

  switch (type) {
    case PrivateRouteType.ADMIN:
      return hasAdminPermissions

    case PrivateRouteType.WRITE:
      return hasWritePermissions

    case PrivateRouteType.DEFAULT:
      return hasAdminPermissions || hasWritePermissions
  }
}

function conditionalRoute(test: boolean, route: RouteObject): RouteObject | null {
  return test ? route : null
}

/**
 * Redirect to the github 404 page if the runtime is not dotcom
 */
export function requireDotcomRuntimeRoute(obj: RouteObject): RouteObject | null {
  const {isDotcomRuntime} = getInitialState()
  return conditionalRoute(isDotcomRuntime, obj)
}

/**
 * Redirect to the github 404 page if the automation is not enabled
 */
export function requireAutomationEnabledRoute(obj: RouteObject): RouteObject | null {
  const {memex_automation_enabled} = getEnabledFeatures()
  return conditionalRoute(memex_automation_enabled, obj)
}

/**
 * Redirect to the github 404 page if the user does
 * not have the required permissions level
 */
function requirePermissionRoute(type: PrivateRouteType, obj: RouteObject): RouteObject | null {
  return conditionalRoute(isPermitted(type), obj)
}

export function requirePermittedRoute(obj: RouteObject): RouteObject | null {
  return requirePermissionRoute(PrivateRouteType.DEFAULT, obj)
}

export function requireAdminRoute(obj: RouteObject): RouteObject | null {
  return requirePermissionRoute(PrivateRouteType.ADMIN, obj)
}

export function requireWriteRoute(obj: RouteObject): RouteObject | null {
  return requirePermissionRoute(PrivateRouteType.WRITE, obj)
}
