import {DefaultPrivileges, type Privileges, Role} from '../../client/api/common-contracts'

export function getViewerPrivileges(defaultPrivileges?: Privileges): Privileges {
  const privileges = defaultPrivileges ?? DefaultPrivileges
  const params = new URLSearchParams(location.search)
  const parts = params.get('_memex_viewer_privileges')?.split(',')

  if (!parts) return privileges

  for (const part of parts) {
    const [featureName, featureValue] = part.split(':')

    if (featureName === 'viewerRole') {
      switch (featureValue) {
        case Role.Read:
        case Role.Write:
        case Role.Admin:
        case Role.None:
          privileges.role = featureValue
      }
    }

    if (featureName === 'viewerCanChangeProjectVisibility') {
      switch (featureValue) {
        case 'true':
        case 't':
        case '1':
          privileges.canChangeProjectVisibility = true
      }
    }
  }

  return privileges
}
