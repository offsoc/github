// disable relay unused fields rule for this whole file since we are knowingly ejecting from relay best practices and
// just using it for data fetching here.
/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import type {DiffAnnotation} from '@github-ui/conversations'
import type {DiffEntryData, DiffLine, DiffLinesProps as SharedDiffLinesProps} from '@github-ui/diff-lines'
import {DiffLines as SharedDiffLines} from '@github-ui/diff-lines'
import {memo, useCallback, useEffect, useMemo, useTransition} from 'react'
import {graphql, useFragment, useRefetchableFragment} from 'react-relay'

import {RELAY_CONSTANTS} from '../../constants'
import {usePullRequestContext} from '../../contexts/PullRequestContext'
import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import type {DiffAnnotationsByEndLineMap} from '../../helpers/annotation-helpers'
import type {DiffLineRange} from '../../hooks/use-injected-context-range'
import useInjectedContextLines from '../../hooks/use-injected-context-range'
import {usePullRequestCommenting} from '../../hooks/use-pull-request-commenting'
import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'
import type {DiffEntryWithContextLinesQuery} from './__generated__/DiffEntryWithContextLinesQuery.graphql'
import type {DiffLines_diffEntry$data, DiffLines_diffEntry$key} from './__generated__/DiffLines_diffEntry.graphql'
import type {DiffLines_viewer$key} from './__generated__/DiffLines_viewer.graphql'

function mapDiffEntryData(
  diffLinesData: DiffLines_diffEntry$data,
  diffMetadata: DiffMetadata,
  annotations: DiffAnnotationsByEndLineMap = {},
): DiffEntryData {
  const diffLines =
    diffLinesData.diffLines
      ?.filter(d => !!d)
      .map(diffLine => {
        let diffLineAnnotations: DiffAnnotation[] = []
        // Only show annotations on right side of split diff view
        if (diffLine && diffLine.right && diffLine.type !== 'DELETION') {
          diffLineAnnotations = annotations[diffLine.blobLineNumber] ?? []
        }
        return {
          ...diffLine,
          annotationsData: {
            totalCount: diffLineAnnotations.length,
            annotations: diffLineAnnotations,
          },
          threadsData: {
            ...diffLine?.threads,
            threads:
              diffLine?.threads?.edges
                ?.filter(d => !!d?.node)
                .map(thread => {
                  return {
                    ...thread?.node,
                    commentsData: {
                      ...thread?.node?.comments,
                      comments:
                        thread?.node?.comments.edges
                          ?.filter(d => !!d?.node)
                          .map(comment => {
                            return {
                              ...comment?.node,
                            }
                          }) ?? [],
                    },
                  }
                }) ?? [],
          },
        }
      }) ?? []

  return {
    ...diffMetadata,
    diffLines: diffLines as DiffLine[],
  } as DiffEntryData
}

type DiffMetadata = Omit<SharedDiffLinesProps['diffEntryData'], 'diffLines'>

export type DiffLinesProps = {
  annotations?: DiffAnnotationsByEndLineMap
  diffEntry: DiffLines_diffEntry$key
  diffLinesManuallyUnhidden: boolean
  diffMetadata: DiffMetadata
  viewer: DiffLines_viewer$key
  isSingleFileView?: boolean
  activeGlobalMarkerID: string | undefined
  injectedRanges?: ReadonlyArray<{
    readonly end: number
    readonly start: number
  }> | null
  onHandleLoadDiff: () => void
}

