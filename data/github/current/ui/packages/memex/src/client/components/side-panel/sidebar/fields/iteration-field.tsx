import {noop} from '@github-ui/noop'

import type {Iteration} from '../../../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {SuggestedIterationOption} from '../../../../helpers/suggestions'
import {
  convertOptionToItem,
  getName,
  getOptionMatchingFilterValue,
  useIterationEditor,
} from '../../../../hooks/editors/use-iteration-editor'
import type {IterationColumnModel} from '../../../../models/column-model/custom/iteration'
import {IterationToken} from '../../../fields/iteration/iteration-token'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarSelectPanel} from './sidebar-select-panel'
import {TextValueWithFallback} from './text-value-with-fallback'

export const IterationField = (props: SidebarCustomFieldProps<Iteration, IterationColumnModel>) => {
  return <SidebarField {...props} renderer={IterationRenderer} editor={IterationEditor} />
}

function renderIteration(iteration: Iteration | undefined) {
  if (!iteration) {
    return <TextValueWithFallback columnName={'Iteration'} columnType={MemexColumnDataType.Iteration} />
  }

  return <IterationToken iteration={iteration} />
}

const IterationEditor = ({
  model,
  columnModel,
  content: iteration,
  onSaved,
}: SidebarFieldEditorProps<Iteration, IterationColumnModel>) => {
  const {activeOptions, completedOptions, saveSelected, filterChange, selected} = useIterationEditor({
    model,
    iteration: iteration ?? null,
    columnModel,
    onSaved,
  })

  return (
    <SidebarSelectPanel<SuggestedIterationOption>
      model={model}
      columnId={columnModel.id.toString()} // TODO: make this better
      getSortAttribute={getName}
      convertOptionToItem={convertOptionToItem}
      initialFilterValue=""
      selected={selected}
      options={[...activeOptions, ...completedOptions.slice(0, 3)]}
      saveSelected={saveSelected}
      fetchOptions={noop}
      filterOptions={filterChange}
      placeholderText="Filter options"
      displayValue={<IterationRenderer model={model} columnModel={columnModel} content={iteration} />}
      getOptionMatchingFilterValue={getOptionMatchingFilterValue}
      singleSelect
      groupMetadata={[{groupId: 'active'}, {groupId: 'completed', header: {title: 'Completed', variant: 'filled'}}]}
    />
  )
}

const IterationRenderer = ({content: iteration}: SidebarFieldRendererProps<Iteration, IterationColumnModel>) => {
  return renderIteration(iteration)
}
