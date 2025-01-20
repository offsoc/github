import {TextInput, type TextInputProps} from '@primer/react'
import {useMemo} from 'react'
import {useSelectedRepos} from './SelectedReposProvider'

export function HiddenTextInput(props: TextInputProps) {
  const {selected} = useSelectedRepos()

  const value = useMemo(() => [...new Set((selected ?? []).map(r => r.nameWithOwner))], [selected])

  // The backend differentiates between an empty array and null, and since inputs cannot have a null value,
  // the only way to provide null when running `new FormData` is to have the input not exist.
  if (!selected) return null
  return <TextInput name="repository_nwos" readOnly sx={{display: 'none', ...props.sx}} value={value} {...props} />
}
