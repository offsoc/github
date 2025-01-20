import {usePaginationFragment, useLazyLoadQuery} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useMemo, useEffect} from 'react'
import type {SubmittedMilestone} from './types'
import {matchesQuery} from '../common/matchesQuery'
import {ItemPickerMilestonesItem, type ItemPickerMilestonesItemProps} from './ItemPickerMilestonesItem'
import type {ItemPickerMilestonesList_Query} from './__generated__/ItemPickerMilestonesList_Query.graphql'
import type {ItemPickerMilestonesList_Fragment$key} from './__generated__/ItemPickerMilestonesList_Fragment.graphql'

export type ItemPickerMilestonesListProps = {
  initialSelected: SubmittedMilestone | null
  owner: string
  query: string
  repo: string
  selectedItemId: string | undefined
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>
} & Pick<ItemPickerMilestonesItemProps, 'onItemSelect'>

const ItemPickerMilestonesList_Fragment = graphql`
  fragment ItemPickerMilestonesList_Fragment on Repository
  @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 50}, query: {type: "String"})
  @refetchable(queryName: "ItemPickerMilestonesList_PaginationQuery") {
    milestones(first: $count, after: $cursor, query: $query) @connection(key: "Repository_milestones") {
      edges {
        node {
          ...ItemPickerMilestonesItem_Fragment
          title
          id
        }
      }
    }
  }
`

export function ItemPickerMilestonesList({
  initialSelected,
  owner,
  query,
  repo,
  selectedItemId,
  setIsSearching,
  ...props
}: ItemPickerMilestonesListProps) {
  const result = useLazyLoadQuery<ItemPickerMilestonesList_Query>(
    graphql`
      query ItemPickerMilestonesList_Query($repo: String!, $owner: String!, $query: String) {
        repository(name: $repo, owner: $owner) {
          ...ItemPickerMilestonesList_Fragment @arguments(query: $query)
        }
      }
    `,
    {
      repo,
      owner,
      query,
    },
  )
  const {data} = usePaginationFragment(
    ItemPickerMilestonesList_Fragment,
    (result.repository as ItemPickerMilestonesList_Fragment$key) || null,
  )

  // Suggested milestones for an issue. Remove null nodes in a TypeScript-friendly way
  const milestones = (data?.milestones?.edges || []).flatMap(edge => (edge && edge.node ? edge.node : []))

  useEffect(() => {
    setIsSearching(false)
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, setIsSearching])

  const filteredMilestones = useMemo(() => {
    return milestones.filter(milestone => matchesQuery(query, milestone.title) && initialSelected?.id !== milestone.id)
  }, [initialSelected, milestones, query])

  return (
    <>
      {filteredMilestones.map(milestone => (
        <ItemPickerMilestonesItem
          key={milestone.id}
          milestoneItem={milestone}
          selected={selectedItemId === milestone.id}
          {...props}
        />
      ))}
    </>
  )
}
