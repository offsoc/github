import {useCallback} from 'react'
import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'

interface Props {
  prevCursor: string | undefined
  nextCursor: string | undefined
  onCursorChange: (newCursor: Cursor) => void
}

type Cursor =
  | {
      before: string
    }
  | {
      after: string
    }

export function PrevNextPagination({prevCursor, nextCursor, onCursorChange}: Props): JSX.Element {
  const previousButtonDisabled = !prevCursor
  const nextButtonDisabled = !nextCursor

  const handlePreviousButtonClick = useCallback(() => {
    if (!prevCursor) {
      return
    }

    onCursorChange({
      before: prevCursor,
    })
  }, [onCursorChange, prevCursor])
  const handleNextButtonClick = useCallback(() => {
    if (!nextCursor) {
      return
    }

    onCursorChange({
      after: nextCursor,
    })
  }, [onCursorChange, nextCursor])

  return (
    <Box sx={{display: 'flex', justifyContent: 'center'}}>
      <Button variant="invisible" disabled={previousButtonDisabled} onClick={handlePreviousButtonClick}>
        <ChevronLeftIcon />
        <Text sx={{ml: 2}}>Previous</Text>
      </Button>
      <Button
        variant="invisible"
        className={nextButtonDisabled ? '' : 'fgColor-accent'}
        disabled={nextButtonDisabled}
        trailingVisual={ChevronRightIcon}
        onClick={handleNextButtonClick}
      >
        Next
      </Button>
    </Box>
  )
}
