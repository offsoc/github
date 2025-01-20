import {Checkbox, FormControl, Label} from '@primer/react'
import {useFormField} from '../hooks/use-form-field'
import type {FieldComponentProps} from '../types'

type CheckboxFieldProps = FieldComponentProps<boolean> & {
  name: string
  label: string
  caption?: string
  inherited?: boolean
}

export function CheckboxField({name, label, caption, initialValue = false, inherited = false}: CheckboxFieldProps) {
  const field = useFormField(name, initialValue)
  return (
    <FormControl id={field.name} disabled={inherited}>
      <FormControl.Label sx={{display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 2}}>
        <span>{label}</span>
        {inherited ? <Label>Inherited</Label> : null}
      </FormControl.Label>
      {caption ? <FormControl.Caption>{caption}</FormControl.Caption> : null}
      <Checkbox checked={field.value} onChange={e => (inherited ? null : field.update(e.target.checked))} />
    </FormControl>
  )
}
