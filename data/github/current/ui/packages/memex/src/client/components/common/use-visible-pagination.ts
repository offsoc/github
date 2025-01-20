import {useEffect, useMemo, useRef} from 'react'

import {
  isPageTypeForGroupedItems,
  type PageType,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  pageTypeForUngroupedItems,
} from '../../state-providers/memex-items/queries/query-keys'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import useIsVisible from '../board/hooks/use-is-visible'

export const useVisiblePagination = (pageType: PageType) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const {isVisible} = useIsVisible({ref})
  const prevIsVisible = useRef<boolean>(false)
  const {
    isFetchingNextPage,
    isFetchingNextPageForGroupedItems,
    isFetchingNextPageForSecondaryGroups,
    fetchNextPage,
    fetchNextPageForGroupedItems,
    fetchNextPageForSecondaryGroups,
    hasNextPage,
    hasNextPageForGroupedItems,
    hasNextPageForSecondaryGroups,
  } = usePaginatedMemexItemsQuery()

  useEffect(() => {
    // If visibility hasn't changed between renders
    // or the element is not visible, we can return early.
    //
    // This protects against triggering unnecessary requests
    // when a component is re-rendered for reasons other than visibility,
    // E.g., because a pageType object isn't referencially equal or the
    // top-level isFetchingNextPage changes, but the ref is for groupedItems.
    if (prevIsVisible.current === isVisible) return
    prevIsVisible.current = isVisible
    if (!isVisible) return

    if (pageType === pageTypeForGroups || pageType === pageTypeForUngroupedItems) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
    // A secondaryGroupId indicates this is a groupedItem cell (i.e., swimlane cell)
    // which is only paginated on-click, not when it becomes visible.
    if (isPageTypeForGroupedItems(pageType) && !pageType.secondaryGroupId) {
      if (hasNextPageForGroupedItems(pageType) && !isFetchingNextPageForGroupedItems(pageType)) {
        fetchNextPageForGroupedItems(pageType)
      }
    }
    if (pageType === pageTypeForSecondaryGroups) {
      if (hasNextPageForSecondaryGroups && !isFetchingNextPageForSecondaryGroups) {
        fetchNextPageForSecondaryGroups()
      }
    }
  }, [
    isVisible,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    pageType,
    fetchNextPageForGroupedItems,
    hasNextPageForGroupedItems,
    isFetchingNextPageForGroupedItems,
    hasNextPageForSecondaryGroups,
    isFetchingNextPageForSecondaryGroups,
    fetchNextPageForSecondaryGroups,
  ])

  return useMemo(() => {
    let hasNextPageForPageType: boolean = false
    if (pageType === pageTypeForGroups || pageType === pageTypeForUngroupedItems) {
      hasNextPageForPageType = hasNextPage
    }
    if (isPageTypeForGroupedItems(pageType)) {
      hasNextPageForPageType = hasNextPageForGroupedItems(pageType)
    }
    if (pageType === pageTypeForSecondaryGroups) {
      hasNextPageForPageType = hasNextPageForSecondaryGroups
    }
    return {
      ref,
      isVisible,
      hasNextPage: hasNextPageForPageType,
    }
  }, [hasNextPage, hasNextPageForGroupedItems, hasNextPageForSecondaryGroups, isVisible, pageType])
}
