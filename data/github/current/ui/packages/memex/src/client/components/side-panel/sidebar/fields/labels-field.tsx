import {Box} from '@primer/react'
import {useMemo} from 'react'

import {SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {Label as LabelInterface} from '../../../../api/common-contracts'
import type {SuggestedLabel} from '../../../../api/memex-items/contracts'
import {filterSuggestedLabels} from '../../../../helpers/label-suggester'
import {convertOptionToItem, getNameHtml} from '../../../../hooks/editors/use-labels-editor'
import type {LabelsColumnModel} from '../../../../models/column-model/system/labels'
import {useIssueContext} from '../../../../state-providers/issues/use-issue-context'
import {useFetchSuggestedLabels} from '../../../../state-providers/suggestions/use-fetch-suggested-labels'
import {LabelToken} from '../../../fields/label-token'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarSelectPanel} from './sidebar-select-panel'
import {TextValueWithFallback} from './text-value-with-fallback'
import {useUpdateLocalMemexItem} from './use-update-local-memex-item'

export const LabelField = (props: SidebarCustomFieldProps<Array<LabelInterface>, LabelsColumnModel>) => (
  <SidebarField {...props} renderer={LabelRenderer} editor={LabelEditor} />
)

const LabelEditor = ({
  model,
  columnModel,
  content: labels,
  onSaved,
}: SidebarFieldEditorProps<Array<LabelInterface>, LabelsColumnModel>) => {
  const {editIssueLabels} = useIssueContext()
  const {fetchSuggestedLabels} = useFetchSuggestedLabels()
  const {updateLocalMemexItem} = useUpdateLocalMemexItem()

  const selected = useMemo(
    () =>
      labels?.map(l => {
        return {...l, selected: true}
      }) ?? [],
    [labels],
  )

  return (
    <SidebarSelectPanel<SuggestedLabel>
      model={model}
      columnId={columnModel.id.toString()} // TODO: make this better
      getSortAttribute={getNameHtml}
      convertOptionToItem={convertOptionToItem}
      initialFilterValue=""
      selected={selected}
      saveSelected={async newLabels => {
        await editIssueLabels(newLabels.map(label => label.id))
        if (model.memexItemId?.()) {
          updateLocalMemexItem(model.memexItemId?.(), {
            memexProjectColumnId: SystemColumnId.Labels,
            value: newLabels,
          })
        }
        onSaved()
      }}
      fetchOptions={() => fetchSuggestedLabels(model)}
      filterOptions={filterSuggestedLabels}
      placeholderText="Search labels"
      displayValue={<LabelRenderer model={model} columnModel={columnModel} content={labels} />}
    />
  )
}

const LabelRenderer = ({
  columnModel,
  content: labels,
}: SidebarFieldRendererProps<Array<LabelInterface>, LabelsColumnModel>) =>
  !labels?.length ? (
    <TextValueWithFallback columnName={columnModel.name} />
  ) : (
    <Box as="ul" sx={{display: 'flex', gap: 1, flexWrap: 'wrap', listStyle: 'none'}}>
      {labels?.map(label => (
        <li key={label.id}>
          <LabelToken label={label} />
        </li>
      ))}
    </Box>
  )
