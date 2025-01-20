import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'
import {useCallback, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import type {OpenAnnotationsPanelButton_pullRequest$key} from './__generated__/OpenAnnotationsPanelButton_pullRequest.graphql'
import {AnnotationsSidePanelLoader} from './AnnotationsSidePanel'

/**
 *
 * Renders a button that opens the annotations side panel
 * Contains the total number of annotations plus the icon
 */
export function OpenAnnotationsPanelButton({pullRequest}: {pullRequest: OpenAnnotationsPanelButton_pullRequest$key}) {
  const pullRequestData = useFragment(
    graphql`
      fragment OpenAnnotationsPanelButton_pullRequest on PullRequest {
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

  const [sidePanelIsOpen, setSidePanelIsOpen] = useState(false)
  const toggleSidePanelRef = useRef<HTMLButtonElement>(null)
  const {filteredAnnotations: annotations} = usePullRequestMarkersContext()

  const handleClose = useCallback(() => setSidePanelIsOpen(false), [])

  const totalAnnotationsCount = annotations.length

  return totalAnnotationsCount > 0 ? (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <ErrorBoundary
        fallback={
          <Button
            aria-label="The annotations side panel cannot currently be opened."
            leadingVisual={AlertIcon}
            size="small"
            variant="invisible"
          >
            <Text sx={{color: 'fg.default', fontSize: 0}}>{totalAnnotationsCount}</Text>
          </Button>
        }
      >
        <Button
          ref={toggleSidePanelRef}
          aria-label="Open annotations side panel"
          leadingVisual={AlertIcon}
          size="small"
          variant="invisible"
          onClick={() => {
            ensurePreviousActiveDialogIsClosed()
            setSidePanelIsOpen(true)
          }}
        >
          <Text sx={{color: 'fg.default', fontSize: 0}}>{totalAnnotationsCount}</Text>
        </Button>
        <AnnotationsSidePanelLoader
          isOpen={sidePanelIsOpen}
          number={pullRequestData.number}
          repoName={pullRequestData.repository.name}
          repoOwner={pullRequestData.repository.owner.login}
          returnFocusRef={toggleSidePanelRef}
          onClose={handleClose}
        />
      </ErrorBoundary>
    </Box>
  ) : null
}
