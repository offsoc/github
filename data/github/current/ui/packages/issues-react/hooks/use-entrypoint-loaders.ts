import {type PreloadedQuery, useQueryLoader} from 'react-relay'
import type {GraphQLTaggedNode, OperationType} from 'relay-runtime'

export const useEntryPointsLoader = <QueryType extends OperationType>(
  initialQueryRef: PreloadedQuery<QueryType> | null | undefined,
  query: GraphQLTaggedNode,
) => {
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<QueryType>(query, initialQueryRef)

  return {
    queryRef,
    loadQuery,
    disposeQuery,
  }
}
