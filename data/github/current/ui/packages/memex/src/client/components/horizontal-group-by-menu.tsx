import {memo, useCallback} from 'react'

import {useHorizontalGroupedBy} from '../features/grouping/hooks/use-horizontal-grouped-by'
import {isValidHorizontalGroupByColumn} from '../features/grouping/utils'
import {useViews} from '../hooks/use-views'
import {GroupByMenu, GroupByMenuOptions, type GroupByMenuProps} from './group-by-menu'

/**
 * The control used in the table/board view to specify the column that is used
 * to group each record horizontally.
 */
export const HorizontalGroupByMenu = memo<GroupByMenuProps>(function HorizontalGroupByMenu({
  id,
  open,
  setOpen,
  anchorRef,
}) {
  return (
    <GroupByMenu open={open} setOpen={setOpen} anchorRef={anchorRef}>
      <HorizontalGroupByMenuOptions id={id} key={String(open)} setOpen={setOpen} />
    </GroupByMenu>
  )
})

const HorizontalGroupByMenuOptions = memo(function HorizontalGroupByMenuOptions({
  id,
  setOpen,
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
