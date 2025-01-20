import {testIdProps} from '@github-ui/test-id-props'

import {type ColumnValue, isEmpty, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {TextCell} from '../cells/text-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<string>
  model: MemexItemModel
  isDisabled?: boolean
}>

export const LoadingNumberCell = () => (
  <BaseCell sx={{justifyContent: 'flex-end'}}>
    <TextPlaceholder minWidth={20} maxWidth={30} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const NumberRenderer = withCellRenderer<Props>(function NumberRenderer({currentValue, model, isDisabled}) {
  useRecordCellRenderer('NumberRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingNumberCell />
  }

  if (isEmpty(currentValue)) {
    return null
  }

  return (
    <BaseCell sx={{justifyContent: 'flex-end'}}>
      <TextCell dangerousHtml={currentValue.value} isDisabled={isDisabled} />
    </BaseCell>
  )
})

NumberRenderer.displayName = 'NumberRenderer'
