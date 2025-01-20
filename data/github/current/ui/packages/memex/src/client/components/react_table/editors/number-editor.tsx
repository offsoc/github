import {getNumberFieldValidationMessage} from '@github-ui/memex-field-validators'
import {memo, useCallback} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../../api/columns/contracts/number'
import {parseNumber} from '../../../helpers/parsing'
import {useUpdateItem} from '../../../hooks/use-update-item'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useTableNavigationFocusInitialValue} from '../navigation'
import {TextCellEditor} from './text-cell-editor'

type Props = Readonly<{
  currentValue: ColumnValue<NumericValue>
  columnId: number
  rowId: string
  replaceContents: boolean
  model: MemexItemModel
}>

export const NumberEditor: React.FC<Props> = memo(function NumberEditor(props) {
  const {currentValue, model, columnId, rowId, replaceContents} = props
  const initialValue = useTableNavigationFocusInitialValue()

  const numberValue = hasValue(currentValue) ? currentValue.value : null
  const {updateItem} = useUpdateItem()

  const value = replaceContents || !numberValue ? initialValue : numberValue.value

  const handleUpdate = useCallback(
    (newValue: string) => {
      const prevNumberValue = numberValue?.value
      let numericValue: NumericValue | undefined = undefined

      if (newValue !== '') {
        const number = parseNumber(newValue)
        if (!Number.isNaN(number)) {
          numericValue = {value: number}
        } else if (prevNumberValue != null) {
          numericValue = {value: prevNumberValue}
        }
      }

      updateItem(model, {
        dataType: MemexColumnDataType.Number,
        memexProjectColumnId: columnId,
        value: numericValue,
      })

      return true
    },
    [columnId, model, numberValue?.value, updateItem],
  )

  return (
    <TextCellEditor
      model={model}
      columnId={columnId}
      rowId={rowId}
      defaultValue={value}
      onUpdate={handleUpdate}
      validationFn={getNumberFieldValidationMessage}
      align="right"
      emojiPickerDisabled
    />
  )
})

NumberEditor.displayName = 'NumberEditor'
