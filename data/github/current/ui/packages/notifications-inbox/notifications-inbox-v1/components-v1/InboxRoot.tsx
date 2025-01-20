/* eslint eslint-comments/no-use: off */
import {setTitle} from '@github-ui/document-metadata'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useSearchParams} from '@github-ui/use-navigate'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Box, Heading, Label, Link} from '@primer/react'
import {UnderlineNav} from '@primer/react/deprecated'
import React, {type FC, useCallback, useEffect, useMemo, useState} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'
import {NavLink} from 'react-router-dom'

import ListLoading from '../../utils/ListLoading'
import {LABELS as NOTIFICATIONS_LABELS} from '../../notifications/constants/labels'
import {default as NotificationTabs} from '../../notifications/constants/tabs'
import {notificationSearchUrl} from '../../notifications/utils/urls'
import {SingleSignOnDropdownExpanded} from '../../utils/sso/SingleSignOnDropdownExpanded'
import {LABELS, VALUES} from '../../constants'
import {useNotificationContext} from '../contexts-v1/NotificationContext'
import {useRouteInfo} from '../hooks-v1'
import InboxRootRequest, {type InboxRootv1Query} from './__generated__/InboxRootv1Query.graphql'
import InboxList from './list/InboxList'
import {ListError} from './ListError'
import InboxSearchBar from './search/InboxSearchBar'

/// Main query for the notification root component
const notificationRootQuery = graphql`
  query InboxRootv1Query($query: String!, $first: Int!, $useNewQueryField: Boolean!) {
    viewer {
      ...InboxList_v1_fragment @arguments(query: $query, first: $first) @include(if: $useNewQueryField)
      ...InboxList_v1_threadFragment @arguments(query: $query, first: $first) @skip(if: $useNewQueryField)
    }
  }
`

/// Interface for the notification root result component when query is loaded
type InboxRootProps = {
  resultRef: PreloadedQuery<InboxRootv1Query>
  query?: string
}
const InboxRootResult: FC<InboxRootProps> = ({resultRef, query}) => {
  const data = usePreloadedQuery(notificationRootQuery, resultRef)
  return <InboxList queryReference={data.viewer} query={query} />
}

