import {debounce} from '@github/mini-throttle'
import {SearchIcon} from '@primer/octicons-react'
import {TextInput} from '@primer/react'
import type {Dispatch, SetStateAction} from 'react'
import {useRef} from 'react'
import type {MemberAssignables} from '../../types'

type Props = {
  organization: string
  portalName?: string
  setQuery: Dispatch<SetStateAction<string>>
  assignables: MemberAssignables
}

export function AssignablesSearch(props: Props) {
  const {setQuery} = props
  const inputRef = useRef<HTMLInputElement>(null)
  const searchUsers = async () => {
    const inputText = inputRef.current?.value ?? ''
    setQuery(inputText)
  }
  const debouncedSearchUsers = debounce(searchUsers, 200)

  return (
    <TextInput
      ref={inputRef}
      leadingVisual={SearchIcon}
      name="user"
      onChange={debouncedSearchUsers}
      placeholder="Filter by name or handle"
      aria-label="Filter by name or handle"
      data-testid="member-selection"
      sx={{width: '100%'}}
    />
  )
}
