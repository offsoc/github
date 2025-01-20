import {memo, useCallback, useMemo} from 'react'

import type {IssueType} from '../../../api/common-contracts'
import type {SuggestedIssueType} from '../../../api/memex-items/contracts'
import {filterSuggestedIssueTypes} from '../../../helpers/issue-type-suggester'
import {convertOptionToItem, getName, useIssueTypeEditor} from '../../../hooks/editors/use-issue-type-editor'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import {useRecordCellEditor} from '../performance-measurements'
import {IssueTypeRenderer} from '../renderers'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<IssueType>
}

const IssueTypeEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({currentValue, model, ...props}) => {
  useRecordCellEditor('IssueTypeEditor', model.id)

  const {fetchOptions, saveSelected} = useIssueTypeEditor({model})

  const selected = useMemo(() => {
    const issueType = hasValue(currentValue) ? [currentValue.value] : []
    return issueType as Array<SuggestedIssueType>
  }, [currentValue])

  const renderButton = useCallback(() => {
    return <IssueTypeRenderer currentValue={currentValue} model={model} />
  }, [currentValue, model])

  return (
    <SelectPanelEditor<SuggestedIssueType>
      model={model}
      placeholderText="Search types"
      blankslateText="No types to show."
      selected={selected}
      fetchOptions={fetchOptions}
      filterOptions={filterSuggestedIssueTypes}
      getSortAttribute={getName}
      convertOptionToItem={convertOptionToItem}
      saveSelected={saveSelected}
      renderButton={renderButton}
      {...props}
      singleSelect
      height="auto"
      maxHeight="large"
    />
  )
}

export const IssueTypeEditor = memo(IssueTypeEditorFunc)
