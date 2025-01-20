import {useCallback} from 'react'
import {Checkbox, CheckboxGroup, FormControl} from '@primer/react'
import {type FieldComponentProps, ForkDestination} from '../../types'
import {useFormField} from '../../hooks/use-form-field'

export function ForkDestinationsField({initialValue = []}: FieldComponentProps<ForkDestination[]>) {
  const field = useFormField('forkDestination', initialValue)
  const toggleDestination = useCallback(
    (destination: ForkDestination, checked: boolean) => {
      const destinationIsChecked = field.value.includes(destination)
      if (checked) {
        if (!destinationIsChecked) {
          field.update([...field.value, destination])
        }
      } else {
        if (destinationIsChecked) {
          field.update(field.value.filter(dest => dest !== destination))
        }
      }
    },
    [field],
  )

  return (
    <CheckboxGroup>
      <CheckboxGroup.Label>Fork destinations</CheckboxGroup.Label>
      <FormControl>
        <Checkbox
          checked={field.value.includes(ForkDestination.EXTERNAL)}
          onChange={e => toggleDestination(ForkDestination.EXTERNAL, e.target.checked)}
        />
        <FormControl.Label>This organization</FormControl.Label>
        <FormControl.Caption>
          Forks of repositories in this group can be created within this organization.
        </FormControl.Caption>
      </FormControl>
      <FormControl>
        <Checkbox
          checked={field.value.includes(ForkDestination.INTERNAL)}
          onChange={e => toggleDestination(ForkDestination.INTERNAL, e.target.checked)}
        />
        <FormControl.Label>Other enterprise organizations</FormControl.Label>
        <FormControl.Caption>
          Forks of repositories in this group can be created within other enterprise organizations.
        </FormControl.Caption>
      </FormControl>
      <FormControl>
        <Checkbox
          checked={field.value.includes(ForkDestination.USERS)}
          onChange={e => toggleDestination(ForkDestination.USERS, e.target.checked)}
        />
        <FormControl.Label>User accounts</FormControl.Label>
        <FormControl.Caption>
          Forks of repositories in this group can be created within user accounts.
        </FormControl.Caption>
      </FormControl>
    </CheckboxGroup>
  )
}
