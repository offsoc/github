import {Checkbox, FormControl} from '@primer/react'
import type {Index, PolicyFormWrapper} from '../../types'
import {PolicyHeader} from './PolicyHeader'
import {PolicyContent} from './PolicyContent'

function PolicyOptionCheckbox({
  title,
  description,
  checked,
  disabled,
  setChecked,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  setChecked: (checked: boolean) => void
}) {
  return (
    <PolicyContent>
      <FormControl>
        <Checkbox checked={checked} onChange={() => setChecked(!checked)} disabled={disabled} />
        <FormControl.Label>{title}</FormControl.Label>
        <FormControl.Caption>{description}</FormControl.Caption>
      </FormControl>
    </PolicyContent>
  )
}

export const ActionCreatorPolicy: React.FC<PolicyFormWrapper & Index> = ({form, setPolicyForm, idx}) => {
  const {allowCreatedByGitHub, allowVerifiedCreator, specifiedActionsDisabled} = form
  return (
    <PolicyHeader title="Filter by author" idx={idx}>
      <PolicyOptionCheckbox
        title="Created by GitHub"
        description="Allow actions created by GitHub under the actions and github organizations."
        checked={allowCreatedByGitHub}
        disabled={specifiedActionsDisabled}
        setChecked={() => {
          setPolicyForm({
            ...form,
            allowCreatedByGitHub: !allowCreatedByGitHub,
          })
        }}
      />
      <PolicyOptionCheckbox
        title="Verified creator"
        description="Allow actions with the verified badge."
        checked={allowVerifiedCreator}
        disabled={specifiedActionsDisabled}
        setChecked={() => {
          setPolicyForm({
            ...form,
            allowVerifiedCreator: !allowVerifiedCreator,
          })
        }}
      />
    </PolicyHeader>
  )
}
