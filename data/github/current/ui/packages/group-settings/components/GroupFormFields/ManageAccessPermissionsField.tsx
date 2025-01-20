import {CheckboxField} from '../CheckboxField'
import type {FieldComponentProps} from '../../types'

export function ManageAccessPermissionsField({initialValue = false}: FieldComponentProps<boolean>) {
  return (
    <CheckboxField
      name="manageAccessPermissions"
      label="Manage access permissions"
      caption="Manage collaborator and team access permissions for the repositories in this group."
      initialValue={initialValue}
    />
  )
}
