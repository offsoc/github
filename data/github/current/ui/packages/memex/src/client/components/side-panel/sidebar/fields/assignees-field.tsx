import {Box} from '@primer/react'
import {useMemo} from 'react'

import {SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {User} from '../../../../api/common-contracts'
import type {SuggestedAssignee} from '../../../../api/memex-items/contracts'
import {filterSuggestedAssignees} from '../../../../helpers/assignee-suggester'
import {convertOptionToItem, getLogin} from '../../../../hooks/editors/use-assignees-editor'
import type {AssigneesColumnModel} from '../../../../models/column-model/system/assignees'
import {useIssueContext} from '../../../../state-providers/issues/use-issue-context'
import {useFetchSuggestedAssignees} from '../../../../state-providers/suggestions/use-fetch-suggested-assignees'
import {itemFromAssignee, UserGroup} from '../../../react_table/cells/user-group'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarSelectPanel} from './sidebar-select-panel'
import {TextValueWithFallback} from './text-value-with-fallback'
import {useUpdateLocalMemexItem} from './use-update-local-memex-item'

export const AssigneeField = (props: SidebarCustomFieldProps<Array<User>, AssigneesColumnModel>) => (
  <SidebarField {...props} renderer={AssigneeRenderer} editor={AssigneeEditor} />
)
const AssigneeEditor = ({
  model,
  columnModel,
  content: users,
  onSaved,
}: SidebarFieldEditorProps<Array<User>, AssigneesColumnModel>) => {
  const {editIssueAssignees} = useIssueContext()
  const {fetchSuggestedAssignees} = useFetchSuggestedAssignees()
  const {updateLocalMemexItem} = useUpdateLocalMemexItem()

  const selected = useMemo(() => users?.map(u => ({selected: true, ...u})) ?? [], [users])

  return (
    <SidebarSelectPanel<SuggestedAssignee>
      model={model}
      columnId={columnModel.id.toString()} // TODO: make this better
      getSortAttribute={getLogin}
      convertOptionToItem={convertOptionToItem}
      initialFilterValue=""
      selected={selected}
      saveSelected={async assignees => {
        await editIssueAssignees(assignees.map(user => user.id))
        if (model.memexItemId?.()) {
          updateLocalMemexItem(model.memexItemId?.(), {
            memexProjectColumnId: SystemColumnId.Assignees,
            value: assignees,
          })
        }
        onSaved()
      }}
      fetchOptions={() => fetchSuggestedAssignees(model)}
      filterOptions={filterSuggestedAssignees}
      placeholderText="Search people"
      displayValue={<AssigneeRenderer model={model} columnModel={columnModel} content={users} />}
      groupMetadata={[
        {groupId: 'assigned'},
        {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}},
      ]}
    />
  )
}

const AssigneeRenderer = ({
  columnModel,
  content: users,
}: SidebarFieldRendererProps<Array<User>, AssigneesColumnModel>) =>
  !users?.length ? (
    <TextValueWithFallback columnName={columnModel.name} />
  ) : (
    <Box sx={{display: 'flex'}}>
      <UserGroup users={users.map(itemFromAssignee)} isDisabled />
    </Box>
  )
