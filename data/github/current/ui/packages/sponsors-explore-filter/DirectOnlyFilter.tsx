import {testIdProps} from '@github-ui/test-id-props'
import {Checkbox, FormControl} from '@primer/react'

export interface DirectOnlyFilterProps {
  directOnlyFilter: boolean
  setDirectOnlyFilter: (directDependenciesOnly: boolean) => void
}

export function DirectOnlyFilter({directOnlyFilter, setDirectOnlyFilter}: DirectOnlyFilterProps) {
  const onDirectOnlyChange = (directOnly: boolean) => {
    setDirectOnlyFilter(!directOnly)
  }
  const key = 'direct-only'

  return (
    <FormControl key={key}>
      <Checkbox
        onChange={() => onDirectOnlyChange(directOnlyFilter)}
        checked={directOnlyFilter}
        {...testIdProps(`${key}-checkbox`)}
      />
      <FormControl.Label>Direct dependencies only</FormControl.Label>
    </FormControl>
  )
}