const DiffLines = memo(function DiffLines({
  annotations,
  diffEntry,
  diffLinesManuallyUnhidden,
  diffMetadata,
  viewer,
  activeGlobalMarkerID,
  injectedRanges,
  onHandleLoadDiff,
}: DiffLinesProps) {
  const {helpUrl: baseHelpUrl} = usePullRequestPageAppPayload()
  const {ghostUser} = usePullRequestPageAppPayload()
  const [diffEntryData, refetchQuery] = useRefetchableFragment<DiffEntryWithContextLinesQuery, DiffLines_diffEntry$key>(
    graphql`
      fragment DiffLines_diffEntry on PullRequestDiffEntry @refetchable(queryName: "DiffEntryWithContextLinesQuery") {
        objectId: __id
        id
        diffLines(injectedContextLines: $injectedContextLines) {
          __id
          left
          right
          blobLineNumber
          html
          type
          text
          threads(first: $inlineThreadCount) {
            __id
            totalCount
            totalCommentsCount
            edges {
              node {
                diffSide
                id
                isOutdated
                line
                startDiffSide
                startLine
                comments(first: 50) {
                  __id
                  totalCount
                  edges {
                    node {
                      author {
                        avatarUrl(size: 48)
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    diffEntry,
  )

  const viewerData = useFragment(
    graphql`
      fragment DiffLines_viewer on User {
        avatarUrl(size: 48)
        isSiteAdmin
        login
        pullRequestUserPreferences {
          diffView
          tabSize
        }
      }
    `,
    viewer,
  )

  const {
    pullRequestId,
    repositoryId,
    viewerCanComment,
    viewerPendingReviewId,
    viewerCanApplySuggestion,
    state,
    isInMergeQueue,
  } = usePullRequestContext()
  const [isRunning, startTransition] = useTransition()
  const {addInjectedContextLines} = useInjectedContextLines()
  const handleAddInjectedContextLines = useCallback(
    (range: DiffLineRange) => addInjectedContextLines(diffEntryData.objectId, range, 'ListDiffView'),
    [addInjectedContextLines, diffEntryData.objectId],
  )

  const commentingImplementation = usePullRequestCommenting()
  const markerNavigationImplementation = usePullRequestMarkersContext()
  const markerNavigationWithGlobalThreadProps = useMemo(() => {
    return {
      ...markerNavigationImplementation,
      activeGlobalMarkerID,
    }
  }, [markerNavigationImplementation, activeGlobalMarkerID])

  const mappedDiffEntryData = useMemo(
    () => mapDiffEntryData(diffEntryData, diffMetadata, annotations),
    [annotations, diffMetadata, diffEntryData],
  )
  const diffViewerData = useMemo(
    () => ({
      avatarUrl: viewerData.avatarUrl,
      diffViewPreference: viewerData.pullRequestUserPreferences.diffView,
      isSiteAdmin: viewerData.isSiteAdmin,
      login: viewerData.login,
      tabSizePreference: viewerData.pullRequestUserPreferences.tabSize,
      viewerCanComment: !!viewerCanComment,
      viewerCanApplySuggestion: !!viewerCanApplySuggestion,
    }),
    [
      viewerCanApplySuggestion,
      viewerCanComment,
      viewerData.avatarUrl,
      viewerData.isSiteAdmin,
      viewerData.login,
      viewerData.pullRequestUserPreferences.diffView,
      viewerData.pullRequestUserPreferences.tabSize,
    ],
  )

  useEffect(() => {
    if (!injectedRanges) return

    function refreshDiffEntry() {
      if (isRunning) return

      const variables = {
        id: diffEntryData.id,
        injectedContextLines: injectedRanges,
        inlineThreadCount: RELAY_CONSTANTS.inlineThreadCount,
      }

      startTransition(() => {
        refetchQuery(variables, {fetchPolicy: 'store-or-network'})
      })
    }

    refreshDiffEntry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffEntryData.id, injectedRanges?.length, pullRequestId])

  return (
    <SharedDiffLines
      commentingEnabled
      addInjectedContextLines={handleAddInjectedContextLines}
      baseHelpUrl={baseHelpUrl}
      commentBatchPending={!!viewerPendingReviewId}
      commentingImplementation={commentingImplementation}
      diffEntryData={mappedDiffEntryData}
      diffLinesManuallyUnhidden={diffLinesManuallyUnhidden}
      ghostUser={ghostUser}
      markerNavigationImplementation={markerNavigationWithGlobalThreadProps}
      newCommitOid={diffMetadata.newCommitOid}
      oldCommitOid={diffMetadata.oldCommitOid}
      repositoryId={repositoryId}
      subject={useMemo(() => ({state, isInMergeQueue}), [isInMergeQueue, state])}
      subjectId={pullRequestId}
      viewerData={diffViewerData}
      onHandleLoadDiff={onHandleLoadDiff}
    />
  )
})

export default DiffLines
