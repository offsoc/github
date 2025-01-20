import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {CommentDiscussionIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'
import {useCallback, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {OpenCommentsPanelButton_pullRequest$key} from './__generated__/OpenCommentsPanelButton_pullRequest.graphql'
import {CommentsSidesheetLoader} from './CommentsSidesheet'

/**
 *
 * Renders a button that opens the comments sidesheet
 * Contains the total number of comments plus the icon
 *
 */
export function OpenCommentsPanelButton({pullRequest}: {pullRequest: OpenCommentsPanelButton_pullRequest$key}) {
  const [commentsSidesheetIsOpen, setCommentsSidesheetIsOpen] = useState(false)
  const toggleSidesheetRef = useRef<HTMLButtonElement>(null)

  const exitOverlay = useCallback(() => {
    setCommentsSidesheetIsOpen(false)
  }, [])

  const pullRequestData = useFragment(
    graphql`
      fragment OpenCommentsPanelButton_pullRequest on PullRequest {
        allThreads: threads(first: 50, isPositioned: false) {
          totalCommentsCount
        }
        number
        repository {
          name
          owner {
            login
          }
        }
      }
    `,
    pullRequest,
  )

  const totalCommentCount = pullRequestData?.allThreads.totalCommentsCount ?? 0

  return (
    <Box sx={{display: 'flex', alignItems: 'center', paddingRight: 2}}>
      <ErrorBoundary
        fallback={
          <Button
            aria-label="The comments sidesheet cannot currently be opened."
            leadingVisual={CommentDiscussionIcon}
            size="small"
            variant="invisible"
          >
            <Text sx={{color: 'fg.default', fontSize: 0}}>{totalCommentCount}</Text>
          </Button>
        }
      >
        <Button
          ref={toggleSidesheetRef}
          aria-label="Open comments sidesheet"
          leadingVisual={CommentDiscussionIcon}
          size="small"
          variant="invisible"
          onClick={() => {
            ensurePreviousActiveDialogIsClosed()
            setCommentsSidesheetIsOpen(true)
          }}
        >
          <Text sx={{color: 'fg.default', fontSize: 0}}>{totalCommentCount}</Text>
        </Button>
        <CommentsSidesheetLoader
          isOpen={commentsSidesheetIsOpen}
          number={pullRequestData.number}
          repoName={pullRequestData.repository.name}
          repoOwner={pullRequestData.repository.owner.login}
          toggleSidesheetRef={toggleSidesheetRef}
          onClose={exitOverlay}
        />
      </ErrorBoundary>
    </Box>
  )
}
