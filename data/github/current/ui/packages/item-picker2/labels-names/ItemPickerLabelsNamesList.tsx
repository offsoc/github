import {usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useEffect, useMemo} from 'react'
import {ItemPickerLabelsNamesItem, type ItemPickerLabelsNamesItemProps} from './ItemPickerLabelsNamesItem'
import type {SubmittedLabel} from './types'
import {matchesQuery} from '../common/matchesQuery'
import {useItemPickerLabelsSearch} from './SearchContext'
import {MAX_FETCH_LABELS} from './GraphQLVariablesContext'
import type {ItemPickerLabelsNamesList_Fragment$key} from './__generated__/ItemPickerLabelsNamesList_Fragment.graphql'

export type ItemPickerLabelsNamesListProps = {
  initialSelected: SubmittedLabel[]
  labelList: ItemPickerLabelsNamesList_Fragment$key
  query: string
  selectedItemsIds: string[]
  setShowCreateNewLabelButton: React.Dispatch<React.SetStateAction<boolean>>
  maxSelectableItems?: number
} & Pick<ItemPickerLabelsNamesItemProps, 'onItemSelect' | 'selectType' | 'uniqueListId'>

export function ItemPickerLabelsNamesList({
  initialSelected,
  labelList,
  query,
  selectedItemsIds,
  setShowCreateNewLabelButton,
  maxSelectableItems = Infinity,
  ...props
}: ItemPickerLabelsNamesListProps) {
  const {refetchOnSearch, setRefetchOnSearch, setIsSearching} = useItemPickerLabelsSearch()
  const {data} = usePaginationFragment(
    graphql`
      fragment ItemPickerLabelsNamesList_Fragment on Repository
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 50}
        query: {type: "String"}
        withPath: {type: "Boolean", defaultValue: false}
        withDate: {type: "Boolean", defaultValue: false}
      )
      @refetchable(queryName: "ItemPickerLabelsNamesList_PaginationQuery") {
        labels(first: $count, after: $cursor, orderBy: {field: NAME, direction: ASC}, query: $query)
          @connection(key: "Repository_labels") {
          edges {
            node {
              ...ItemPickerLabelsNamesItem_Fragment @arguments(withPath: $withPath, withDate: $withDate)
              name
              description
              id
            }
          }
        }
        labelCount: labels {
          totalCount
        }
      }
    `,
    labelList,
  )

  useEffect(() => {
    if (refetchOnSearch) {
      setIsSearching(false)
    }
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, refetchOnSearch, setIsSearching])

  useEffect(() => {
    if (!refetchOnSearch && data?.labelCount?.totalCount && data?.labelCount?.totalCount > MAX_FETCH_LABELS) {
      setRefetchOnSearch(true)
    }
  }, [refetchOnSearch, data, setRefetchOnSearch])

  // All labels in repository. Remove null nodes in a TypeScript-friendly way
  const labels = (data.labels?.edges || []).flatMap(a => (a && a.node ? a.node : []))

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
        <ItemPickerLabelsNamesItem
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
