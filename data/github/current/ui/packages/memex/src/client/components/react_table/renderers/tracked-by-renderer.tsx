import {testIdProps} from '@github-ui/test-id-props'

import type {Owner} from '../../../api/common-contracts'
import type {TrackedByItem} from '../../../api/issues-graph/contracts'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {PillPlaceholder} from '../../common/placeholders'
import {TrackedByToken} from '../../fields/tracked-by-token'
import {BaseCell} from '../cells/base-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<Array<TrackedByItem>>
  projectOwner?: Owner
  model: MemexItemModel
}>

export const LoadingTrackedByCell = () => (
  <BaseCell>
    <PillPlaceholder minWidth={30} maxWidth={60} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const TrackedByRenderer = withCellRenderer<Props>(({currentValue, model, projectOwner}) => {
  useRecordCellRenderer('TrackedByRenderer', model.id)

  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  if (!columnValue) {
    return null
  }

  return (
    <BaseCell>
      {columnValue.map(value => (
        <TrackedByToken
          key={value.key.itemId}
          trackedBy={value}
          issueId={model.content.id}
          projectOwner={projectOwner}
          noPrefix
        />
      ))}
    </BaseCell>
  )
})

TrackedByRenderer.displayName = 'TrackedByRenderer'