/// Main component for executing the notification root query
const InboxRoot: FC = () => {
  const [queryRef, load, dispose] = useQueryLoader<InboxRootv1Query>(InboxRootRequest)
  const [urlParams] = useSearchParams()
  const {setActiveSearchQuery, setActiveTab, activeTab} = useNotificationContext()
  const notificationTabSupport = useFeatureFlag('issues_react_inbox_tabs')
  const newGraphqlField = useFeatureFlag('issues_react_notification_new_graghql_field')

  // Get the viewId from the route (default to context)
  const {viewId: routeViewId} = useRouteInfo()
  const viewId = routeViewId ?? activeTab

  // Re-construct the query from the URL
  const urlQuery = urlParams.get(NOTIFICATIONS_LABELS.notificationQueryUrlKey) ?? ''
  const prefixQuery = NotificationTabs.getViewQuery(viewId)

  const [searchQuery, setSearchQuery] = useState(urlQuery)

  const setSearchQueryData = (str: string) => {
    setActiveSearchQuery(str)
    setSearchQuery(str)
  }

  useEffect(() => {
    // If we are here we are landing here for the first time. Lets set the
    // activeSearchQuery to the query in the URL.
    setActiveSearchQuery(urlQuery)

    setTitle(LABELS.documentTitleForView(NOTIFICATIONS_LABELS.documentTitle))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    /// Set the active view (if we are using inbox tabs)
    function updateActiveView() {
      notificationTabSupport && setActiveTab(viewId)
    },
    [viewId, setActiveTab, notificationTabSupport],
  )

  const queryProps = useMemo(() => {
    // If we are using inbox tabs, we need to prepend the prefix query to the search query
    const query = notificationTabSupport ? [prefixQuery, searchQuery].join(' ').trim() : searchQuery
    return {
      query,
      first: VALUES.issuesPageSize,
      useNewQueryField: newGraphqlField,
    }
  }, [searchQuery, prefixQuery, notificationTabSupport, newGraphqlField])

  const loadQuery = useCallback(
    (query = {}) => {
      load({...queryProps, ...query}, {fetchPolicy: 'network-only'})
    },
    [load, queryProps],
  )

  useEffect(
    function executeQuery() {
      loadQuery()
      return dispose
    },
    [loadQuery, dispose],
  )

  const onSearchInputChange = (query: string) => {
    const url = notificationSearchUrl({view: notificationTabSupport ? viewId : undefined, query})
    window.history.replaceState(history.state, '', url)
  }

  const {addToast} = useToastContext()
  const disableFeaturePreview = useCallback(async () => {
    try {
      await verifiedFetch('/toggle_inbox', {method: 'POST'})
      window.location.assign(VALUES.disableInboxRedirectRoute)
    } catch (err) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: NOTIFICATIONS_LABELS.failedToOptOutInbox,
      })
      throw err
    }
  }, [addToast])

  /// Once the query is loaded, this component will render the results
  return (
    <Box sx={{maxWidth: 'container.xl', mt: 4}}>
      <Box
        sx={{
          mb: !notificationTabSupport ? 3 : undefined,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Heading as="h1" sx={{fontSize: 3, wordBreak: 'break-word'}}>
          {NOTIFICATIONS_LABELS.sidebarTitle}
        </Heading>

        {/* Render feature preview opt-out */}
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, justifyContent: 'flex-end'}}>
          <Label variant="success">{LABELS.alpha}</Label>
          <Link as="button" type="button" onClick={disableFeaturePreview}>
            Opt out
          </Link>
        </Box>
      </Box>

      {/* Mobile search bar -- render on new row */}
      <Box sx={{mt: 2, gap: 2, display: ['flex', 'flex', 'flex', 'none'], flexDirection: 'column'}}>
        <InboxSearchBar
          id={NOTIFICATIONS_LABELS.mobileSearchId}
          query={searchQuery}
          setQuery={setSearchQueryData}
          onInputChange={onSearchInputChange}
          placeholder={NOTIFICATIONS_LABELS.searchPlaceholder}
          sx={{width: '100%'}}
        />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
        {notificationTabSupport && (
          <UnderlineNav
            aria-label="Inbox tabs"
            sx={{
              '.PRC-UnderlineNav-body': {
                width: '100%',
              },
            }}
          >
            {Object.values(NotificationTabs.keys).map(id => (
              <UnderlineNav.Link
                as={NavLink}
                to={notificationSearchUrl({view: id, query: searchQuery})}
                key={id}
                selected={id === viewId}
                sx={{fontWeight: id === viewId ? 'bold' : 'normal'}}
              >
                {NotificationTabs.getViewName(id)}
              </UnderlineNav.Link>
            ))}
            <Box
              sx={{
                display: ['none', 'none', 'none', 'flex'],
                gap: 2,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{maxWidth: '400px'}}>
                {/* Desktop search bar -- fixed width, render on same row */}
                <InboxSearchBar
                  id={NOTIFICATIONS_LABELS.desktopSearchId}
                  query={searchQuery}
                  setQuery={setSearchQueryData}
                  onInputChange={onSearchInputChange}
                  placeholder={NOTIFICATIONS_LABELS.searchPlaceholder}
                />
              </Box>
            </Box>
          </UnderlineNav>
        )}
        <div>
          <SingleSignOnDropdownExpanded
            sx={{flexDirection: ['column', 'column', 'row'], alignItems: ['flex-start', 'flex-start', 'center'], py: 2}}
          />
        </div>
        <React.Suspense
          fallback={<ListLoading headerTitle={LABELS.loadingListingResults} pageSize={VALUES.issuesPageSize} />}
        >
          <PreloadedQueryBoundary fallback={ListError} onRetry={loadQuery}>
            {queryRef && <InboxRootResult resultRef={queryRef} query={searchQuery} />}
          </PreloadedQueryBoundary>
        </React.Suspense>
      </Box>
    </Box>
  )
}

export default InboxRoot
