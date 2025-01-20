import {useMemo} from 'react'

import {SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {Milestone} from '../../../../api/common-contracts'
import type {SuggestedMilestone} from '../../../../api/memex-items/contracts'
import {filterSuggestedMilestones} from '../../../../helpers/milestone-suggester'
import {convertOptionToItem, getTitle} from '../../../../hooks/editors/use-milestone-editor'
import type {MilestoneColumnModel} from '../../../../models/column-model/system/milestone'
import {useIssueContext} from '../../../../state-providers/issues/use-issue-context'
import {useFetchSuggestedMilestones} from '../../../../state-providers/suggestions/use-fetch-suggested-milestones'
import {MilestoneToken} from '../../../fields/milestone-token'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarSelectPanel} from './sidebar-select-panel'
import {TextValueWithFallback} from './text-value-with-fallback'
import {useUpdateLocalMemexItem} from './use-update-local-memex-item'

export const MilestoneField = (props: SidebarCustomFieldProps<Milestone, MilestoneColumnModel>) => (
  <SidebarField {...props} renderer={MilestoneRenderer} editor={MilestoneEditor} />
)

const MilestoneEditor = ({
  model,
  columnModel,
  content: milestone,
  onSaved,
}: SidebarFieldEditorProps<Milestone, MilestoneColumnModel>) => {
  const {editIssueMilestone} = useIssueContext()
  const {fetchSuggestedMilestones} = useFetchSuggestedMilestones()
  const {updateLocalMemexItem} = useUpdateLocalMemexItem()

  const selected = useMemo(() => (milestone ? [{selected: true, ...milestone}] : []), [milestone])

  return (
    <SidebarSelectPanel<SuggestedMilestone>
      model={model}
      columnId={columnModel.id.toString()} // TODO: make this better
      getSortAttribute={getTitle}
      convertOptionToItem={convertOptionToItem}
      initialFilterValue=""
      selected={selected}
      saveSelected={async newMilestones => {
        await editIssueMilestone(newMilestones[0]?.id ?? 'clear')
        if (model.memexItemId?.()) {
          updateLocalMemexItem(model.memexItemId(), {
            memexProjectColumnId: SystemColumnId.Milestone,
            value: newMilestones[0],
          })
        }
        onSaved()
      }}
      fetchOptions={() => fetchSuggestedMilestones(model)}
      filterOptions={filterSuggestedMilestones}
      placeholderText="Search milestones"
      blankslateText="No milestones to show."
      displayValue={<MilestoneRenderer model={model} columnModel={columnModel} content={milestone} />}
      singleSelect
      groupMetadata={[
        {groupId: 'open', header: {title: 'Open', variant: 'filled'}},
        {groupId: 'closed', header: {title: 'Closed', variant: 'filled'}},
      ]}
    />
  )
}

const MilestoneRenderer = ({content: milestone}: SidebarFieldRendererProps<Milestone, MilestoneColumnModel>) =>
  milestone ? <MilestoneToken milestone={milestone} /> : <TextValueWithFallback columnName={'Milestone'} />
