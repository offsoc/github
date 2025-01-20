import {testIdProps} from '@github-ui/test-id-props'

import {ItemType} from '../../../api/memex-items/item-type'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {AvatarPlaceholder, TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {DropdownCell} from '../cells/dropdown-cell'
import {UserGroup, type UserGroupItem} from '../cells/user-group'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<Array<UserGroupItem>>
  model: MemexItemModel
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}>

export const LoadingAssigneesCell = () => (
  <BaseCell>
    <AvatarPlaceholder {...testIdProps('placeholder')} />
    <TextPlaceholder ml={2} minWidth={30} maxWidth={50} />
  </BaseCell>
)

export const AssigneesRenderer = withCellRenderer<Props>(function AssigneesRenderer({
  currentValue,
  model,
  dropdownRef,
  isDisabled,
}) {
  useRecordCellRenderer('AssigneesRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingAssigneesCell />
  }

  if (hasValue(currentValue)) {
    return (
      <DropdownCell ref={dropdownRef} isDisabled={isDisabled}>
        <UserGroup users={currentValue.value} isDisabled={isDisabled} />
      </DropdownCell>
    )
  }

  if (model.contentType === ItemType.DraftIssue) {
    return <DropdownCell ref={dropdownRef} isDisabled={isDisabled} />
  }

  return null
})

AssigneesRenderer.displayName = 'AssigneesRenderer'
