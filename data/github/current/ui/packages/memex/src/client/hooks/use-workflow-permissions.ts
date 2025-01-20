import {ViewerPrivileges} from '../helpers/viewer-privileges'

export const useWorkflowPermissions = () => {
  const {hasWritePermissions} = ViewerPrivileges()
  return {hasWorkflowWritePermission: hasWritePermissions}
}
