import {assertDataPresent} from '@github-ui/assert-data-present'
import {Spinner} from '@primer/react'
import {memo, startTransition, useCallback, useState, Suspense, useMemo} from 'react'
import {readInlineData, usePreloadedQuery, type FetchPolicy, type PreloadedQuery} from 'react-relay'
import type {MergeMethod, PullRequestMergeRequirements, RelayPullRequest, ViewerPayload} from '../types'
import {MergeAction} from '../types'
import {useMergeMethodContext} from '../contexts/MergeMethodContext'
import type {useLoadMergeBoxQuery as useLoadMergeBoxQueryType} from '../hooks/__generated__/useLoadMergeBoxQuery.graphql'
import type {useLoadMergeBoxQuery_pullRequest$key} from '../hooks/__generated__/useLoadMergeBoxQuery_pullRequest.graphql'
import {ChecksSection} from './sections/ChecksSection'
import {ChecksSectionFetchFailure} from './sections/ChecksSectionFetchFailure'
import {ClosedOrMergedStateMergeBoxWithRelay} from './ClosedOrMergedStateMergeBox'
import {ConflictsSectionWithRelay, type ConflictsSectionProps} from './sections/ConflictsSection'
import {useMergeabilityLiveUpdates, type Channels} from '../hooks/use-mergeability-live-updates'
import {LoadMergeBoxQuery, MergeBoxFragment, useLoadMergeBoxQuery} from '../hooks/use-load-merge-box-query'
import {MergeQueueSectionWithRelay} from './sections/merge-section/MergeQueueSection'
import {MergeSectionWithRelay} from './sections/merge-section/MergeSection'
import {BlockedSection, type BlockedSectionProps} from './sections/BlockedSection'
import {DraftStateSectionWithRelay} from './sections/DraftStateSection'
import styles from './MergeBox.module.css'
import type {Status} from '../helpers/mergeability-status'
import {
  borderColorClassForStatus,
  mergeabilityStatus,
  mergeabilityStatusFromRelay,
  presentationForStatus,
} from '../helpers/mergeability-status'
import {GitMergeIcon, GitMergeQueueIcon} from '@primer/octicons-react'
import {MergeabilityIcon} from './MergeabilityIcon'
import {QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ReviewerSection, type ReviewerSectionProps} from './sections/ReviewerSection'
import {useMergeBoxPageData} from '../page-data/loaders/use-merge-box-page-data'
import {
  getConflictsCondition,
  getFailingMergeConditionsWithoutRulesCondition,
  getFailingRulesConditions,
  getReviewRuleRollupMetadata,
  transformProperties,
} from '../helpers/json-api-helpers'

type RefetchQuery = (input: {mergeMethod: MergeMethod; id: string}, policy: {fetchPolicy: FetchPolicy}) => void

function MergeBoxLoading() {
  return (
    <div className={styles.mergeboxLoading}>
      <Spinner />
    </div>
  )
}

type MergeBoxWithRelaySuspenseProps = {
  /**
   * The ID of the pull request
   */
  pullRequestId: string
  /**
   * When true, hides the mergeability icon that is shown to the left of the mergebox
   */
  hideIcon?: boolean
  /**
   * When true the mergebox is reading from the JSON API
   */
  isReadingFromJSONAPI?: boolean
}

/**
 * Provides a suspense boundary for the mergebox
 */
export const MergeBoxWithRelaySuspense = memo(function MergeBoxWithRelaySuspense({
  pullRequestId,
  hideIcon = false,
  isReadingFromJSONAPI = false,
}: MergeBoxWithRelaySuspenseProps) {
  const {query, loadQuery} = useLoadMergeBoxQuery({pullRequestId})
  if (!query) return <MergeBoxLoading />

  return (
    <Suspense fallback={<MergeBoxLoading />}>
      <MergeBoxWithRelayWrapper
        query={query}
        hideIcon={hideIcon}
        refetchQuery={loadQuery}
        isReadingFromJSONAPI={isReadingFromJSONAPI}
      />
    </Suspense>
  )
})

type MergeBoxWithSuspenseProps = {
  /**
   * When true, hides the mergeability icon that is shown to the left of the mergebox
   */
  hideIcon?: boolean
  /**
   * The current user's display login
   */
  viewerLogin: string

  /**
   * When true, the mergebox is reading from the JSON API
   */
  isReadingFromJSONAPI: boolean
}
/**
 * Provides a suspense boundary for the mergebox
 */
export const MergeBoxWithSuspense = memo(function MergeBoxWithSuspense({
  hideIcon = false,
  ...rest
}: MergeBoxWithSuspenseProps) {
  return (
    <Suspense fallback={<MergeBoxLoading />}>
      <QueryClientProvider client={queryClient}>
        <MergeBoxWrapper hideIcon={hideIcon} {...rest} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Suspense>
  )
})

