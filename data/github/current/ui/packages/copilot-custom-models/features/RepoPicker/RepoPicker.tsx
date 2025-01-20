import type {PropsWithChildren} from 'react'
import {HiddenTextInput} from './HiddenTextInput'
import {ListButton} from './ListButton'
import {PickerButton} from './PickerButton'
import {SingleButton} from './SingleButton'
import type {BaseRepo} from './types'
import {SelectedReposProvider} from './SelectedReposProvider'

interface Props extends PropsWithChildren {
  fetchSelected?: () => void
  initialRepoCount?: number
  initialSelected?: BaseRepo[]
  isLoadingSelected?: boolean
}

export function RepoPicker({children, fetchSelected, initialRepoCount = 0, initialSelected, isLoadingSelected}: Props) {
  return (
    <SelectedReposProvider
      fetchSelected={fetchSelected}
      initialRepoCount={initialRepoCount}
      initialSelected={initialSelected}
      isLoadingSelected={isLoadingSelected}
    >
      {children}
    </SelectedReposProvider>
  )
}

RepoPicker.HiddenTextInput = HiddenTextInput
RepoPicker.ListButton = ListButton
RepoPicker.PickerButton = PickerButton
RepoPicker.SingleButton = SingleButton
