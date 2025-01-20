import {memo, useCallback} from 'react'

import {useHorizontalGroupedBy} from '../../features/grouping/hooks/use-horizontal-grouped-by'
import {isValidHorizontalGroupByColumn} from '../../features/grouping/utils'
import {useViews} from '../../hooks/use-views'
import {GroupByMenu, GroupByMenuOptions, type GroupByMenuProps} from '../group-by-menu'

/**
 * The control used in the roadmap view to specify the column that is used
 * to group each record.
 */
export const RoadmapGroupByMenu = memo<GroupByMenuProps>(function RoadmapGroupByMenu({id, open, setOpen, anchorRef}) {
  return (
    <GroupByMenu open={open} setOpen={setOpen} anchorRef={anchorRef}>
      <RoadmapGroupByMenuOptions id={id} key={String(open)} setOpen={setOpen} />
    </GroupByMenu>
  )
})

const RoadmapGroupByMenuOptions = memo(function RoadmapGroupByMenuOptions({
  setOpen,
  id,
}: Pick<GroupByMenuProps, 'setOpen' | 'id'>) {
  const {groupedByColumn, setGroupedBy, clearGroupedBy} = useHorizontalGroupedBy()
  const {currentView} = useViews()
  const handleClearGroupBy = useCallback(() => {
    if (currentView) clearGroupedBy(currentView.number)
    setOpen(false)
  }, [clearGroupedBy, currentView, setOpen])

  return (
    <GroupByMenuOptions
      id={id}
      groupedByColumn={groupedByColumn}
      setGroupedBy={setGroupedBy}
      isValidGroupByColumn={isValidHorizontalGroupByColumn}
      handleClearGroupBy={handleClearGroupBy}
      title="Group by"
      setOpen={setOpen}
    />
  )
})
