import {GitHubAvatar} from '@github-ui/github-avatar'

import type {ExtendedItemProps} from './ItemPicker'
import type {Assignee} from './AssigneePicker'
import type {ItemGroup} from '../shared'

function assigneeMatchesQuery(user: Assignee, query: string) {
  return `${user.login.toLowerCase()}#${user.name?.toLowerCase()}`.includes(query)
}

export function sortAssigneePickerUsers(assignees: Assignee[], usersToSort: Assignee[], query: string) {
  const lowercasedQuery = query.toLowerCase().trim()
  // If any of the assignees matches the filter, put them on top
  const filteredAssignees = assignees.filter(u => assigneeMatchesQuery(u, lowercasedQuery))
  // Remove all the assignees from the possible result set
  const filteredUsersToSort = usersToSort.filter(
    userToSort => !filteredAssignees.some(assignee => assignee.id === userToSort.id),
  )
  filteredUsersToSort.sort((a, b) => a.login.localeCompare(b.login))

  return filteredAssignees.concat(filteredUsersToSort)
}

export const assigneesGroup: ItemGroup = {groupId: 'assignees'}
export const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}

export const getGroupItemId = (assignees: Assignee[], assignee: Assignee): string => {
  if (assignees.length === 0) {
    // No assignees, every item is a suggestion
    return suggestionsGroup.groupId
  } else if (!assignees.find(a => a.id === assignee.id)) {
    // Not an assignee, it's a suggestion
    return suggestionsGroup.groupId
  }
  return assigneesGroup.groupId
}

export const convertToItemProps = (assignees: Assignee[], assignee: Assignee): ExtendedItemProps<Assignee> => {
  return {
    id: assignee.id,
    text: assignee.login,
    description: assignee.name ?? '',
    source: assignee,
    groupId: getGroupItemId(assignees, assignee),
    leadingVisual: () => <GitHubAvatar alt={assignee.login} src={assignee.avatarUrl} />,
  }
}
