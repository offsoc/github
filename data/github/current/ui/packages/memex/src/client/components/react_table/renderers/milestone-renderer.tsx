import {testIdProps} from '@github-ui/test-id-props'

import type {Milestone as MilestoneType} from '../../../api/common-contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {DropdownCell} from '../cells/dropdown-cell'
import {Milestone} from '../cells/milestone'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<MilestoneType>
  model: MemexItemModel
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}>

export const LoadingMilestoneCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={50} maxWidth={100} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const MilestoneRenderer = withCellRenderer<Props>(function MilestoneRenderer({
  currentValue,
  model,
  dropdownRef,
  isDisabled,
}) {
  useRecordCellRenderer('MilestoneRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingMilestoneCell />
  }

  if (model.contentType === ItemType.DraftIssue) {
    return <DropdownCell ref={dropdownRef} isDisabled={isDisabled} />
  }

  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  return (
    <DropdownCell ref={dropdownRef} isDisabled={isDisabled}>
      <Milestone milestone={columnValue} isDisabled={isDisabled} />
    </DropdownCell>
  )
})

MilestoneRenderer.displayName = 'MilestoneRenderer'
