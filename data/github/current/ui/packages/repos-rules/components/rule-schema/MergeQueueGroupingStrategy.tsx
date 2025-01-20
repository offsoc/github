import {Checkbox, FormControl} from '@primer/react'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'

// Whether or not the component should be rendered
export function renderMergeQueueGroupingStrategy({value, readonly}: {value: string; readonly: boolean}): boolean {
  return !readonly || value === 'ALLGREEN'
}

export function MergeQueueGroupingStrategy({
  field,
  value,
  onValueChange,
  readOnly,
  errors,
}: RegisteredRuleSchemaComponent) {
  value = value ?? field.default_value

  const fieldLabel = `${field.name}Label`

  if (readOnly) {
    return (
      <div>
        <span className="text-bold">{field.display_name}</span>
        <span className="d-block text-small color-fg-muted">{field.description}</span>
      </div>
    )
  }

  return (
    <FormControl>
      <Checkbox
        aria-labelledby={fieldLabel}
        checked={value === 'ALLGREEN'}
        onChange={e => {
          onValueChange?.(e.target.checked ? 'ALLGREEN' : 'HEADGREEN')
        }}
      />
      <FormControl.Label id={fieldLabel}>{field.display_name}</FormControl.Label>
      <FormControl.Caption>{field.description}</FormControl.Caption>
      {errors.length > 0 && <FormControl.Validation variant="error">{errors[0]?.message}</FormControl.Validation>}
    </FormControl>
  )
}
