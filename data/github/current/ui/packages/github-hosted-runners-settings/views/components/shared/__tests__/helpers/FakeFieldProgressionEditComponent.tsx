import type {FieldProgressionFieldEditComponentProps} from '../../FieldProgressionField'
import {TextInput, Button} from '@primer/react'

export function FakeFieldProgressionEditComponent({
  value,
  setValue,
  onSave,
}: FieldProgressionFieldEditComponentProps<string>) {
  return (
    <>
      <TextInput
        data-testid="fake-edit-component-input"
        value={value || ''}
        onChange={e => setValue(e.target.value === '' ? null : e.target.value)}
      />
      <Button data-testid="fake-edit-component-button" onClick={onSave}>
        Save
      </Button>
    </>
  )
}
