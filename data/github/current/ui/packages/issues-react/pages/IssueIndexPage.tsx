import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import {
  type EntryPointComponent,
  type PreloadedQuery,
  useLazyLoadQuery,
  graphql,
  usePreloadedQuery,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay'

import {useEntryPointsLoader} from '../hooks/use-entrypoint-loaders'
import type {ClientSideRelayDataGeneratorViewQuery} from './__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import {AnalyticsWrapper} from './AnalyticsWrapper'
import {currentViewQuery as currentView} from './ClientSideRelayDataGenerator'
import {JobInfoWithSubscription} from './JobInfo'
import {List} from './List'
import {VIEW_IDS} from '../constants/view-constants'
import type {IssueIndexPageQuery, IssueIndexPageQuery$variables} from './__generated__/IssueIndexPageQuery.graphql'
import {useEffect} from 'react'
import {useQueryContext} from '../contexts/QueryContext'
import {CallToActionItem} from '../components/list/header/CallToActionItem'
import type {AppPayload} from '../types/app-payload'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {Box} from '@primer/react'
import {PinnedIssues} from '../components/pinnedIssues/PinnedIssues'

const PageQuery = graphql`
  query IssueIndexPageQuery(
    $query: String = "state:open archived:false assignee:@me sort:updated-desc"
    $first: Int = 25
    $labelPageSize: Int = 20
    $skip: Int = null
    $name: String!
    $owner: String!
  ) {
    ...ListQuery
      @arguments(query: $query, first: $first, labelPageSize: $labelPageSize, skip: $skip, fetchRepository: false)

    repository(owner: $owner, name: $name) {
      ...PinnedIssues
      ...ListRepositoryFragment
    }
    safeViewer {
      # this is intentional to have the current viewer preloaded for the item pickers
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...AssigneePickerAssignee
    }
  }
`

export const IssueIndexPage: EntryPointComponent<{pageQuery: IssueIndexPageQuery}, Record<string, never>> = ({
  queries: {pageQuery},
}) => {
  const {queryRef, loadQuery} = useEntryPointsLoader(pageQuery, PageQuery)

  const {setCurrentViewId} = useQueryContext()

  useEffect(() => {
    setCurrentViewId(VIEW_IDS.repository)
  }, [pageQuery, setCurrentViewId])

  if (!queryRef) return null

  return <IssueIndexPageContent pageQueryRef={queryRef} loadQuery={loadQuery} />
}

function IssueIndexPageContent({
  pageQueryRef,
  loadQuery,
}: {
  pageQueryRef: PreloadedQuery<IssueIndexPageQuery>
  loadQuery: (variables: IssueIndexPageQuery$variables, options?: UseQueryLoaderLoadQueryOptions | undefined) => void
}) {
  const currentViewNode = useLazyLoadQuery<ClientSideRelayDataGeneratorViewQuery>(
    currentView,
    {id: VIEW_IDS.repository},
    {fetchPolicy: 'store-only'},
  )

  const pageData = usePreloadedQuery<IssueIndexPageQuery>(PageQuery, pageQueryRef)
  const {scoped_repository} = useAppPayload<AppPayload>()

  if (!pageData.repository) return null

  return (
    <AnalyticsWrapper category="Issues Index">
      <JobInfoWithSubscription>
        <ThreePanesLayout
          contentAs="div"
          middlePane={
            <>
              <Box sx={{alignSelf: 'right', ml: 'auto'}}>
                <CallToActionItem
                  optOutUrl={`/${scoped_repository?.owner}/${scoped_repository?.name}/issues?new_issues_experience=false`}
                />
              </Box>

              <PinnedIssues repository={pageData.repository} />
              {currentViewNode.node ? (
                <List
                  fetchedView={currentViewNode.node}
                  fetchedRepository={pageData.repository}
                  search={pageData}
                  loadSearchQuery={loadQuery}
                />
              ) : null}
            </>
          }
        />
      </JobInfoWithSubscription>
    </AnalyticsWrapper>
  )
}
