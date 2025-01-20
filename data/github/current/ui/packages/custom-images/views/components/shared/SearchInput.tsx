import {Box, TextInput} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'

interface Props {
  onSetSearchQuery: (query: string) => void
}

export default function SearchInput({onSetSearchQuery}: Props) {
  return (
    <Box sx={{mb: 3}}>
      <TextInput
        block
        leadingVisual={SearchIcon}
        aria-label="Custom Images Search Input"
        placeholder="Search custom images"
        onChange={e => onSetSearchQuery(e.target.value)}
        data-testid="custom-images-search-input"
      />
    </Box>
  )
}
