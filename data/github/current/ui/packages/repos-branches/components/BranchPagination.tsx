import {Box, Pagination} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import type {ListPayload} from '../routes/List'

export default function BranchPagination({sx = {}}: {sx?: BetterSystemStyleObject}) {
  const {current_page, has_more} = useRoutePayload<ListPayload>()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageCount = has_more ? current_page + 1 : current_page

  if (current_page === 1 && pageCount === 1) {
    return null
  }

  return (
    <Box sx={sx}>
      <Pagination
        pageCount={pageCount}
        currentPage={current_page}
        onPageChange={(e, newPage) => {
          e.preventDefault()
          if (current_page !== newPage) {
            searchParams.set('page', `${newPage}`)
            setSearchParams(searchParams)
          }
        }}
        showPages={false}
      />
    </Box>
  )
}
