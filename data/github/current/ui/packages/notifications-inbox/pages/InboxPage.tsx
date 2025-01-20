import {type FC, useCallback, useEffect, useState, useMemo} from 'react'
import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import {setTitle} from '@github-ui/document-metadata'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Box, Heading, Label, Link} from '@primer/react'
import {UnderlineNav} from '@primer/react/deprecated'
import {NavLink, useSearchParams} from 'react-router-dom'

import {LABELS as NOTIFICATIONS_LABELS} from '../notifications/constants/labels'
import {default as NotificationTabs} from '../notifications/constants/tabs'
import {notificationSearchUrl} from '../notifications/utils/urls'
import {SingleSignOnDropdownExpanded} from '../utils/sso/SingleSignOnDropdownExpanded'
import {LABELS, VALUES} from '../constants'
import {useNotificationContext} from '../contexts/NotificationContext'
import {useRouteInfo} from '../hooks'
import InboxSearchBar from '../components/search/InboxSearchBar'
import InboxRoot from '../components/InboxRoot'
import {RepositoryGroupContextProvider, useViewPreferenceContext} from '../contexts'
import {NotificationViewPreferenceEnum} from '../notifications/constants/settings'
import {useRepositoryContext, type NameWithOwnerRepository} from '../contexts/RepositoryContext'
import InboxViewPreferenceToggle from '../components/InboxViewPreferenceToggle'

const InboxGroup: FC<{query: string}> = ({query}) => {
  const {repositories} = useRepositoryContext()
  const buildRepoQuery = (repo: NameWithOwnerRepository) =>
    [query, ['repo', repo.nameWithOwner].join(':')].join(' ').trim()
  return (
    <div>
      {repositories.map(repo => (
        <Box key={repo.nameWithOwner} sx={{mb: 3}}>
          <RepositoryGroupContextProvider repository={repo}>
            <InboxRoot query={buildRepoQuery(repo)} first={VALUES.issuesGroupByPageSize} />
          </RepositoryGroupContextProvider>
        </Box>
      ))}
    </div>
  )
}

export const InboxPage = () => {
  const [urlParams] = useSearchParams()
  const {setActiveSearchQuery, setActiveTab, activeTab} = useNotificationContext()
  const notificationTabSupport = useFeatureFlag('issues_react_inbox_tabs')

  // Get the viewId from the route (default to context)
  const {viewId: routeViewId} = useRouteInfo()
  const viewId = routeViewId ?? activeTab

  // Re-construct the query from the URL
  const urlQuery = urlParams.get(NOTIFICATIONS_LABELS.notificationQueryUrlKey) ?? ''
  const prefixQuery = NotificationTabs.getViewQuery(viewId)

  const [searchQuery, setSearchQuery] = useState(urlQuery)

  // Build query for InboxRoot component
  const query = useMemo(() => [searchQuery, prefixQuery].join(' ').trim(), [searchQuery, prefixQuery])

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

  const onSearchInputChange = (newQuery: string) => {
    const url = notificationSearchUrl({view: notificationTabSupport ? viewId : undefined, query: newQuery})
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

  const {viewPreference} = useViewPreferenceContext()

  return (
    <ThreePanesLayout
      middlePane={
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
              </UnderlineNav>
            )}
            <Box sx={{mt: 2, gap: 2, display: 'flex', flexDirection: 'row'}}>
              <InboxSearchBar
                id={NOTIFICATIONS_LABELS.searchId}
                query={searchQuery}
                setQuery={setSearchQueryData}
                onInputChange={onSearchInputChange}
                placeholder={NOTIFICATIONS_LABELS.searchPlaceholder}
                sx={{width: '100%'}}
              />
              <InboxViewPreferenceToggle />
            </Box>
            <div>
              <SingleSignOnDropdownExpanded
                sx={{
                  flexDirection: ['column', 'column', 'row'],
                  alignItems: ['flex-start', 'flex-start', 'center'],
                  py: 2,
                }}
              />
            </div>
            {viewPreference === NotificationViewPreferenceEnum.DATE ? (
              <InboxRoot query={query} first={VALUES.issuesPageSize} />
            ) : (
              <InboxGroup query={query} />
            )}
          </Box>
        </Box>
      }
    />
  )
}
