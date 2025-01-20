import {useLazyLoadQuery, useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'

import {ItemPickerRepositoryItem, type ItemPickerRepositoryItemProps} from './ItemPickerRepositoryItem'
import {useEffect} from 'react'
import {useItemPickerRepositoriesSearch} from './SearchContext'
import type {ItemPickerRepositoriesSearchList_Fragment$key} from './__generated__/ItemPickerRepositoriesSearchList_Fragment.graphql'
import type {ItemPickerRepositoriesSearchList_Query} from './__generated__/ItemPickerRepositoriesSearchList_Query.graphql'

export type ItemPickerRepositoriesSearchListProps = {
  query: string
} & Pick<ItemPickerRepositoryItemProps, 'onItemSelect' | 'showTrailingVisual'>

const ItemPickerRepositoriesSearchList_Fragment = graphql`
  fragment ItemPickerRepositoriesSearchList_Fragment on SearchResultItemConnection {
    nodes {
      ... on Repository {
        id
        ...ItemPickerRepositoryItem_Fragment
      }
    }
  }
`

export function ItemPickerRepositoriesSearchList({query, ...props}: ItemPickerRepositoriesSearchListProps) {
  const {setIsSearching} = useItemPickerRepositoriesSearch()

  const result = useLazyLoadQuery<ItemPickerRepositoriesSearchList_Query>(
    graphql`
      query ItemPickerRepositoriesSearchList_Query($searchQuery: String!) {
        search(query: $searchQuery, type: REPOSITORY, first: 10) {
          ...ItemPickerRepositoriesSearchList_Fragment
        }
      }
    `,
    {
      searchQuery: query,
    },
  )

  const data = useFragment(
    ItemPickerRepositoriesSearchList_Fragment,
    result.search as ItemPickerRepositoriesSearchList_Fragment$key,
  )

  useEffect(() => {
    setIsSearching(false)
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, setIsSearching])

  // All repositories in repository. Remove null nodes in a TypeScript-friendly way
  const repositories = (data.nodes || []).flatMap(a => (a && a ? a : []))

  return (
    <>
      {repositories.map(repository => (
        <ItemPickerRepositoryItem key={repository.id} repositoryItem={repository} {...props} />
      ))}
    </>
  )
}
