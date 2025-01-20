import {noop} from '@github-ui/noop'
import {memo, useCallback} from 'react'

import type {Iteration} from '../../../api/columns/contracts/iteration'
import type {SuggestedIterationOption} from '../../../helpers/suggestions'
import {
  convertOptionToItem,
  getName,
  getOptionMatchingFilterValue,
  useIterationEditor,
} from '../../../hooks/editors/use-iteration-editor'
import type {IterationColumnModel} from '../../../models/column-model/custom/iteration'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import {IterationRenderer} from '../renderers/iteration-renderer'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<Iteration>
  columnModel: IterationColumnModel
}

const IterationEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({
  currentValue,
  model,
  columnModel,
  ...props
}) => {
  const iteration = hasValue(currentValue) ? currentValue.value : null

  const {activeOptions, completedOptions, selected, saveSelected, filterChange} = useIterationEditor({
    model,
    iteration,
    columnModel,
  })

  const renderButton = useCallback(() => {
    return <IterationRenderer currentValue={currentValue} model={model} columnId={props.columnId} />
  }, [currentValue, model, props.columnId])

  return (
    <SelectPanelEditor<SuggestedIterationOption>
      model={model}
      fetchOptions={noop}
      placeholderText="Filter options"
      selected={selected}
      options={[...activeOptions, ...completedOptions.slice(0, 3)]}
      filterOptions={filterChange}
      getSortAttribute={getName}
      convertOptionToItem={convertOptionToItem}
      saveSelected={saveSelected}
      renderButton={renderButton}
      getOptionMatchingFilterValue={getOptionMatchingFilterValue}
      groupMetadata={[{groupId: 'active'}, {groupId: 'completed', header: {title: 'Completed', variant: 'filled'}}]}
      {...props}
      singleSelect
      height="auto"
      maxHeight="large"
    />
  )
}

export const IterationEditor = memo(IterationEditorFunc)
