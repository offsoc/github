import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button} from '@primer/react'
import {clsx} from 'clsx'
import {memo, useCallback, useMemo} from 'react'

import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {
  isPageTypeForGroupedItems,
  type PageType,
  type PageTypeForGroupedItems,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  type PageTypeForUngroupedItems,
} from '../../state-providers/memex-items/queries/query-keys'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {StyledGroupHeader} from '../common/group/styled-group-header'
import {TextPlaceholder} from '../common/placeholders'
import {useVisiblePagination} from '../common/use-visible-pagination'
import {CardBaseWithSash} from './card/card-base-with-sash'
import {ColumnFrame} from './column/column-frame'
import {COLUMN_STYLE, HORIZONTAL_GROUP_CONTAINER_STYLE} from './constants'

export const PLACEHOLDER_CARD_COUNT = 5
const PLACEHOLDER_COLUMN_COUNT = 5

export const BoardPagination: React.FC<{pageType: Exclude<PageType, PageTypeForUngroupedItems>}> = ({pageType}) => {
  const {memex_mwl_swimlanes} = useEnabledFeatures()

  if (isPageTypeForGroupedItems(pageType)) {
    if (memex_mwl_swimlanes && pageType.secondaryGroupId) {
      return <CellCardsPagination groupId={pageType.groupId} secondaryGroupId={pageType.secondaryGroupId} />
    }
    return <ColumnCardsPagination groupId={pageType.groupId} />
  }
  if (memex_mwl_swimlanes && pageType === pageTypeForSecondaryGroups) {
    return <HorizontalGroupsPagination />
  }
  if (pageType === pageTypeForGroups) {
    return <ColumnsPagination />
  }
  return null
}

/** Paginator for vertical groups (i.e., columns) */
export const ColumnsPagination: React.FC<{headerType?: string}> = ({headerType = 'visible'}) => {
  const {ref, hasNextPage} = useVisiblePagination(pageTypeForGroups)
  const {queriesForSecondaryGroups} = usePaginatedMemexItemsQuery()

  let placeholder = <PlaceholderColumn headerType={headerType} />
  if (queriesForSecondaryGroups.length > 0) {
    placeholder = <Box sx={HORIZONTAL_GROUP_CONTAINER_STYLE}>{placeholder}</Box>
  }
  return (
    <Box ref={ref} {...testIdProps('board-pagination-vertical')} sx={{display: 'flex'}}>
      {hasNextPage ? placeholder : null}
    </Box>
  )
}

/** Paginator for horizontal groups (i.e., swimlanes) */
const HorizontalGroupsPagination: React.FC = () => {
  const {ref, hasNextPage} = useVisiblePagination(pageTypeForSecondaryGroups)
  const {queriesForGroups} = usePaginatedMemexItemsQuery()
  let columnCount = queriesForGroups.flatMap(query => query.data?.groups).length
  if (queriesForGroups[queriesForGroups.length - 1]?.data?.pageInfo?.hasNextPage) {
    columnCount += 1
  }
  return (
    <div ref={ref} {...testIdProps('board-pagination-horizontal')}>
      {hasNextPage ? <PlaceholderHorizontalGroup columnCount={columnCount} /> : null}
    </div>
  )
}

/** Paginator for items in a vertical group (column) */
const ColumnCardsPagination: React.FC<{groupId: string}> = ({groupId}) => {
  const {ref, hasNextPage} = useVisiblePagination({groupId})
  return (
    <div ref={ref} {...testIdProps(`board-pagination-${groupId}`)}>
      {hasNextPage ? <PlaceholderCard /> : null}
    </div>
  )
}

