import {memo, useCallback, useMemo} from 'react'

import type {Label} from '../../../api/common-contracts'
import type {SuggestedLabel} from '../../../api/memex-items/contracts'
import {filterSuggestedLabels} from '../../../helpers/label-suggester'
import {convertOptionToItem, getNameHtml, useLabelsEditor} from '../../../hooks/editors/use-labels-editor'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import {useRecordCellEditor} from '../performance-measurements'
import {LabelsRenderer} from '../renderers'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<Array<Label>>
}

const LabelsEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({currentValue, model, ...props}) => {
  const {fetchOptions, saveSelected} = useLabelsEditor({model})

  useRecordCellEditor('LabelsEditor', model.id)

  const selected = useMemo<Array<SuggestedLabel>>(() => {
    const labels = hasValue(currentValue) ? currentValue.value : []
    return labels.map(l => ({...l, selected: true}))
  }, [currentValue])

  const renderButton = useCallback(() => {
    return <LabelsRenderer currentValue={currentValue} model={model} />
  }, [currentValue, model])

  return (
    <SelectPanelEditor<SuggestedLabel>
      model={model}
      placeholderText="Search labels"
      selected={selected}
      fetchOptions={fetchOptions}
      filterOptions={filterSuggestedLabels}
      getSortAttribute={getNameHtml}
      convertOptionToItem={convertOptionToItem}
      saveSelected={saveSelected}
      renderButton={renderButton}
      {...props}
    />
  )
}

export const LabelsEditor = memo(LabelsEditorFunc)
