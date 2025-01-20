import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {Box, Spinner} from '@primer/react'
import {Suspense, useEffect, useState} from 'react'
import {graphql, useRefetchableFragment} from 'react-relay'

import {default as NotificationTabs} from '../../notifications/constants/tabs'
import {VALUES} from '../../constants'
import {useNotificationContext} from '../../contexts/NotificationContext'
import type {InboxDetailPageQuery} from '../../pages/__generated__/InboxDetailPageQuery.graphql'
import ErrorBoundary from '../ErrorBoundary'
import {InboxCompactList} from '../list/InboxList'
import InboxSearchBar from '../search/InboxSearchBar'
import type {InboxSidebar_notifications$key} from './__generated__/InboxSidebar_notifications.graphql'
import InboxSidebarHeader from './InboxSidebarHeader'

type InboxSidebarResultProps = {
  queryReference: InboxSidebar_notifications$key
  searchQuery: string
}
const InboxSidebarResults = ({queryReference, searchQuery}: InboxSidebarResultProps) => {
  const {activeTab} = useNotificationContext()
  const queryPrefix = NotificationTabs.getViewQuery(activeTab)
  const notificationTabsSupport = useFeatureFlag('issues_react_inbox_tabs')

  const [data, refetch] = useRefetchableFragment<InboxDetailPageQuery, InboxSidebar_notifications$key>(
    graphql`
      fragment InboxSidebar_notifications on Query
      @argumentDefinitions(query: {type: "String!"}, first: {type: "Int"}, useNewQueryField: {type: "Boolean!"})
      @refetchable(queryName: "InboxSidebarQuery") {
        viewer {
          ...InboxList_fragment @arguments(query: $query, first: $first) @include(if: $useNewQueryField)
          ...InboxList_threadFragment @arguments(query: $query, first: $first) @skip(if: $useNewQueryField)
        }
      }
    `,
    queryReference,
  )

  useEffect(
    function fetchFragmentOnMount() {
      const query = notificationTabsSupport ? [queryPrefix, searchQuery].join(' ').trim() : searchQuery
      refetch({query, first: VALUES.issuesPageSize}, {fetchPolicy: 'store-or-network'})
    },
    [refetch, searchQuery, queryPrefix, notificationTabsSupport],
  )

  return <InboxCompactList queryReference={data.viewer} hasSearchQuery={searchQuery ? true : false} />
}

type InboxSidebarProps = {
  queryReference: InboxSidebar_notifications$key
  initialSearchQuery: string
}

const InboxSidebarFallback = () => {
  return (
    <Box sx={{alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
      <Spinner size="large" />
    </Box>
  )
}

const InboxSidebar = ({queryReference, initialSearchQuery}: InboxSidebarProps) => {
  const {setActiveSearchQuery} = useNotificationContext()
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)

  const setSearch = (newSearchQuery: string) => {
    setActiveSearchQuery(newSearchQuery)
    setSearchQuery(newSearchQuery)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      <InboxSidebarHeader />
      <InboxSearchBar query={searchQuery} setQuery={setSearch} />
      <ErrorBoundary>
        <Suspense fallback={<InboxSidebarFallback />}>
          <InboxSidebarResults queryReference={queryReference} searchQuery={searchQuery} />
        </Suspense>
      </ErrorBoundary>
    </Box>
  )
}

export default InboxSidebar
