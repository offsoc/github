import {getTextFieldValidationMessage} from '@github-ui/memex-field-validators'
import {memo, useCallback} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {EnrichedText} from '../../../api/columns/contracts/text'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {useUpdateItem} from '../../../hooks/use-update-item'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useTableNavigationFocusInitialValue} from '../navigation'
import {TextCellEditor} from './text-cell-editor'

type Props = Readonly<{
  currentValue: ColumnValue<EnrichedText>
  columnId: number
  rowId: string
  replaceContents: boolean
  model: MemexItemModel
}>

export const TextEditor: React.FC<Props> = memo(function TextEditor(props) {
  const {currentValue, model, rowId, columnId} = props
  const initialValue = useTableNavigationFocusInitialValue()

  const textValue = hasValue(currentValue) ? currentValue.value.raw : ''
  const {updateItem} = useUpdateItem()

  const value = props.replaceContents || !textValue ? initialValue : textValue

  const handleUpdate = useCallback(
    (nextValue: string) => {
      updateItem(model, {
        dataType: MemexColumnDataType.Text,
        memexProjectColumnId: columnId,
        value: replaceShortCodesWithEmojis(nextValue),
      })

      return true
    },
    [columnId, model, updateItem],
  )

  return (
    <TextCellEditor
      model={model}
      columnId={columnId}
      rowId={rowId}
      defaultValue={value}
      onUpdate={handleUpdate}
      validationFn={getTextFieldValidationMessage}
    />
  )
})

TextEditor.displayName = 'TextEditor'
