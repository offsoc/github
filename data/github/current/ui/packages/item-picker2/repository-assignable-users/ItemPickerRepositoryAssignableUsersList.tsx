import {useLazyLoadQuery, usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useMemo, useEffect} from 'react'

import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedAssignee} from './types'
import {
  ItemPickerRepositoryAssignableUsersItem,
  type ItemPickerRepositoryAssignableUsersItemProps,
} from './ItemPickerRepositoryAssignableUsersItem'

import type {ItemPickerRepositoryAssignableUsersList_Fragment$key} from './__generated__/ItemPickerRepositoryAssignableUsersList_Fragment.graphql'
import type {ItemPickerRepositoryAssignableUsersList_Query} from './__generated__/ItemPickerRepositoryAssignableUsersList_Query.graphql'

export type ItemPickerRepositoryAssignableUsersListProps = {
  initialSelected: SubmittedAssignee[]
  maxSelectableItems?: number
  owner: string
  query: string
  repo: string
  selectedItemsIds: string[]
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>
} & Pick<ItemPickerRepositoryAssignableUsersItemProps, 'onItemSelect'>

const ItemPickerRepositoryAssignableUsersList_Fragment = graphql`
  fragment ItemPickerRepositoryAssignableUsersList_Fragment on Repository
  @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 50}, query: {type: "String"})
  @refetchable(queryName: "ItemPickerRepositoryAssignableUsersList_PaginationQuery") {
    assignableUsers(first: $count, after: $cursor, query: $query) @connection(key: "Repository_assignableUsers") {
      edges {
        node {
          ...ItemPickerRepositoryAssignableUsersItem_Fragment
          name
          login
          id
        }
      }
    }
  }
`

export function ItemPickerRepositoryAssignableUsersList({
  initialSelected,
  maxSelectableItems = Infinity,
  owner,
  query,
  repo,
  selectedItemsIds,
  setIsSearching,
  ...props
}: ItemPickerRepositoryAssignableUsersListProps) {
  const result = useLazyLoadQuery<ItemPickerRepositoryAssignableUsersList_Query>(
    graphql`
      query ItemPickerRepositoryAssignableUsersList_Query(
        $repo: String!
        $owner: String!
        $query: String
        $count: Int!
      ) {
        repository(name: $repo, owner: $owner) {
          ...ItemPickerRepositoryAssignableUsersList_Fragment @arguments(count: $count, query: $query)
        }
      }
    `,
    {
      repo,
      owner,
      count: 50,
      query,
    },
  )

  const {data} = usePaginationFragment(
    ItemPickerRepositoryAssignableUsersList_Fragment,
    (result.repository as ItemPickerRepositoryAssignableUsersList_Fragment$key) || null,
  )

  useEffect(() => {
    setIsSearching(false)
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, setIsSearching])

  // Suggested assignees for an issue. Remove null nodes in a TypeScript-friendly way
  const assignableUsers = (data?.assignableUsers?.edges || []).flatMap(edge => (edge && edge.node ? edge.node : []))

  const filteredAssignees = useMemo(() => {
    // Assignees that were pre-selected
    const initialSelectedSet = new Set(initialSelected.map(item => item.id))

    const filtered = assignableUsers.filter(
      assignee => matchesQuery(query, assignee.login, assignee.name) && !initialSelectedSet.has(assignee.id),
    )
    return filtered
  }, [initialSelected, assignableUsers, query])

  return (
    <>
      {filteredAssignees.map(assignee => (
        <ItemPickerRepositoryAssignableUsersItem
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
