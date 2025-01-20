import {DefaultPrivileges, type Privileges, Role} from '../api/common-contracts'
import {getInitialState} from './initial-state'

/**
 * This helper function exposes the `Privileges` for the current user.
 * It encapsulates very basic logic initially but the scope can and will be extended to support granular permissions
 */
export const ViewerPrivileges = () => {
  const {viewerPrivileges, loggedInUser} = getInitialState()

  return {
    isLoggedIn: loggedInUser !== undefined,
    isReadonly: viewerPrivileges.role === Role.Read,
    hasWritePermissions: viewerPrivileges.role !== Role.Read,
    hasAdminPermissions: viewerPrivileges.role === Role.Admin,
    canChangeProjectVisibility: viewerPrivileges.canChangeProjectVisibility,
    canCopyAsTemplate: viewerPrivileges.canCopyAsTemplate,
  }
}

/**
 * Provides an easy way to override a targeted subset of attributes from the DefaultPrivileges
 * object.
 *
 * @param overrides A subset of attributes to use instead of the default ones.
 * @returns Privileges object.
 */
export function overrideDefaultPrivileges(overrides: Partial<Privileges>): Privileges {
  return {...DefaultPrivileges, ...overrides}
}
