import {CheckboxField} from '../CheckboxField'
import type {FieldComponentProps} from '../../types'

export function ManageForkDestinationsField({initialValue = false}: FieldComponentProps<boolean>) {
  return (
    <CheckboxField
      name="manageForkDestination"
      label="Manage fork destinations"
      caption="Choose where forks of repositiories in this group can be created"
      initialValue={initialValue}
    />
  )
}
