import {useLazyLoadQuery, usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'

import {ItemPickerRepositoryItem, type ItemPickerRepositoryItemProps} from './ItemPickerRepositoryItem'

import type {ItemPickerRepositoriesList_Query} from './__generated__/ItemPickerRepositoriesList_Query.graphql'
import type {ItemPickerRepositoriesList_Fragment$key} from './__generated__/ItemPickerRepositoriesList_Fragment.graphql'

export type ItemPickerRepositoriesListProps = Pick<ItemPickerRepositoryItemProps, 'onItemSelect' | 'showTrailingVisual'>

const ItemPickerRepositoriesList_Fragment = graphql`
  fragment ItemPickerRepositoriesList_Fragment on User
  @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 50})
  @refetchable(queryName: "ItemPickerRepositoriesList_PaginationQuery") {
    topRepositories(first: $count, after: $cursor, orderBy: {field: NAME, direction: ASC})
      @connection(key: "Repository_topRepositories") {
      edges {
        node {
          id
          ...ItemPickerRepositoryItem_Fragment
        }
      }
    }
  }
`

export function ItemPickerRepositoriesList({...props}: ItemPickerRepositoriesListProps) {
  const result = useLazyLoadQuery<ItemPickerRepositoriesList_Query>(
    graphql`
      query ItemPickerRepositoriesList_Query($count: Int!) {
        viewer {
          ...ItemPickerRepositoriesList_Fragment @arguments(count: $count)
        }
      }
    `,
    {
      count: 50,
    },
  )
  const {viewer} = result
  const {data} = usePaginationFragment(
    ItemPickerRepositoriesList_Fragment,
    viewer as ItemPickerRepositoriesList_Fragment$key,
  )

  // All repositories in repository. Remove null nodes in a TypeScript-friendly way
  const repositories = (data.topRepositories?.edges || []).flatMap(a => (a && a.node ? a.node : []))

  return (
    <>
      {repositories.map(repository => (
        <ItemPickerRepositoryItem key={repository.id} repositoryItem={repository} {...props} />
      ))}
    </>
  )
}
