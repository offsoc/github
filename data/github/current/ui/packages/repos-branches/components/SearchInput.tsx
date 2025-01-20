import {useRef, useState} from 'react'
import {useSearchParams, useNavigate} from '@github-ui/use-navigate'
import {FormControl, TextInput} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {SearchIcon} from '@primer/octicons-react'
import {debounce} from '@github/mini-throttle'
import type {BranchPageType} from '../types'
import useBranchTabPath from '../hooks/use-branch-tab-path'

type SearchInputProps = {
  onChange?: (newValue: string) => void
  selectedPage: BranchPageType
  sx?: BetterSystemStyleObject
}

export default function SearchInput({onChange, selectedPage, sx = {}}: SearchInputProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchFocusedRef = useRef<boolean>(false)
  const [filter, setFilter] = useState(searchParams.get('query') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const getBranchTabPath = useBranchTabPath()

  const debouncedOnChange = useRef(
    debounce((newValue: string) => {
      onChange?.(newValue)
      if (selectedPage !== 'all') {
        navigate(
          `${getBranchTabPath('all')}?query=${encodeURIComponent(newValue)}&lastTab=${encodeURIComponent(
            selectedPage,
          )}`,
          {replace: true},
        )
      } else if (searchParams.get('lastTab') && !newValue) {
        navigate(`${getBranchTabPath(searchParams.get('lastTab') as BranchPageType)}?query=`, {replace: true})
      } else {
        setSearchParams({query: newValue}, {replace: true})
      }
    }, 250),
  )

  return (
    <FormControl sx={sx}>
      <FormControl.Label visuallyHidden>Search</FormControl.Label>
      <TextInput
        value={filter}
        ref={inputRef}
        placeholder="Search branches..."
        leadingVisual={SearchIcon}
        onChange={event => {
          setFilter(event.target.value)
          debouncedOnChange.current(event.target.value)
        }}
        block
        onFocus={() => (searchFocusedRef.current = true)}
        onBlur={() => (searchFocusedRef.current = false)}
        data-react-autofocus={searchFocusedRef.current}
      />
    </FormControl>
  )
}
