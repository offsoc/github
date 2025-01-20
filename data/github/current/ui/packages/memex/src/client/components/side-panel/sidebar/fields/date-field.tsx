import {DatePicker} from '@github-ui/date-picker'
import {formatISO} from 'date-fns'
import {useCallback, useMemo} from 'react'

import type {ServerDateValue} from '../../../../api/columns/contracts/date'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {DateValue} from '../../../../api/columns/contracts/storage'
import {ItemValueAdd, ItemValueEdit} from '../../../../api/stats/contracts'
import {asCustomDateString} from '../../../../helpers/parsing'
import {usePostStats} from '../../../../hooks/common/use-post-stats'
import {useUpdateItem} from '../../../../hooks/use-update-item'
import type {DateColumnModel} from '../../../../models/column-model/custom/date'
import {isDateColumnModel} from '../../../../models/column-model/guards'
import {FieldValue} from './core'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {TextValueWithFallback} from './text-value-with-fallback'

export const DateField = (props: SidebarCustomFieldProps<ServerDateValue, DateColumnModel>) => {
  return <SidebarField {...props} renderer={DateRenderer} editor={DateEditor} />
}

const createDateValue = (nextValue: Date | null): DateValue | undefined =>
  nextValue ? {value: new Date(formatISO(nextValue, {representation: 'date'}))} : undefined

const DateEditor = ({
  model,
  columnModel,
  content: serverDateValue,
  onSaved,
}: SidebarFieldEditorProps<ServerDateValue, DateColumnModel>) => {
  const {updateItem} = useUpdateItem()
  const {postStats} = usePostStats()

  const handleUpdate = useCallback(
    async (newValue: Date | null) => {
      if (isDateColumnModel(columnModel)) {
        const currentValue = model.getCustomField<ServerDateValue>(columnModel.id)
        await updateItem(model, {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: columnModel.id,
          value: createDateValue(newValue),
        })
        postStats({
          name: currentValue?.value ? ItemValueEdit : ItemValueAdd,
          memexProjectColumnId: columnModel.id,
          memexProjectItemId: model.id,
        })
        onSaved()
      }
    },
    [columnModel, model, onSaved, postStats, updateItem],
  )

  const dateValue = useMemo(() => {
    // Drop the 'Z' from iso time so that it's parsed as local
    return serverDateValue?.value ? new Date(serverDateValue.value.slice(0, 16)) : null
  }, [serverDateValue])

  return (
    <DatePicker
      onChange={handleUpdate}
      value={dateValue}
      showClearButton
      showTodayButton={false}
      anchor={props => (
        <FieldValue interactable as="button" {...props}>
          <DateRenderer content={serverDateValue} columnModel={columnModel} model={model} />
        </FieldValue>
      )}
    />
  )
}

const DateRenderer = ({
  content: serverDateValue,
  columnModel,
}: SidebarFieldRendererProps<ServerDateValue, DateColumnModel>) => {
  const dateValue = asCustomDateString(serverDateValue) || ''
  return <TextValueWithFallback text={dateValue} columnName={columnModel.name} columnType={columnModel.dataType} />
}
