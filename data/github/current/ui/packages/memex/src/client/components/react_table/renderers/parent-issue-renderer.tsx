import {testIdProps} from '@github-ui/test-id-props'

import type {ParentIssue} from '../../../api/common-contracts'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {ParentIssueToken} from '../../fields/parent-issue-token'
import {BaseCell} from '../cells/base-cell'
import {DropdownCell} from '../cells/dropdown-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<ParentIssue>
  model: MemexItemModel
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}>

export const LoadingParentIssueCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={50} maxWidth={100} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const ParentIssueRenderer = withCellRenderer<Props>(function ParentIssueRenderer({
  currentValue,
  model,
  dropdownRef,
  isDisabled,
}) {
  useRecordCellRenderer('ParentIssueRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingParentIssueCell />
  }

  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  return (
    <DropdownCell ref={dropdownRef} isDisabled={isDisabled}>
      <ParentIssueToken parentIssue={columnValue} />
    </DropdownCell>
  )
})

ParentIssueRenderer.displayName = 'ParentIssueRenderer'
