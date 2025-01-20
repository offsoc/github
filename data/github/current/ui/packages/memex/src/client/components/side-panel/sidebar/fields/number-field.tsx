import {getNumberFieldValidationMessage} from '@github-ui/memex-field-validators'
import {useCallback} from 'react'

import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../../../api/columns/contracts/number'
import {parseNumber} from '../../../../helpers/parsing'
import {useUpdateItem} from '../../../../hooks/use-update-item'
import type {NumberColumnModel} from '../../../../models/column-model/custom/number'
import {Resources} from '../../../../strings'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarTextInput} from './sidebar-text-input'
import {TextValueWithFallback} from './text-value-with-fallback'

export const NumberField = (props: SidebarCustomFieldProps<NumericValue, NumberColumnModel>) => {
  return <SidebarField {...props} renderer={NumberRenderer} editor={NumberEditor} />
}

const NumberEditor = ({
  model,
  columnModel,
  content: numberValue,
  onSaved,
}: SidebarFieldEditorProps<NumericValue, NumberColumnModel>) => {
  const {updateItem} = useUpdateItem()

  const handleUpdate = useCallback(
    async (newValue: string) => {
      if (columnModel.dataType === MemexColumnDataType.Number) {
        await updateItem(model, {
          dataType: MemexColumnDataType.Number,
          memexProjectColumnId: columnModel.id,
          value: newValue !== '' ? {value: parseNumber(newValue)} : undefined,
        })

        onSaved()
      }
    },
    [columnModel, model, onSaved, updateItem],
  )

  return (
    <SidebarTextInput
      submitValue={handleUpdate}
      validationFn={getNumberFieldValidationMessage}
      defaultValue={numberValue?.value?.toString() || ''}
      placeholder={Resources.emptyColumnNameValue.number}
    />
  )
}

const NumberRenderer = ({columnModel, content}: SidebarFieldRendererProps<NumericValue, NumberColumnModel>) => {
  return (
    <TextValueWithFallback
      text={content?.value.toString()}
      columnName={columnModel.name}
      columnType={columnModel.dataType}
    />
  )
}
