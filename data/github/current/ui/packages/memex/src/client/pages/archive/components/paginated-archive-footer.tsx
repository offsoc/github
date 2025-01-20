import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, Button, Octicon} from '@primer/react'

function ArchiveFooterWrapper({children}: {children: React.ReactNode}) {
  return (
    <Box
      sx={{
        bg: 'canvas.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
      }}
    >
      <Box
        sx={{
          p: 2,
          pl: 4,
          pr: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50px',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

type PaginatedArchiveFooterProps = {
  onFetchNextPage?: () => void
  onFetchPreviousPage?: () => void
  hasResults: boolean
  mutationIsLoading: boolean
}

export function PaginatedArchiveFooter({
  hasResults,
  onFetchNextPage,
  onFetchPreviousPage,
  mutationIsLoading,
}: PaginatedArchiveFooterProps) {
  if (!hasResults) return null

  const hasPreviousPage = onFetchPreviousPage && !mutationIsLoading
  const hasNextPage = onFetchNextPage && !mutationIsLoading

  return (
    <ArchiveFooterWrapper>
      <Box sx={{display: 'flex'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <Button disabled={!hasPreviousPage} onClick={onFetchPreviousPage}>
            {hasPreviousPage && <Octicon icon={ChevronLeftIcon} />} Previous
          </Button>
          <Button disabled={!hasNextPage} onClick={onFetchNextPage}>
            Next {hasNextPage && <Octicon icon={ChevronRightIcon} />}
          </Button>
        </Box>
      </Box>
    </ArchiveFooterWrapper>
  )
}
