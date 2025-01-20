import type {IssueViewerQueries} from '@github-ui/issue-viewer/IssueViewer'

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useCurrentRouteState} from '@github-ui/react-core/use-current-route-state'
import {Box} from '@primer/react'
import {type EntryPointComponent, useLazyLoadQuery} from 'react-relay'

import {IssueDetail} from '../components/show/IssueDetail'
import {VIEW_IDS} from '../constants/view-constants'
import {useQueryContext} from '../contexts/QueryContext'
import type {AppPayload} from '../types/app-payload'
import type {ClientSideRelayDataGeneratorViewQuery} from './__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import {AnalyticsWrapper} from './AnalyticsWrapper'
import {currentViewQuery as currentView} from './ClientSideRelayDataGenerator'
import {JobInfoWithSubscription} from './JobInfo'

export const IssueShowPage: EntryPointComponent<IssueViewerQueries, Record<string, never>> = ({
  queries: {...issueViewerPreloadedQueries},
}) => {
  const {scoped_repository} = useAppPayload<AppPayload>()
  const {currentViewId, setCurrentViewId} = useQueryContext()

  const viewId = selectViewId()
  if (scoped_repository && !currentViewId) {
    setCurrentViewId(viewId)
  }

  const currentViewNode = useLazyLoadQuery<ClientSideRelayDataGeneratorViewQuery>(
    currentView,
    {id: viewId},
    {fetchPolicy: 'store-only'},
  )

  // Setting the title to an empty string will prevent the title from being updated by use-title-manager.ts in react-core
  const state = useCurrentRouteState<{type: 'loaded'; data: unknown; title: string}>()
  state.title = ''

  if (!currentViewNode || !currentViewNode.node) {
    return null
  }

  return (
    <AnalyticsWrapper category="Issue Show">
      <JobInfoWithSubscription>
        <Box sx={{display: 'flex', height: '100%', justifyContent: 'stretch', '> *': {width: '100%'}}}>
          <IssueDetail fetchedView={currentViewNode.node} preloadedQueries={issueViewerPreloadedQueries} />
        </Box>
      </JobInfoWithSubscription>
    </AnalyticsWrapper>
  )

  function selectViewId() {
    if (currentViewId) {
      return currentViewId
    }
    return scoped_repository ? VIEW_IDS.repository : VIEW_IDS.assignedToMe
  }
}
