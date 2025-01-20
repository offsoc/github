import {testIdProps} from '@github-ui/test-id-props'

import type {EnrichedText} from '../../../api/columns/contracts/text'
import {type ColumnValue, isEmpty, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {TextCell} from '../cells/text-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<EnrichedText>
  model: MemexItemModel
  isDisabled?: boolean
}>

export const LoadingTextCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={80} maxWidth={200} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const TextRenderer = withCellRenderer<Props>(function TextRenderer({currentValue, model, isDisabled}) {
  useRecordCellRenderer('TextRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingTextCell />
  }

  if (isEmpty(currentValue)) {
    return null
  }

  return (
    <BaseCell>
      <TextCell dangerousHtml={currentValue.value.html} isDisabled={isDisabled} />
    </BaseCell>
  )
})

TextRenderer.displayName = 'TextRenderer'
