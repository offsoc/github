import {Link} from '@github-ui/react-core/link'
import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Button, ButtonGroup, type ButtonProps, Heading, Octicon} from '@primer/react'

import type {PaginationCursor} from '../../types/commits-types'
import {addOrModifyUrlParameters} from '../../utils/add-or-modify-url-parameters'

interface PaginationProps {
  paginationInfo: PaginationCursor
}

export function Pagination({paginationInfo}: PaginationProps) {
  const hasPreviousPage = paginationInfo.hasPreviousPage
  const hasNextPage = paginationInfo.hasNextPage

  const getDisabledProps = (disabled: boolean) => {
    const ariaDisabledProps: Pick<ButtonProps, 'className' | 'onClick' | 'aria-disabled' | 'sx'> = disabled
      ? {
          'aria-disabled': true,
          sx: {
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'default',
            color: 'primer.fg.disabled',
            fontWeight: 'normal',
          },
          onClick: e => e.preventDefault(),
        }
      : {}

    return ariaDisabledProps
  }

  // If there's only one page, don't show pagination
  if (!hasPreviousPage && !hasNextPage) {
    return null
  }

  return (
    <>
      <Heading as="h2" className="sr-only">
        Pagination
      </Heading>

      <div className="d-flex flex-justify-center mt-2">
        <ButtonGroup>
          <Button
            as={Link}
            to={generateCommitPaginationUrl(paginationInfo, false)}
            className="fgColor-accent text-normal"
            {...getDisabledProps(!hasPreviousPage)}
            tabIndex={0}
            variant="invisible"
            data-testid="pagination-prev-button"
            leadingVisual={hasPreviousPage ? () => <Octicon icon={ChevronLeftIcon} className="fgColor-accent" /> : null}
          >
            Previous
          </Button>
          <Button
            as={Link}
            to={generateCommitPaginationUrl(paginationInfo, true)}
            className="fgColor-accent text-normal"
            {...getDisabledProps(!hasNextPage)}
            tabIndex={0}
            variant="invisible"
            data-testid="pagination-next-button"
            trailingVisual={hasNextPage ? () => <Octicon icon={ChevronRightIcon} className="fgColor-accent" /> : null}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </>
  )
}

function generateCommitPaginationUrl(paginationInfo: PaginationCursor, isNext: boolean) {
  let urlRecord: Record<string, string>
  if (isNext) {
    urlRecord = {after: paginationInfo.endCursor}
  } else {
    urlRecord = {before: paginationInfo.startCursor}
  }
  return addOrModifyUrlParameters(urlRecord, [isNext ? 'before' : 'after'])
}
