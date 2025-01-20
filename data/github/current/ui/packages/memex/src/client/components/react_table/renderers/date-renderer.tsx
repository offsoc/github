import {testIdProps} from '@github-ui/test-id-props'

import type {DateValue} from '../../../api/columns/contracts/storage'
import {formatDateString} from '../../../helpers/parsing'
import {type ColumnValue, isEmpty, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {TextCell} from '../cells/text-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<DateValue>
  model: MemexItemModel
  isDisabled?: boolean
}>

export const LoadingDateCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={80} maxWidth={100} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const DateRenderer = withCellRenderer<Props>(function DateRenderer({currentValue, model, isDisabled}) {
  useRecordCellRenderer('DateRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingDateCell />
  }

  if (isEmpty(currentValue)) {
    return null
  }

  const dateString = formatDateString(currentValue.value.value)

  return (
    <BaseCell sx={{justifyContent: 'flex-start'}}>
      <TextCell dangerousHtml={dateString} isDisabled={isDisabled} />
    </BaseCell>
  )
})
