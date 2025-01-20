import {memo} from 'react'

import {useVerticalGroupedBy} from '../features/grouping/hooks/use-vertical-grouped-by'
import {canVerticalGroup} from '../models/vertical-group'
import {GroupByMenu, GroupByMenuOptions, type GroupByMenuProps} from './group-by-menu'

/**
 * The control used in the board view to specify the column that is used
 * to group each record.
 */
export const VerticalGroupByMenu = memo<GroupByMenuProps>(function VerticalGroupByMenu({id, open, setOpen, anchorRef}) {
  return (
    <GroupByMenu open={open} setOpen={setOpen} anchorRef={anchorRef}>
      <VerticalGroupByMenuOptions id={id} key={String(open)} setOpen={setOpen} />
    </GroupByMenu>
  )
})

const VerticalGroupByMenuOptions = memo(function VerticalGroupByMenuOptions({
  id,
  setOpen,
}: Pick<GroupByMenuProps, 'id' | 'setOpen'>) {
  const {groupedByColumn, setGroupedBy} = useVerticalGroupedBy()
  return (
    <GroupByMenuOptions
      id={id}
      groupedByColumn={groupedByColumn}
      setGroupedBy={setGroupedBy}
      setOpen={setOpen}
      isValidGroupByColumn={canVerticalGroup}
      title="Column by"
    />
  )
})
