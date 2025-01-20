import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {TrackedByItem} from '../../../api/issues-graph/contracts'
import type {FieldGrouping, Group} from '../../../features/grouping/types'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useTrackedByItemsContext} from '../../../state-providers/tracked-by-items/use-tracked-by-items-context'
import {TrackedByMissingIssuesButton} from '../../tracked-by/tracked-by-missing-issues-button'
import {BaseCell} from '../cells/base-cell'
import {StyledTableRow} from '../table-row'

type Props = {
  trackedBy: TrackedByItem
}

export function TrackedByMissingIssuesRow({trackedBy}: Props) {
  const {tasklist_block} = useEnabledFeatures()
  const {parentIssuesById} = useTrackedByItemsContext()

  if (!tasklist_block) {
    return null
  }

  const itemsNotInProjectCount = parentIssuesById.get(trackedBy.key.itemId)?.count ?? 0

  return itemsNotInProjectCount === 0 ? null : (
    <>
      <StyledTableRow sx={{borderBottom: '1px solid', borderColor: 'border.muted'}}>
        <BaseCell sx={{pl: '50px'}}>
          <TrackedByMissingIssuesButton trackedBy={trackedBy} />
        </BaseCell>
      </StyledTableRow>
    </>
  )
}

type TrackedByGroup = {
  dataType: typeof MemexColumnDataType.TrackedBy
} & Group<TrackedByItem>

export function isTrackedByGroup(sourceObject: FieldGrouping): sourceObject is TrackedByGroup {
  return sourceObject.dataType === MemexColumnDataType.TrackedBy && sourceObject.kind === 'group'
}
