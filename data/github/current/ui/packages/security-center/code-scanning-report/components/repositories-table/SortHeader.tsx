import {SortAscIcon, SortDescIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {type PropsWithChildren, useCallback, useMemo} from 'react'

export type SortDirection = 'asc' | 'desc'

export type Sort<Row> = {
  field: keyof Row
  direction: SortDirection
}

interface SortHeaderProps<Row> {
  field: keyof Row
  sort: Sort<Row>
  onSortChange: (sort: Sort<Row>) => void
}
export default function SortHeader<Row = unknown>({
  field,
  sort,
  onSortChange,
  children,
}: PropsWithChildren<SortHeaderProps<Row>>): JSX.Element {
  const handleButtonClick = useCallback(() => {
    // If we're currently sorted by this field, toggle the direction
    // Otherwise default to DESC for newly-sorted field
    const direction = sort.field === field ? (sort.direction === 'desc' ? 'asc' : 'desc') : 'desc'
    onSortChange({field, direction})
  }, [field, sort, onSortChange])

  const sortIcon = useMemo(() => {
    if (sort.field === field) {
      if (sort.direction === 'asc') {
        return (
          <div data-testid="sort-icon-asc">
            <SortAscIcon />
          </div>
        )
      }

      if (sort.direction === 'desc') {
        return (
          <div data-testid="sort-icon-desc">
            <SortDescIcon />
          </div>
        )
      }

      return <></>
    }
  }, [field, sort])

  return (
    <>
      <Button
        data-testid="sort-button"
        variant="invisible"
        onClick={handleButtonClick}
        sx={{
          margin: -2,
          px: 1,
          py: 0,
          // If we're sorted by this field, use Button's default color (darker)
          // Otherwise, inherit Table's color
          color: sort.field === field ? undefined : 'inherit',
          font: 'inherit',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            textAlign: 'start',
            alignItems: 'center',
            columnGap: '0.5rem',
          }}
        >
          {sortIcon}
          {children}
        </Box>
      </Button>
    </>
  )
}
