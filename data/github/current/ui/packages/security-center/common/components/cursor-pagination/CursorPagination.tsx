import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'

interface Props {
  previousCursor?: string
  nextCursor?: string
  onPageChange: (newCursor?: string) => void
}

export function CursorPagination({previousCursor, nextCursor, onPageChange}: Props): JSX.Element {
  const nextButtonDisabled = !nextCursor
  return (
    <Box sx={{display: 'flex', justifyContent: 'center'}}>
      <Button variant="invisible" disabled={!previousCursor} onClick={() => onPageChange(previousCursor)}>
        {/* Icon is separated instead of using leadingIcon prop cuz prop version is gray for some reason */}
        <ChevronLeftIcon />
        <Text sx={{ml: 2}}>Previous</Text>
      </Button>
      <Button
        variant="invisible"
        className={nextButtonDisabled ? '' : 'fgColor-accent'}
        disabled={nextButtonDisabled}
        trailingVisual={ChevronRightIcon}
        onClick={() => onPageChange(nextCursor)}
      >
        Next
      </Button>
    </Box>
  )
}
