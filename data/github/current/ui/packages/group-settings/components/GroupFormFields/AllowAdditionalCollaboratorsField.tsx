import {CheckboxField} from '../CheckboxField'
import type {FieldComponentProps} from '../../types'

export function AllowAdditionalCollaboratorsField({
  initialValue = false,
  inherited = false,
}: FieldComponentProps<boolean>) {
  return (
    <div className="Box p-3">
      <CheckboxField
        name="allowAdditionalCollaborators"
        label="Allow additional collaborators and teams"
        caption="Sub-groups and repositories can add additional people or teams as collaborators."
        initialValue={initialValue}
        inherited={inherited}
      />
    </div>
  )
}
