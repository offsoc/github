import {memo, useCallback, useMemo} from 'react'

import type {SuggestedAssignee} from '../../../api/memex-items/contracts'
import {filterSuggestedAssignees} from '../../../helpers/assignee-suggester'
import {convertOptionToItem, getLogin, useAssigneesEditor} from '../../../hooks/editors/use-assignees-editor'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {UserGroupItem} from '../cells/user-group'
import {useRecordCellEditor} from '../performance-measurements'
import {AssigneesRenderer} from '../renderers/assignees-renderer'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<Array<UserGroupItem>>
}

const AssigneesEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({
  currentValue,
  model,
  columnId,
  ...props
}) => {
  useRecordCellEditor('AssigneesEditor', model.id)

  const {fetchOptions, saveSelected} = useAssigneesEditor({model})

  const selected = useMemo(() => {
    const assignees = hasValue(currentValue) ? currentValue.value : []
    return assignees as Array<SuggestedAssignee>
  }, [currentValue])

  const renderButton = useCallback(() => {
    return <AssigneesRenderer currentValue={currentValue} model={model} />
  }, [currentValue, model])

  return (
    <SelectPanelEditor<SuggestedAssignee>
      model={model}
      placeholderText="Search people"
      selected={selected}
      fetchOptions={fetchOptions}
      filterOptions={filterSuggestedAssignees}
      getSortAttribute={getLogin}
      convertOptionToItem={convertOptionToItem}
      saveSelected={saveSelected}
      renderButton={renderButton}
      columnId={columnId}
      groupMetadata={[
        {groupId: 'assigned'},
        {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}},
      ]}
      {...props}
    />
  )
}

export const AssigneesEditor = memo(AssigneesEditorFunc)

AssigneesEditor.displayName = 'AssigneesEditor'
