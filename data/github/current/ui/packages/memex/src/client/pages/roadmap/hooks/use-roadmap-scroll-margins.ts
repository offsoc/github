import {useMemo} from 'react'

import {GROUP_HEADER_HEIGHT} from '../../../components/common/group/styled-group-header'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {useRoadmapHeaderHeight} from './use-roadmap-header-height'

// Used to adjust autoscrolling position during keyboard navigation
export const useRoadmapScrollMargins = () => {
  const headerHeight = useRoadmapHeaderHeight()
  const {groupedByColumnId} = useHorizontalGroupedBy()

  return useMemo(
    () => ({
      scrollMarginTop: `${headerHeight + 1 + (groupedByColumnId ? GROUP_HEADER_HEIGHT : 0)}px`,
      scrollMarginBottom: '64px', // Account for sticky footer
    }),
    [headerHeight, groupedByColumnId],
  )
}
