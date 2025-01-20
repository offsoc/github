import {testIdProps} from '@github-ui/test-id-props'
import {ButtonBase} from '@primer/react/lib-esm/Button/ButtonBase'
import isEmpty from 'lodash-es/isEmpty'

import type {SubIssuesProgress} from '../../../api/common-contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {useClickToFilter} from '../../../features/filtering/hooks/use-click-to-filter'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {SubIssuesProgressBar} from '../../fields/sub-issues-progress-bar'
import {BaseCell} from '../cells/base-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'
import {FailedToLoadDataCell} from './tracks-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<SubIssuesProgress>
  model: MemexItemModel
}>

export const LoadingSubIssuesProgressCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={50} maxWidth={100} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const SubIssuesProgressRenderer = withCellRenderer<Props>(function SubIssuesProgressRenderer({
  currentValue,
  model,
}) {
  useRecordCellRenderer('SubIssuesProgressRenderer', model.id)
  const isError = currentValue.state === 'found' && Object.keys(currentValue.value).length === 0
  const onClick = useClickToFilter('parent-issue', model.getNameWithOwnerReference())

  if (isLoading(currentValue)) {
    return <LoadingSubIssuesProgressCell />
  }

  if (isEmpty(currentValue)) {
    return null
  }

  if (isError) {
    return <FailedToLoadDataCell />
  }

  if (model.contentType === ItemType.DraftIssue) {
    return null
  }

  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  if (!columnValue) {
    return null
  }
  // If there aren't any sub-issues, don't render anything.
  if (columnValue.total === 0) {
    return null
  }

  const progressLabel = `Sub-issues progress: ${columnValue.completed} of ${columnValue.total} (${columnValue.percentCompleted}%)`
  const label = `${progressLabel}. Show sub-issues for: ${model.getRawTitle()}`

  return (
    <BaseCell sx={{p: 1}}>
      <ButtonBase
        variant="invisible"
        aria-label={label}
        onClick={onClick}
        sx={{width: '100%', height: '100%', '[data-component="buttonContent"]': {display: 'block'}}}
      >
        <SubIssuesProgressBar
          completed={columnValue.completed}
          consistentContentSizing
          name="Sub-issues progress"
          percentCompleted={columnValue.percentCompleted}
          total={columnValue.total}
        />
      </ButtonBase>
    </BaseCell>
  )
})

SubIssuesProgressRenderer.displayName = 'SubIssuesProgressRenderer'