/**
 * Loads the data for the MergeBox
 */
export function MergeBoxWithRelayWrapper({
  query,
  refetchQuery,
  hideIcon = false,
  isReadingFromJSONAPI,
}: {
  query: PreloadedQuery<useLoadMergeBoxQueryType>
  refetchQuery: RefetchQuery
  hideIcon?: boolean
  isReadingFromJSONAPI: boolean
}) {
  const data = usePreloadedQuery<useLoadMergeBoxQueryType>(LoadMergeBoxQuery, query)

  const pullRequest = data.pullRequest
  if (!pullRequest) return null
  // eslint-disable-next-line no-restricted-syntax
  const pullRequestData = readInlineData<useLoadMergeBoxQuery_pullRequest$key>(MergeBoxFragment, pullRequest)

  return (
    <QueryClientProvider client={queryClient}>
      <MergeBoxWithRelay
        pullRequest={pullRequestData}
        viewer={data.viewer}
        hideIcon={hideIcon}
        refetchQuery={refetchQuery}
        isReadingFromJSONAPI={isReadingFromJSONAPI}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

/**
 * Loads the data for the MergeBox and translates it into an agnostic format for the MergeBox
 */
export function MergeBoxWrapper({
  viewerLogin,
  isReadingFromJSONAPI,
  ...rest
}: {
  hideIcon?: boolean
  viewerLogin: string
  isReadingFromJSONAPI: boolean
}) {
  const {mergeMethod} = useMergeMethodContext()
  const {
    data: {pullRequest, mergeRequirements},
    refetch,
  } = useMergeBoxPageData({mergeMethod, bypassRequirements: false})

  const status = mergeabilityStatus({pullRequest, mergeRequirements})

  const aliveChannels = pullRequest.mergeBoxAliveChannels
  const reviewRules = getReviewRuleRollupMetadata(mergeRequirements)
  const conflictsCondition = getConflictsCondition(mergeRequirements)

  const failingMergeConditionsWithoutRulesCondition = getFailingMergeConditionsWithoutRulesCondition(mergeRequirements)

  const failingRulesConditions = getFailingRulesConditions(mergeRequirements)
  const pullRequestData = transformProperties(pullRequest)

  // Create a refetch query function with the same interface. Ignore arguments because the TanStack query doesn't need them.
  function refetchQuery(_input: {mergeMethod: MergeMethod; id: string}) {
    refetch()
  }

  return (
    <MergeBox
      aliveChannels={aliveChannels}
      conflictsCondition={conflictsCondition}
      failingMergeConditionsWithoutRulesCondition={failingMergeConditionsWithoutRulesCondition}
      failingRulesConditions={failingRulesConditions}
      mergeRequirements={mergeRequirements}
      numberOfCommits={pullRequest.numberOfCommits || 0}
      pullRequest={pullRequestData}
      reviewRules={reviewRules}
      reviews={pullRequest.latestOpinionatedReviews}
      status={status}
      viewerLogin={viewerLogin}
      refetchQuery={refetchQuery}
      isReadingFromJSONAPI={isReadingFromJSONAPI}
      {...rest}
    />
  )
}

/**
 * Transforms relay-specific data into an agnostic format
 */
export function MergeBoxWithRelay({
  pullRequest: pullRequestData,
  viewer: viewerData,
  isReadingFromJSONAPI,
  ...rest
}: {
  pullRequest: RelayPullRequest
  viewer: ViewerPayload
  hideIcon?: boolean
  refetchQuery: RefetchQuery
  isReadingFromJSONAPI: boolean
}) {
  const reviews = (pullRequestData.latestOpinionatedReviews?.edges || []).flatMap(reviewEdge => {
    const reviewData = reviewEdge?.node
    if (!reviewData) return []

    return {
      ...reviewData,
      onBehalfOf: reviewData.onBehalfOf.edges?.flatMap(onBehalfOf => onBehalfOf?.node?.name ?? []) ?? [],
    }
  })

  const {mergeRequirements} = pullRequestData
  const applicableRulesCondition = mergeRequirements.conditions?.filter(
    c => c.__typename === 'PullRequestRulesCondition',
  )?.[0]

  const reviewRules =
    applicableRulesCondition?.__typename === 'PullRequestRulesCondition' && applicableRulesCondition?.ruleRollups
      ? applicableRulesCondition.ruleRollups
      : []

  const conflictsCondition = mergeRequirements.conditions.find(
    c => c.__typename === 'PullRequestMergeConflictStateCondition',
  )
  const failingMergeConditionsWithoutRulesCondition = mergeRequirements.conditions.filter(
    condition =>
      'result' in condition && condition.result === 'FAILED' && condition.__typename !== 'PullRequestRulesCondition',
  )
  const failingRulesConditions = mergeRequirements.conditions.filter(
    condition =>
      'result' in condition && condition.result === 'FAILED' && condition.__typename === 'PullRequestRulesCondition',
  )
  const status = mergeabilityStatusFromRelay(pullRequestData)
  const aliveChannels = useMemo(() => {
    return {
      stateChannel: pullRequestData.stateChannel,
      deployedChannel: pullRequestData.deployedChannel,
      reviewStateChannel: pullRequestData.reviewStateChannel,
      workflowsChannel: pullRequestData.workflowsChannel,
      mergeQueueChannel: pullRequestData.mergeQueueChannel,
      headRefChannel: pullRequestData.headRefChannel,
      baseRefChannel: pullRequestData.baseRefChannel,
      commitHeadShaChannel: pullRequestData.commitHeadShaChannel,
      gitMergeStateChannel: pullRequestData.gitMergeStateChannel,
    }
  }, [
    pullRequestData.stateChannel,
    pullRequestData.deployedChannel,
    pullRequestData.reviewStateChannel,
    pullRequestData.workflowsChannel,
    pullRequestData.mergeQueueChannel,
    pullRequestData.headRefChannel,
    pullRequestData.baseRefChannel,
    pullRequestData.commitHeadShaChannel,
    pullRequestData.gitMergeStateChannel,
  ])

  return (
    <MergeBox
      aliveChannels={aliveChannels}
      conflictsCondition={conflictsCondition && Object.assign(conflictsCondition)}
      failingMergeConditionsWithoutRulesCondition={failingMergeConditionsWithoutRulesCondition}
      failingRulesConditions={failingRulesConditions}
      mergeRequirements={mergeRequirements}
      numberOfCommits={pullRequestData.commits.totalCount || 0}
      pullRequest={pullRequestData}
      reviewRules={Object.assign(reviewRules)}
      reviews={reviews}
      status={status}
      viewerLogin={viewerData.login}
      isReadingFromJSONAPI={isReadingFromJSONAPI}
      {...rest}
    />
  )
}

type MergeBoxPullRequest = Omit<
  RelayPullRequest,
  | 'baseRefChannel'
  | 'commitHeadShaChannel'
  | 'commits'
  | 'deployedChannel'
  | 'gitMergeStateChannel'
  | 'headRefChannel'
  | 'mergeQueueChannel'
  | 'mergeRequirements'
  | 'reviewStateChannel'
  | 'stateChannel'
  | 'workflowsChannel'
  | 'latestOpinionatedReviews'
>

export type MergeBoxProps = {
  aliveChannels: Channels
  conflictsCondition: ConflictsSectionProps['conflictsCondition']
  failingMergeConditionsWithoutRulesCondition: BlockedSectionProps['failingMergeConditionsWithoutRulesCondition']
  failingRulesConditions: BlockedSectionProps['failingRulesConditions']
  hideIcon?: boolean
  isReadingFromJSONAPI: boolean
  mergeRequirements: Pick<
    PullRequestMergeRequirements,
    'commitAuthor' | 'commitMessageBody' | 'commitMessageHeadline' | 'state'
  > | null
  numberOfCommits: number
  pullRequest: MergeBoxPullRequest
  refetchQuery: RefetchQuery
  reviewRules: ReviewerSectionProps['reviewerRuleRollups']
  reviews: ReviewerSectionProps['latestOpinionatedReviews']
  status: Status
  viewerLogin: string
}
/**
 * The actual mergebox with sections
 */
export function MergeBox({
  aliveChannels,
  conflictsCondition,
  failingMergeConditionsWithoutRulesCondition,
  failingRulesConditions,
  hideIcon = false,
  isReadingFromJSONAPI,
  mergeRequirements,
  numberOfCommits,
  pullRequest: pullRequestData,
  refetchQuery: refetch,
  reviewRules,
  reviews,
  status,
  viewerLogin,
}: MergeBoxProps) {
  const directMergeAction = pullRequestData.viewerMergeActions.find(action => action.name === MergeAction.DIRECT_MERGE)
  assertDataPresent(directMergeAction)

  const [shouldFocusPrimaryMergeButton, setShouldFocusPrimaryMergeButton] = useState(false)
  const {mergeMethod} = useMergeMethodContext()
  const {isInMergeQueue, state, viewerCanDeleteHeadRef, viewerCanRestoreHeadRef} = pullRequestData
  const shouldHideIcon =
    hideIcon || ((state === 'CLOSED' || state === 'MERGED') && !viewerCanDeleteHeadRef && !viewerCanRestoreHeadRef)

  const mergeStatusPresentation = presentationForStatus(status)
  const mergeboxBorderColor = borderColorClassForStatus(status)

  const mergeBoxIcon = isInMergeQueue ? GitMergeQueueIcon : GitMergeIcon

  const refetchQuery = useCallback(() => {
    startTransition(() => {
      refetch({mergeMethod, id: pullRequestData.id}, {fetchPolicy: 'network-only'})
    })
  }, [pullRequestData.id, mergeMethod, refetch])

  useMergeabilityLiveUpdates({refetchQuery, channels: aliveChannels})

  const focusPrimaryMergeButton = useCallback(() => {
    setShouldFocusPrimaryMergeButton(true)
  }, [setShouldFocusPrimaryMergeButton])

  return (
    <div id="partial-pull-merging" className="position-relative">
      {!shouldHideIcon && (
        <MergeabilityIcon
          icon={mergeBoxIcon}
          ariaLabel={mergeStatusPresentation.title}
          iconBackgroundColor={mergeStatusPresentation.iconColor}
        />
      )}

      {pullRequestData.state !== 'OPEN' || !mergeRequirements ? (
        <ClosedOrMergedStateMergeBoxWithRelay
          id={pullRequestData.id}
          state={pullRequestData.state}
          headRefName={pullRequestData.headRefName}
          headRepository={pullRequestData.headRepository}
          viewerCanDeleteHeadRef={pullRequestData.viewerCanDeleteHeadRef}
          viewerCanRestoreHeadRef={pullRequestData.viewerCanRestoreHeadRef}
        />
      ) : (
        <div className={`border rounded-2 ${mergeboxBorderColor}`}>
          {isInMergeQueue ? (
            <MergeQueueSectionWithRelay
              id={pullRequestData.id}
              viewerCanAddAndRemoveFromMergeQueue={pullRequestData.viewerCanAddAndRemoveFromMergeQueue}
              mergeQueueEntry={pullRequestData.mergeQueueEntry}
              mergeQueue={pullRequestData.mergeQueue}
              focusPrimaryMergeButton={focusPrimaryMergeButton}
            />
          ) : (
            <>
              <ReviewerSection reviewerRuleRollups={reviewRules} latestOpinionatedReviews={reviews} />
              <ErrorBoundary fallback={<ChecksSectionFetchFailure />}>
                <ChecksSection pullRequestId={pullRequestData.id} pullRequestHeadSha={pullRequestData.headRefOid} />
              </ErrorBoundary>
              <ConflictsSectionWithRelay
                baseRefName={pullRequestData.baseRefName}
                id={pullRequestData.id}
                conflictsCondition={conflictsCondition}
                mergeStateStatus={pullRequestData.mergeStateStatus}
                resourcePath={pullRequestData.resourcePath}
                viewerCanUpdateBranch={pullRequestData.viewerCanUpdateBranch}
                viewerLogin={viewerLogin}
              />
              <BlockedSection
                isDraft={pullRequestData.isDraft}
                failingMergeConditionsWithoutRulesCondition={failingMergeConditionsWithoutRulesCondition}
                failingRulesConditions={failingRulesConditions}
                mergeRequirementsState={mergeRequirements.state}
              />
              <DraftStateSectionWithRelay
                id={pullRequestData.id}
                isDraft={pullRequestData.isDraft}
                state={pullRequestData.state}
                viewerCanUpdate={pullRequestData.viewerCanUpdate}
              />
              <MergeSectionWithRelay
                autoMergeRequest={pullRequestData.autoMergeRequest}
                baseRefName={pullRequestData.baseRefName}
                numberOfCommits={numberOfCommits}
                conflictsCondition={conflictsCondition}
                id={pullRequestData.id}
                isDraft={pullRequestData.isDraft}
                isInMergeQueue={pullRequestData.isInMergeQueue}
                mergeQueue={pullRequestData.mergeQueue}
                commitAuthor={mergeRequirements.commitAuthor}
                commitMessageBody={mergeRequirements.commitMessageBody}
                commitMessageHeadline={mergeRequirements.commitMessageHeadline}
                mergeRequirementsState={mergeRequirements.state}
                mergeStateStatus={pullRequestData.mergeStateStatus}
                viewerCanAddAndRemoveFromMergeQueue={pullRequestData.viewerCanAddAndRemoveFromMergeQueue}
                viewerCanDisableAutoMerge={pullRequestData.viewerCanDisableAutoMerge}
                viewerMergeActions={pullRequestData.viewerMergeActions}
                viewerCanEnableAutoMerge={pullRequestData.viewerCanEnableAutoMerge}
                refetchMergeBoxQuery={refetchQuery}
                shouldFocusPrimaryMergeButton={shouldFocusPrimaryMergeButton}
                setShouldFocusPrimaryMergeButton={setShouldFocusPrimaryMergeButton}
                isReadingFromJSONAPI={isReadingFromJSONAPI}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
