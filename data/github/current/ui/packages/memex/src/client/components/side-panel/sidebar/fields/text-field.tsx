import {useCallback} from 'react'

import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {EnrichedText} from '../../../../api/columns/contracts/text'
import {replaceShortCodesWithEmojis} from '../../../../helpers/emojis'
import {useUpdateItem} from '../../../../hooks/use-update-item'
import type {TextColumnModel} from '../../../../models/column-model/custom/text'
import {Resources} from '../../../../strings'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarTextInput} from './sidebar-text-input'
import {TextValueWithFallback} from './text-value-with-fallback'

export const TextField = (props: SidebarCustomFieldProps<EnrichedText, TextColumnModel>) => {
  return <SidebarField {...props} renderer={TextRenderer} editor={TextEditor} />
}

const TextEditor = ({
  model,
  columnModel,
  content: textValue,
  onSaved,
}: SidebarFieldEditorProps<EnrichedText, TextColumnModel>) => {
  const {updateItem} = useUpdateItem()

  const handleUpdate = useCallback(
    async (newValue: string) => {
      if (columnModel.dataType === MemexColumnDataType.Text) {
        await updateItem(model, {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: columnModel.id,
          value: replaceShortCodesWithEmojis(newValue),
        })
        if (onSaved) {
          onSaved()
        }
      }
    },
    [columnModel, model, onSaved, updateItem],
  )

  return (
    <SidebarTextInput
      withEmojiPicker
      submitValue={handleUpdate}
      defaultValue={textValue?.raw || ''}
      placeholder={Resources.emptyColumnNameValue.text}
    />
  )
}

const TextRenderer = ({columnModel, content: textValue}: SidebarFieldRendererProps<EnrichedText, TextColumnModel>) => {
  return (
    <TextValueWithFallback
      dangerousHtml={textValue?.html}
      columnName={columnModel.name}
      columnType={columnModel.dataType}
    />
  )
}
