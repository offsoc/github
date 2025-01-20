import {useLazyLoadQuery, usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useMemo, useEffect} from 'react'

import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedAssignee} from './types'
import {ItemPickerAssigneesItem, type ItemPickerAssigneesItemProps} from './ItemPickerAssigneesItem'

import type {ItemPickerAssigneesList_Query} from './__generated__/ItemPickerAssigneesList_Query.graphql'
import type {ItemPickerAssigneesList_Fragment$key} from './__generated__/ItemPickerAssigneesList_Fragment.graphql'

export type ItemPickerAssigneesListProps = {
  currentViewerId: string
  initialSelected: SubmittedAssignee[]
  maxSelectableItems?: number
  number: number
  owner: string
  query: string
  repo: string
  selectedItemsIds: string[]
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>
} & Pick<ItemPickerAssigneesItemProps, 'onItemSelect'>

const ItemPickerAssigneesList_Fragment = graphql`
  fragment ItemPickerAssigneesList_Fragment on Assignable
  @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 50}, query: {type: "String"})
  @refetchable(queryName: "ItemPickerAssigneesList_PaginationQuery") {
    suggestedAssignees(first: $count, after: $cursor, query: $query)
      @connection(key: "IssueOrPullRequest_suggestedAssignees") {
      edges {
        node {
          ...ItemPickerAssigneesItem_Fragment
          name
          login
          id
        }
      }
    }
  }
`

export function ItemPickerAssigneesList({
  currentViewerId,
  initialSelected,
  maxSelectableItems = Infinity,
  number,
  owner,
  query,
  repo,
  selectedItemsIds,
  setIsSearching,
  ...props
}: ItemPickerAssigneesListProps) {
  const result = useLazyLoadQuery<ItemPickerAssigneesList_Query>(
    graphql`
      query ItemPickerAssigneesList_Query($repo: String!, $owner: String!, $number: Int!, $query: String) {
        repository(name: $repo, owner: $owner) {
          issueOrPullRequest(number: $number) {
            ... on Assignable {
              ...ItemPickerAssigneesList_Fragment @arguments(query: $query)
            }
          }
        }
      }
    `,
    {
      repo,
      owner,
      number,
      query,
    },
  )

  const {data} = usePaginationFragment(
    ItemPickerAssigneesList_Fragment,
    (result.repository?.issueOrPullRequest as ItemPickerAssigneesList_Fragment$key) || null,
  )

  useEffect(() => {
    setIsSearching(false)
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, setIsSearching])

  // Suggested assignees for an issue. Remove null nodes in a TypeScript-friendly way
  const assignees = (data?.suggestedAssignees?.edges || []).flatMap(edge => (edge && edge.node ? edge.node : []))

  // filter out current viewer (as it is always be rendered on top)
  const assigneesWithoutCurrentViewer = useMemo(
    () => assignees.filter(assignee => assignee.id !== currentViewerId),
    [assignees, currentViewerId],
  )

  const filteredAssignees = useMemo(() => {
    // Assignees that were initially selected
    const initialSelectedSet = new Set(initialSelected.map(item => item.id))

    const filtered = assigneesWithoutCurrentViewer.filter(
      assignee => matchesQuery(query, assignee.login, assignee.name) && !initialSelectedSet.has(assignee.id),
    )
    return filtered
  }, [initialSelected, assigneesWithoutCurrentViewer, query])

  return (
    <>
      {filteredAssignees.map(assignee => (
        <ItemPickerAssigneesItem
          key={assignee.id}
          assigneeItem={assignee}
          selected={selectedItemsIds.includes(assignee.id)}
          disabled={selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(assignee.id)}
          {...props}
        />
      ))}
    </>
  )
}
