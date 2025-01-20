import type {PaginationProps} from '@primer/react'
import {Box, Text, Pagination} from '@primer/react'

type onPageChangeType = PaginationProps['onPageChange']

interface Props {
  pageSize?: number
  pageCount: number
  currentPage: number
  onPageChange: onPageChangeType
  totalResources: number
}

export default function ResourcePaginator({
  pageSize = 10,
  pageCount,
  currentPage,
  totalResources,
  onPageChange,
}: Props) {
  return (
    <>
      {totalResources > pageSize && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopColor: 'border.default',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            marginTop: '12px',
          }}
          data-testid="pagination-wrapper"
        >
          <Text as="p" sx={{mb: 0, color: 'fg.muted', fontSize: 1}} data-testid="pagination-page-text">
            {currentPage === 1 ? 1 : (currentPage - 1) * pageSize + 1}-{currentPage * pageSize} of {totalResources}
          </Text>
          <Pagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={onPageChange}
            aria-label="Cost center resource pagination"
          />
        </Box>
      )}
    </>
  )
}
