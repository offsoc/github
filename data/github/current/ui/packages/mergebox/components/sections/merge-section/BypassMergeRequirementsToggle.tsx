import {Checkbox, FormControl} from '@primer/react'

export function BypassMergeRequirementsToggle({
  checked,
  onToggleChecked,
}: {
  checked: boolean
  onToggleChecked: () => void
}) {
  return (
    <FormControl>
      <Checkbox onChange={onToggleChecked} checked={checked} />
      <FormControl.Label>
        <span className="fgColor-danger"> Merge without waiting for requirements to be met (bypass rules) </span>
      </FormControl.Label>
    </FormControl>
  )
}
