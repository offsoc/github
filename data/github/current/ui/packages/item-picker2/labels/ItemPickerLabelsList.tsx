import {useLazyLoadQuery, usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useEffect, useMemo} from 'react'

import {MAX_FETCH_LABELS, useItemPickerLabelsGraphQLVariables} from './GraphQLVariablesContext'
import {useItemPickerLabelsSearch} from './SearchContext'
import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedLabel} from './types'
import {ItemPickerLabelsItem} from './ItemPickerLabelsItem'

import type {ItemPickerLabelsList_Query} from './__generated__/ItemPickerLabelsList_Query.graphql'
import type {ItemPickerLabelsList_Fragment$key} from './__generated__/ItemPickerLabelsList_Fragment.graphql'

export type ItemPickerLabelsListProps = {
  initialSelected: SubmittedLabel[]
  query: string
  selectedItemsIds: string[]
  setShowCreateNewLabelButton: React.Dispatch<React.SetStateAction<boolean>>
  maxSelectableItems?: number
} & Pick<ItemPickerLabelsItem, 'onItemSelect' | 'selectType' | 'uniqueListId'>

const ItemPickerLabelsList_Fragment = graphql`
  fragment ItemPickerLabelsList_Fragment on Repository
  @argumentDefinitions(
    cursor: {type: "String"}
    count: {type: "Int", defaultValue: 50}
    query: {type: "String"}
    withPath: {type: "Boolean", defaultValue: false}
    withDate: {type: "Boolean", defaultValue: false}
  )
  @refetchable(queryName: "ItemPickerLabelsList_PaginationQuery") {
    labels(first: $count, after: $cursor, orderBy: {field: NAME, direction: ASC}, query: $query)
      @connection(key: "Repository_labels") {
      edges {
        node {
          ...ItemPickerLabelsItem_Fragment @arguments(withPath: $withPath, withDate: $withDate)
          name
          description
          id
        }
      }
    }
  }
`

export function ItemPickerLabelsList({
  initialSelected,
  query,
  selectedItemsIds,
  setShowCreateNewLabelButton,
  maxSelectableItems = Infinity,
  ...props
}: ItemPickerLabelsListProps) {
  const {setRefetchOnSearch, refetchOnSearch, setIsSearching} = useItemPickerLabelsSearch()
  const {owner, repo, count, withDate, withPath} = useItemPickerLabelsGraphQLVariables()

  const result = useLazyLoadQuery<ItemPickerLabelsList_Query>(
    graphql`
      query ItemPickerLabelsList_Query(
        $repo: String!
        $owner: String!
        $query: String
        $count: Int!
        $withDate: Boolean!
        $withPath: Boolean!
      ) {
        repository(name: $repo, owner: $owner) {
          ...ItemPickerLabelsList_Fragment
            @arguments(count: $count, query: $query, withDate: $withDate, withPath: $withPath)
          # Using this alias because the labels.totalCount would not resolve as expected
          labelCount: labels {
            totalCount
          }
        }
      }
    `,
    {
      repo,
      owner,
      count,
      query: refetchOnSearch ? query : '',
      withDate,
      withPath,
    },
  )
  const {repository} = result
  const {data} = usePaginationFragment(
    ItemPickerLabelsList_Fragment,
    (repository as ItemPickerLabelsList_Fragment$key) || null,
  )

  useEffect(() => {
    if (refetchOnSearch) {
      setIsSearching(false)
    }
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, refetchOnSearch, setIsSearching])

  useEffect(() => {
    if (
      !refetchOnSearch &&
      repository?.labelCount?.totalCount &&
      repository?.labelCount?.totalCount > MAX_FETCH_LABELS
    ) {
      setRefetchOnSearch(true)
    }
  }, [refetchOnSearch, repository?.labelCount?.totalCount, setRefetchOnSearch])

  // All labels in repository. Remove null nodes in a TypeScript-friendly way
  const labels = (data?.labels?.edges || []).flatMap(a => (a && a.node ? a.node : []))

  const filteredLabels = useMemo(() => {
    // Labels that were initially selected
    const initialSelectedSet = new Set(initialSelected.map(item => item.id))

    const filtered = labels.filter(
      label => matchesQuery(query, label.name, label.description) && !initialSelectedSet.has(label.id),
    )
    return filtered
  }, [initialSelected, labels, query])

  useEffect(() => {
    setShowCreateNewLabelButton(
      !matchingLabelExists(
        query,
        labels.map(label => label.name.toLowerCase()),
      ),
    )
  }, [labels, setShowCreateNewLabelButton, query])

  return (
    <>
      {filteredLabels.map(label => (
        <ItemPickerLabelsItem
          key={label.id}
          labelItem={label}
          selected={selectedItemsIds.includes(label.id)}
          disabled={selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(label.id)}
          {...props}
        />
      ))}
    </>
  )
}

function matchingLabelExists(query: string, labelNames: string[]) {
  if (!query.trim()) return true
  const normalizedQuery = query.trim().toLowerCase()
  return labelNames.includes(normalizedQuery)
}