/** Paginator for items in a specific "cell", i.e. the intersection of a vertical and horizontal group */
const CellCardsPagination: React.FC<{groupId: string; secondaryGroupId: string}> = ({groupId, secondaryGroupId}) => {
  const {ref, isVisible} = useVisiblePagination({groupId, secondaryGroupId})
  const {
    hasNextPageForGroupedItems,
    isFetchingNextPageForGroupedItems,
    fetchNextPageForGroupedItems,
    hasDataForGroupedItemsBatch,
    isFetchingGroupedItemsBatch,
    fetchGroupedItemsBatch,
  } = usePaginatedMemexItemsQuery()

  const pageType: PageTypeForGroupedItems = useMemo(() => ({groupId, secondaryGroupId}), [groupId, secondaryGroupId])
  const hasNextPage = hasNextPageForGroupedItems(pageType)

  const loadMoreItemsOnClick = useCallback(() => {
    fetchNextPageForGroupedItems(pageType)
  }, [fetchNextPageForGroupedItems, pageType])

  const isFetchingBatch = isFetchingGroupedItemsBatch(groupId, secondaryGroupId)
  const isFetchingNextPage = isFetchingNextPageForGroupedItems(pageType)

  // Load more items in a specific groupedItems cell
  const loadMoreButton = hasNextPage ? (
    <Button onClick={loadMoreItemsOnClick} disabled={isFetchingNextPage}>
      Load more items
    </Button>
  ) : null

  if (isVisible && !hasDataForGroupedItemsBatch(groupId, secondaryGroupId)) {
    if (!isFetchingBatch) {
      // Load a batch of groupedItems (i.e. a page of cells)
      fetchGroupedItemsBatch(groupId, secondaryGroupId)
    }
  }

  return (
    <div ref={ref} {...testIdProps(`board-pagination-${groupId}-${secondaryGroupId}`)}>
      {isFetchingNextPage || isFetchingBatch ? <PlaceholderCard /> : null}
      {loadMoreButton}
    </div>
  )
}

const PlaceholderCardUnmemoized: React.FC = () => {
  return (
    <CardBaseWithSash
      {...testIdProps('placeholder-card')}
      className="board-view-column-card"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        backgroundColor: 'canvas.overlay',
        borderColor: 'border.default',
        borderStyle: 'solid',
        borderRadius: 2,
        borderWidth: '1px',
      }}
    >
      {[...Array(PLACEHOLDER_CARD_COUNT).keys()].map(key => (
        <TextPlaceholder style={{height: 8}} key={key} minWidth={80} maxWidth={200} {...testIdProps('placeholder')} />
      ))}
    </CardBaseWithSash>
  )
}

const PlaceholderColumnUnmemoized: React.FC<{headerType?: string}> = ({headerType = 'visible'}) => {
  return (
    <ColumnFrame
      sx={{
        ...COLUMN_STYLE,
        p: 2,
        gap: 2,
      }}
      className={headerType}
      headerContent={
        headerType !== 'hidden' ? (
          <TextPlaceholder
            style={{height: 16, marginTop: 4}}
            minWidth={80}
            maxWidth={200}
            {...testIdProps('placeholder-column-header')}
          />
        ) : null
      }
    >
      {headerType === 'only' ? null : <PlaceholderCard />}
    </ColumnFrame>
  )
}

const PlaceholderHorizontalGroupUnmemoized: React.FC<{columnCount?: number}> = ({
  columnCount = PLACEHOLDER_COLUMN_COUNT,
}) => {
  return (
    <>
      <StyledGroupHeader className={clsx('board', 'sticky')}>
        <TextPlaceholder
          style={{height: 12}}
          minWidth={80}
          maxWidth={200}
          {...testIdProps('placeholder-horizontal-group-header')}
        />
      </StyledGroupHeader>
      <Box sx={HORIZONTAL_GROUP_CONTAINER_STYLE}>
        {[...Array(columnCount).keys()].map(key => (
          <PlaceholderColumnUnmemoized key={key} headerType={'hidden'} />
        ))}
      </Box>
    </>
  )
}

const PlaceholderCard = memo(PlaceholderCardUnmemoized)
const PlaceholderColumn = memo(PlaceholderColumnUnmemoized)
const PlaceholderHorizontalGroup = memo(PlaceholderHorizontalGroupUnmemoized)
