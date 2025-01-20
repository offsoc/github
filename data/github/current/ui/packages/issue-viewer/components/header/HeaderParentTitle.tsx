import {Box, Link, Token} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {issueHovercardPath} from '@github-ui/paths'
import type {HeaderParentTitle$key} from './__generated__/HeaderParentTitle.graphql'

import {getIcon} from '../sections/relations-section/ParentIssue'
import type {OptionConfig} from '../OptionConfig'
import type {SubIssueSidePanelItem} from '@github-ui/sub-issues/sub-issue-types'
import type React from 'react'

type HeaderParentTitleProps = {
  parentKey?: HeaderParentTitle$key
  small?: boolean
} & SharedProps

type SharedProps = {
  optionConfig?: OptionConfig
}

/** The internal component that renders the parent title itself after all data fetching has occurred */
export const HeaderParentTitle = ({parentKey, optionConfig, small = false}: HeaderParentTitleProps) => {
  const data = useFragment(
    graphql`
      fragment HeaderParentTitle on Issue {
        parent {
          id
          number
          repository {
            name
            owner {
              login
            }
          }
          state
          stateReason
          title
          url
        }
      }
    `,
    parentKey,
  )

  if (!data) {
    return null
  }
  const {parent} = data

  // The data from this fragment is not _all_ available yet, as it's requested in the secondary query, however,
  // AddSubIssueButtonGroup requests parent.id which is available in the primary query. useFragment, seemingly
  // merges this partial data and we are left with a parent object that is not empty, but also not fully populated.
  // See: https://github.com/github/github/issues/333236
  if (!parent?.repository) {
    return null
  }

  const repo = parent.repository.name
  const owner = parent.repository.owner.login

  const stateIcon = getIcon(parent.state, parent.stateReason, {width: 14, height: 14, marginRight: 1})
  if (!stateIcon) return null

  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    // If in the side panel and the parent issue is the same as the current issue, just close the side panel
    if (optionConfig?.onParentIssueActivate) {
      const itemIdentifier = {number: parent.number, repo, owner, type: 'Issue'} as const
      const closedSidePanel = optionConfig.onParentIssueActivate(e, itemIdentifier)
      if (closedSidePanel) return
    }

    // Else if in the side panel and the parent issue is different than the current issue,
    // open the parent issue in the side panel
    if (optionConfig?.insideSidePanel && optionConfig?.onSubIssueClick) {
      const {id, number, state, title, url} = parent
      const subIssueItem: SubIssueSidePanelItem = {
        id: parseInt(id, 10),
        number,
        owner,
        repo,
        state,
        title,
        url,
      }
      e.preventDefault()
      optionConfig.onSubIssueClick(subIssueItem)
    }
    // If not in the side panel, navigate to the parent issue
  }

  const handleClick = (e: React.MouseEvent) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    handleOpen(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key !== 'Enter' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    handleOpen(e)
  }

  const tokenContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: 500,
      }}
    >
      {stateIcon}
      Parent:{' '}
      <Link
        aria-label={`Parent issue: ${parent.title}`}
        inline
        muted
        hoverColor="fg.muted"
        href={parent.url}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-hovercard-url={issueHovercardPath({
          owner,
          repo,
          issueNumber: parent.number,
        })}
        sx={{
          '&:not(:hover)': {textDecoration: 'none !important'},
          marginLeft: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {small ? `#${parent.number}` : parent.title}
      </Link>
    </Box>
  )

  if (small) return tokenContent

  return (
    <>
      <Box sx={{width: 1, height: 18, borderRight: '1px solid', borderColor: 'border.default'}} />
      <div>
        <Token
          text={tokenContent}
          size={'xlarge'}
          sx={{
            px: 'var(--control-small-paddingInline-normal)',
            backgroundColor: 'canvas.default',
            fontWeight: '400',
            fontSize: 0,
            gap: 1,
          }}
        />
      </div>
    </>
  )
}
