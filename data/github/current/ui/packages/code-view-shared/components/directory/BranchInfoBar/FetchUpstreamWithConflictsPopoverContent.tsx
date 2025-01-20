import type {RefComparison} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {newPullRequestPath} from '@github-ui/paths'
import {AlertIcon} from '@primer/octicons-react'
import {Button, Link} from '@primer/react'

import {useDisabledWithLabel} from '../../../hooks/use-disabled-with-label'
import {syncForkButtonEventPayload} from './generate-button-event-payload'
import {getCommitsCountText} from './get-commits-count-text'
import {PopoverActions, PopoverContent, PopoverIcon} from './InfobarPopover'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {clsx} from 'clsx'
import LinkButtonCSS from '../../../css/LinkButton.module.css'

interface Props {
  comparison: RefComparison
  discard: () => Promise<void>
}

export function FetchUpstreamWithConflictsPopoverContent({comparison, discard}: Props) {
  const repo = useCurrentRepository()
  const {sendRepoClickEvent} = useReposAnalytics()
  const createPullRequestPath = newPullRequestPath({repo, refName: comparison.currentRef})
  const commitsCountText = getCommitsCountText(comparison.ahead)

  const discardButton = useDisabledWithLabel(`Discard ${commitsCountText}`, 'Discarding changes...', discard)

  return (
    <>
      <PopoverContent
        icon={<PopoverIcon icon={AlertIcon} bg="neutral.emphasis" />}
        header="This branch has conflicts that must be resolved"
        content={
          <>
            <p>
              Discard {commitsCountText} to make this branch match the upstream repository. {commitsCountText} will be
              removed from this branch.
            </p>
            <p>You can resolve merge conflicts using the command line and a text editor.</p>
          </>
        }
      />
      <PopoverActions>
        <Button
          className="flex-1"
          onClick={discardButton.action}
          disabled={discardButton.disabled}
          data-testid="discard-button"
          variant="danger"
        >
          {discardButton.label}
        </Button>
        <Button
          as={Link}
          className={clsx(LinkButtonCSS['code-view-link-button'], 'flex-1')}
          href={createPullRequestPath}
          variant="primary"
          data-testid="open-pr-button"
          onClick={() =>
            sendRepoClickEvent('SYNC_FORK.OPEN_PR', {...syncForkButtonEventPayload, action: 'Open pull request'})
          }
        >
          Open pull request
        </Button>
      </PopoverActions>
    </>
  )
}
