import {graphql} from 'relay-runtime'

import {useFragment, useRelayEnvironment} from 'react-relay'
import type {PinnedIssueIssue$key} from './__generated__/PinnedIssueIssue.graphql'
import {useCallback} from 'react'
import {ActionList, ActionMenu, Box, IconButton, Link, Octicon, RelativeTime, Text} from '@primer/react'
import {ArrowSwitchIcon, CommentIcon, KebabHorizontalIcon, PinSlashIcon} from '@primer/octicons-react'
import {userHovercardPath} from '@github-ui/paths'
import {getIssueStateIcon} from '@github-ui/list-view-items-issues-prs/StateIcon'
import {commitUnpinIssueMutation} from '@github-ui/issue-viewer/commitUnpinIssueMutation'
import {SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '../../constants/errors'
import {MoveModalTrigger} from '@github-ui/drag-and-drop'

type PinnedIssueProps = {
  issue: PinnedIssueIssue$key
}

export function PinnedIssue({issue}: PinnedIssueProps) {
  const data = useFragment(
    graphql`
      fragment PinnedIssueIssue on Issue {
        id
        title
        titleHTML
        url
        createdAt
        state
        stateReason
        number
        author {
          login
          url
        }
        totalCommentsCount
        repository {
          viewerCanPinIssues
        }
      }
    `,
    issue,
  )

  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const unpin = useCallback(() => {
    commitUnpinIssueMutation({
      environment,
      input: {issueId: data.id},
      onCompleted: () => {},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotUnpinIssue,
        })
      },
    })
  }, [addToast, data.id, environment])

  const stateOrReason = data.state === 'CLOSED' && data.stateReason === 'NOT_PLANNED' ? 'NOT_PLANNED' : data.state
  const state = getIssueStateIcon(stateOrReason)
  const commentCount = data.totalCommentsCount ?? 0
  const createdAt = new Date(data.createdAt)

  const wrapStyles = {
    display: '-webkit-box',
    overflow: 'hidden',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': '2',
    maxWidth: 'unset',
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2, py: 1}}>
      <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <Box sx={{display: 'flex', gap: 2}}>
          <Link
            aria-label={`View ${data.title}`}
            className={'css-truncate'}
            sx={{fontWeight: 'bold', color: 'fg.default', flexGrow: 1, fontSize: 2, pt: 1, mb: 1, ...wrapStyles}}
            href={data.url}
            muted
          >
            <Octicon sx={{color: state.color, mr: 2, mb: '1px'}} icon={state.icon} aria-label={state.description} />
            <SafeHTMLText html={data.titleHTML as SafeHTMLString} />
          </Link>
          {data.repository.viewerCanPinIssues && (
            <ActionMenu>
              <ActionMenu.Anchor>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  size="small"
                  sx={{color: 'fg.muted', flexShrink: 0, gridArea: 'overflow'}}
                  icon={KebabHorizontalIcon}
                  variant="invisible"
                  aria-label="Pinned issue options"
                />
              </ActionMenu.Anchor>
              <ActionMenu.Overlay width="medium">
                <ActionList>
                  <ActionList.Item onSelect={unpin} aria-label={`Unpin issue #${data.number}, ${data.title}`}>
                    <ActionList.LeadingVisual>
                      <Octicon icon={PinSlashIcon} />
                    </ActionList.LeadingVisual>
                    Unpin
                  </ActionList.Item>
                  <MoveModalTrigger Component={ActionListItemReorder} />
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          )}
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2}}>
          <Text sx={{fontSize: 0, color: 'fg.muted'}}>
            #{data.number} &middot;{' '}
            {data.author && (
              <Link
                aria-label={`View ${data.author.login} profile`}
                href={data.author.url}
                data-hovercard-url={userHovercardPath({owner: data.author.login})}
                muted
              >
                {data.author.login}
              </Link>
            )}{' '}
            {/* Added whitespace:normal to prevent the cards becoming different sizes to accomodate the timestamp length */}
            opened{' '}
            <RelativeTime date={createdAt}>
              on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
            </RelativeTime>
          </Text>
          {commentCount > 0 && (
            <Box sx={{display: 'flex', flexShrink: 0, gap: 1, alignItems: 'center', pr: 1}}>
              <Octicon icon={CommentIcon} sx={{color: 'fg.muted'}} aria-label={`${commentCount} comments`} />
              <Text sx={{fontSize: 0, color: 'fg.muted', whiteSpace: 'nowrap'}}>{commentCount}</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// onClick is set automatically by the MoveModalTrigger component
function ActionListItemReorder({onClick}: {onClick?: () => void}) {
  return (
    <ActionList.Item onSelect={onClick}>
      <ActionList.LeadingVisual>
        <Octicon icon={ArrowSwitchIcon} />
      </ActionList.LeadingVisual>
      Reorder
    </ActionList.Item>
  )
}
