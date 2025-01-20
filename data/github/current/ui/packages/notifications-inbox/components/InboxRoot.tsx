import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import React, {type FC, useCallback, useEffect, useMemo, memo} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'

import ListLoading from '../utils/ListLoading'
import {VALUES} from '../constants'
import InboxRootRequest, {type InboxRootQuery} from './__generated__/InboxRootQuery.graphql'
import InboxList from './list/InboxList'
import {ListError} from './ListError'

/// Main query for the notification root component
const notificationRootQuery = graphql`
  query InboxRootQuery($query: String!, $first: Int!, $useNewQueryField: Boolean!) {
    viewer {
      ...InboxList_fragment @arguments(query: $query, first: $first) @include(if: $useNewQueryField)
      ...InboxList_threadFragment @arguments(query: $query, first: $first) @skip(if: $useNewQueryField)
    }
  }
`

/// Interface for the notification root result component when query is loaded
type InboxRootResultProps = {
  resultRef: PreloadedQuery<InboxRootQuery>
  query?: string
}
const InboxRootResult: FC<InboxRootResultProps> = ({resultRef, query}) => {
  const data = usePreloadedQuery(notificationRootQuery, resultRef)
  return <InboxList queryReference={data.viewer} hasSearchQuery={query ? true : false} />
}

type InboxRootProps = {
  /// The query to execute
  query?: string
  /// Number of items to fetch
  first?: number
}

/// Component to execute InboxRootQuery
const InboxRoot: FC<InboxRootProps> = ({query = '', first = VALUES.issuesPageSize}) => {
  const [queryRef, load, dispose] = useQueryLoader<InboxRootQuery>(InboxRootRequest)
  const useNewQueryField = useFeatureFlag('issues_react_notification_new_graghql_field')
  const queryProps = useMemo(() => {
    return {
      query,
      first,
      useNewQueryField,
    }
  }, [first, query, useNewQueryField])

  const loadQuery = useCallback(() => {
    load({...queryProps}, {fetchPolicy: 'network-only'})
  }, [load, queryProps])

  useEffect(
    function executeQuery() {
      loadQuery()
      return dispose
    },
    [loadQuery, dispose],
  )

  /// Once the query is loaded, this component will render the results
  return (
    <React.Suspense fallback={<ListLoading pageSize={first} />}>
      <PreloadedQueryBoundary fallback={ListError} onRetry={loadQuery}>
        {queryRef && <InboxRootResult resultRef={queryRef} query={query} />}
      </PreloadedQueryBoundary>
    </React.Suspense>
  )
}

/// Memoized version of InboxRoot
const InboxRootMemoized: FC<InboxRootProps> = memo(InboxRoot, (prevProps, nextProps) => {
  // If the query is the same, we can memoize the component
  return prevProps.query === nextProps.query
})

/// Component to memoize InboxRoot based on a feature flag
const InboxFFAwareMemoizer: FC<InboxRootProps> = props => {
  const useMemoizedInboxRoot = useFeatureFlag('issues_react_inbox_memoized')
  return useMemoizedInboxRoot ? <InboxRootMemoized {...props} /> : <InboxRoot {...props} />
}

export default InboxFFAwareMemoizer
