import {CommentIcon, XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Overlay} from '@primer/react'
import {memo, useCallback, useEffect, useRef, useState, useTransition} from 'react'
import {
  ConnectionHandler,
  graphql,
  type PreloadedQuery,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay'

import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import type {PullRequestMarkersCommentSidesheetQuery as PullRequestMarkersCommentSidesheetQueryType} from '../__generated__/PullRequestMarkersCommentSidesheetQuery.graphql'
import {PullRequestMarkersCommentSidesheetQuery} from '../PullRequestMarkers'
import type {CommentsSidesheet_pullRequest$key} from './__generated__/CommentsSidesheet_pullRequest.graphql'
import type {CommentsSidesheet_viewer$key} from './__generated__/CommentsSidesheet_viewer.graphql'
import {CommentsFilter, type CommentsFilterState, getDefaultFilterState, useFilteredComments} from './CommentsFilter'
import {ZeroState} from './marker-panels/ZeroState'
import {ThreadPreview} from './ThreadPreview'

interface CommentSidesheetBaseProps {
  toggleSidesheetRef: React.RefObject<HTMLButtonElement>
  onClose: () => void
  isOpen: boolean
}

interface CommentsSidesheetProps extends CommentSidesheetBaseProps {
  pullRequest: CommentsSidesheet_pullRequest$key
  viewer: CommentsSidesheet_viewer$key
}

/**
 * Get the connection ID for the `CommentsSidesheet_allThreads` thread connection
 * The filters should be kept in sync with the arguments used in the `CommentsSidesheet_pullRequest` fragment
 *
 * @param pullRequestId The ID of the pull request
 * @returns The connection ID
 */
export function commentsSidesheetConnectionId(pullRequestId: string): string {
  return `${ConnectionHandler.getConnectionID(pullRequestId, `CommentsSidesheet_allThreads`, {
    isPositioned: false,
    orderBy: 'DIFF_POSITION',
  })}`
}

/**
 *
 * Renders a sidesheet displaying previews of the pull request's threads
 */
export const CommentsSidesheet = memo(function CommentsSidesheet({
  onClose,
  isOpen,
  pullRequest,
  toggleSidesheetRef,
  viewer,
}: CommentsSidesheetProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment CommentsSidesheet_pullRequest on PullRequest {
        allThreads: threads(first: 50, isPositioned: false, orderBy: DIFF_POSITION)
          @connection(key: "CommentsSidesheet_allThreads") {
          edges {
            ...CommentsFilter_pullRequestThreadEdge
            node {
              id
              ...ThreadPreview_pullRequestThread
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const viewerData = useFragment(
    graphql`
      fragment CommentsSidesheet_viewer on User {
        ...ThreadPreview_viewer
      }
    `,
    viewer,
  )

  const [filterState, setFilterState] = useState<CommentsFilterState>(getDefaultFilterState())
  const filteredEdges = pullRequestData.allThreads.edges?.filter((edge): edge is NonNullable<typeof edge> => !!edge)
  const filteredThreadIds = useFilteredComments(filteredEdges ?? [], filterState)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const threads = pullRequestData?.allThreads.edges ?? []
  const hasThreads = threads.length > 0
  const {setActiveGlobalMarkerId} = usePullRequestMarkersContext()
  const navigateToThread = useCallback(
    (threadId: string) => {
      setActiveGlobalMarkerId(threadId)
      onClose()
    },
    [onClose, setActiveGlobalMarkerId],
  )

  const threadSummaries = threads
    .map(thread => {
      if (!thread?.node || !filteredThreadIds.has(thread.node.id)) return null
      return (
        <ThreadPreview
          key={thread.node.id}
          thread={thread.node}
          viewer={viewerData}
          onNavigateToDiffThread={navigateToThread}
        />
      )
    })
    .filter(Boolean)

  return (
    <Overlay
      anchorSide="inside-left"
      aria-label="Threads"
      initialFocusRef={closeButtonRef}
      position="fixed"
      returnFocusRef={toggleSidesheetRef}
      right={0}
      role="complementary"
      top={0}
      visibility={isOpen ? 'visible' : 'hidden'}
      width="xlarge"
      sx={{
        p: 3,
        pt: 0,
        height: '100vh',
        maxHeight: '100vh',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        overflowY: 'auto',
      }}
      onClickOutside={onClose}
      onEscape={onClose}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%'}}>
        <Box
          sx={{
            position: 'sticky',
            zIndex: 15,
            width: '100%',
            top: 0,
            backgroundColor: 'canvas.overlay',
            mx: -3,
            pb: 3,
            pt: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Heading as="h3" sx={{fontSize: 2, fontWeight: 600}}>
              Threads
            </Heading>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              ref={closeButtonRef}
              aria-label="Close comments panel"
              icon={XIcon}
              unsafeDisableTooltip={true}
              variant="invisible"
              onClick={onClose}
            />
          </Box>
          <CommentsFilter filterState={filterState} sx={{mt: 2, width: '100%'}} onFilterStateChange={setFilterState} />
        </Box>
        {threadSummaries.length > 0 ? (
          <Box sx={{display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', pb: 5, gap: 3}}>
            {threadSummaries}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <ZeroState
              description="Comments will show up here as soon as there are some."
              heading={hasThreads ? 'No comments match the current filter' : 'No comments on changes yet'}
              icon={CommentIcon}
            />
          </Box>
        )}
      </Box>
    </Overlay>
  )
})

interface CommentsSidesheetWrapperProps extends CommentSidesheetBaseProps {
  queryReference: PreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>
}

export function CommentsSidesheetWrapper({queryReference, ...rest}: CommentsSidesheetWrapperProps) {
  const data = usePreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
    queryReference,
  )
  if (!data.repository?.pullRequest) return null

  return <CommentsSidesheet {...rest} pullRequest={data.repository.pullRequest} viewer={data.viewer} />
}

interface CommentsSidesheetLoaderProps extends CommentSidesheetBaseProps {
  repoName: string
  repoOwner: string
  number: number
}

export function CommentsSidesheetLoader({
  repoName: name,
  repoOwner: owner,
  number,
  ...rest
}: CommentsSidesheetLoaderProps) {
  const [queryReference, loadQuery] = useQueryLoader<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
  )

  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      loadQuery({owner, repo: name, number}, {fetchPolicy: 'store-or-network'})
    })
  }, [loadQuery, owner, name, number])

  if (!queryReference) return null
  return <CommentsSidesheetWrapper {...rest} queryReference={queryReference} />
}
