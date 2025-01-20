import {testIdProps} from '@github-ui/test-id-props'

import type {Label} from '../../../api/common-contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {PillPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {DropdownCell} from '../cells/dropdown-cell'
import {LabelGroup} from '../cells/label-group'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<Array<Label>>
  model: MemexItemModel
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}>

export const LoadingLabelsCell = () => (
  <BaseCell>
    <PillPlaceholder minWidth={30} maxWidth={60} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const LabelsRenderer = withCellRenderer<Props>(function LabelsRenderer({
  currentValue,
  model,
  dropdownRef,
  isDisabled,
}) {
  useRecordCellRenderer('LabelsRenderer', model.id)

  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  if (isLoading(currentValue)) {
    return <LoadingLabelsCell />
  }

  if (model.contentType === ItemType.DraftIssue) {
    return <DropdownCell ref={dropdownRef} isDisabled={isDisabled} />
  }

  return <LabelGroup labels={columnValue} dropdownRef={dropdownRef} isDisabled={isDisabled} />
})

LabelsRenderer.displayName = 'LabelsRenderer'
