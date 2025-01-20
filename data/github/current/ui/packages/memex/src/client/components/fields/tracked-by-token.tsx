import {Box, Link, Text, Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {Owner} from '../../api/common-contracts'
import type {TrackedByItem} from '../../api/issues-graph/contracts'
import {displayNameWithOwner} from '../../helpers/tracked-by-formatter'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useSidePanelFromTrackedByItem} from '../../hooks/use-side-panel-from-tracked-by-item'
import {TrackedByResources} from '../../strings'
import {ItemState} from '../item-state'

interface TrackedByTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text' | 'ref'> {
  trackedBy: TrackedByItem
  issueId?: number
  /** Used to determine how to format the repo name - if project & repo owner are the same, we can hide the owner. */
  projectOwner?: Owner
  noPrefix?: boolean
}

// This appears to be where the problem described in item-state.tsx is occurring
// Again this should be delimited on ItemType but I need to figure out how to do so
export const TrackedByToken = forwardRef<HTMLElement, TrackedByTokenProps>(
  ({trackedBy, issueId, noPrefix = false, projectOwner, as = 'a', ...tokenProps}, ref) => {
    const {createSidePanelHandler} = useSidePanelFromTrackedByItem()
    const isPullRequest = trackedBy.url.includes('/pull/')
    const {tasklist_tracked_by_redesign} = useEnabledFeatures()

    if (tasklist_tracked_by_redesign) noPrefix = true

    const linkProps = {
      as: 'a',
      ['data-hovercard-type']: isPullRequest ? 'pull_request' : tasklist_tracked_by_redesign ? 'tracking' : 'issue',
      ['data-hovercard-url']: tasklist_tracked_by_redesign
        ? `${trackedBy.url}/tracking/${issueId}/hovercard`
        : `${trackedBy.url}/hovercard`,
      href: trackedBy.url,
      onClick: createSidePanelHandler(trackedBy),
      rel: 'noreferrer',
      target: '_blank',
    } as const

    // if the consumer overrides `as` (ie to make this a button for filtering in board view) we only linkify the repo#number part
    const linkEntireToken = as === 'a'

    const iconAndName = (
      <>
        {!noPrefix && TrackedByResources.trackedBy}{' '}
        <ItemState
          state={trackedBy.state}
          stateReason={trackedBy.stateReason}
          type={isPullRequest ? 'PullRequest' : 'Issue'}
          isDraft={false}
          sx={{mr: 1, height: '14px', width: '14px'}}
        />
        {/* Explanation for min-width: https://css-tricks.com/flexbox-truncated-text/#aa-the-solution-is-min-width-0-on-the-flex-child */}
        {tasklist_tracked_by_redesign ? (
          <>
            <Text sx={{color: 'fg.default', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {trackedBy.title}
            </Text>
            <Text sx={{fontWeight: 'normal', whiteSpace: 'pre'}}>
              {' #'}
              {trackedBy.number}
            </Text>
          </>
        ) : (
          <Text sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {displayNameWithOwner(trackedBy, projectOwner)}
          </Text>
        )}
      </>
    )

    const wrapperStyles = tasklist_tracked_by_redesign ? {display: 'flex', maxWidth: '285px'} : {}

    const text = linkEntireToken ? (
      tasklist_tracked_by_redesign ? (
        <Box sx={wrapperStyles}>{iconAndName}</Box>
      ) : (
        iconAndName
      )
    ) : (
      <Link {...linkProps} sx={{color: 'inherit', ...wrapperStyles}}>
        {iconAndName}
      </Link>
    )

    return <Token ref={ref} text={text} {...(linkEntireToken ? linkProps : {})} {...tokenProps} />
  },
)
TrackedByToken.displayName = 'TrackedByToken'
