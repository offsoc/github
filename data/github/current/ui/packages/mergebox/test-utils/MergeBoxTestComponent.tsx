import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {useMemo} from 'react'
import type {createMockEnvironment} from 'relay-test-utils'

import {MergeMethodContextProvider} from '../contexts/MergeMethodContext'
import PullRequestsAppWrapper from './PullRequestsAppWrapper'
import {MergeBoxWithRelay, MergeBoxWithSuspense} from '../components/MergeBox'
import {MergeMethod, type RelayPullRequest, type ViewerPayload} from '../types'
import {defaultPullRequest} from './query-data'

type MergeBoxTestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
  defaultMergeMethod?: MergeMethod
  hideIcon?: boolean
  /**
   * Optional if you aren't using Relay
   */
  pullRequest?: RelayPullRequest
  /**
   * Optional if you aren't using Relay
   */
  viewer?: ViewerPayload
  /**
   * When true, hits the JSON API version of the MergeBox
   */
  isJSONAPI?: boolean
}

export const BASE_PAGE_DATA_URL = '/monalisa/smile/pull/1'

export function MergeBoxTestComponent({
  environment,
  pullRequest = defaultPullRequest,
  viewer = {login: 'monalisa'},
  pullRequestId = 'PR_kwAEAg',
  defaultMergeMethod = MergeMethod.MERGE,
  hideIcon,
  isJSONAPI = false,
}: MergeBoxTestComponentProps) {
  const MergeBoxWithRelayQuery = () => {
    return (
      <MergeBoxWithRelay
        pullRequest={pullRequest}
        viewer={viewer}
        hideIcon={hideIcon}
        refetchQuery={() => {}}
        isReadingFromJSONAPI={isJSONAPI}
      />
    )
  }
  const appPayloadContextValue = useMemo(
    () => ({
      tracing: false,
      tracing_flamegraph: false,
      refListCacheKey: '',
      helpUrl: 'https://docs.github.com',
    }),
    [],
  )

  const appContext = useMemo(() => ({routes: [], history: createBrowserHistory()}), [])

  return (
    <AliveTestProvider>
      <AppContext.Provider value={appContext}>
        <AppPayloadContext.Provider value={appPayloadContextValue}>
          <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
            <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
              <MergeMethodContextProvider defaultMergeMethod={defaultMergeMethod}>
                {isJSONAPI ? (
                  <MergeBoxWithSuspense viewerLogin="monalisa" isReadingFromJSONAPI={isJSONAPI} />
                ) : (
                  <MergeBoxWithRelayQuery />
                )}
              </MergeMethodContextProvider>
            </PullRequestsAppWrapper>
          </PageDataContextProvider>
        </AppPayloadContext.Provider>
      </AppContext.Provider>
    </AliveTestProvider>
  )
}
