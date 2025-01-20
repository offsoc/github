import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  type Icon,
  type IconProps as IconPropsDefinition,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from '@primer/octicons-react'
import {Octicon, type SxProp} from '@primer/react'

import type {IssueTitleWithContentType, PullRequestTitleWithContentType} from '../api/columns/contracts/storage'
import {IssueState, type IssueStateReason, PullRequestState} from '../api/common-contracts'
import {ItemType} from '../api/memex-items/item-type'
import {assertNever} from '../helpers/assert-never'

interface IconProps {
  'aria-label': string
  icon: Icon
  color: string
}

const issueStateProps: {
  [key in IssueState]: IconProps
} = {
  open: {
    'aria-label': 'Open issue',
    icon: IssueOpenedIcon,
    color: 'open.fg',
  },
  closed: {
    'aria-label': 'Closed as completed issue',
    icon: IssueClosedIcon,
    color: 'done.fg',
  },
}

const issueStateReasonProps: {
  [key in IssueStateReason]: IconProps
} = {
  not_planned: {
    'aria-label': 'Closed as not planned issue',
    icon: SkipIcon,
    color: 'fg.muted',
  },
  completed: issueStateProps.closed,
  reopened: issueStateProps.open,
}

const pullRequestStateProps: {
  [key in PullRequestState | 'draft']: IconProps
} = {
  open: {
    'aria-label': 'Open pull request',
    icon: GitPullRequestIcon,
    color: 'open.fg',
  },
  closed: {
    'aria-label': 'Closed pull request',
    icon: GitPullRequestClosedIcon,
    color: 'closed.fg',
  },
  merged: {
    'aria-label': 'Merged pull request',
    icon: GitMergeIcon,
    color: 'done.fg',
  },
  draft: {
    'aria-label': 'Draft pull request',
    icon: GitPullRequestDraftIcon,
    color: 'fg.muted',
  },
}

interface ItemStateProps extends IconPropsDefinition {
  type: ItemType
  state: IssueState | PullRequestState
  stateReason?: IssueStateReason
  isDraft: boolean
}

// ADDING || state === PullRequestState.Merged is hacky but it prevents errors when loading
// memex project boards. Need to figure out how to accurately get ItemType from the API.
// And use it as a delimiter. For now, this works.
export const getStateProps = ({type, state, stateReason, isDraft}: ItemStateProps) => {
  if (type === ItemType.PullRequest || state === PullRequestState.Merged) {
    const icon = state === PullRequestState.Open && isDraft ? 'draft' : state
    return pullRequestStateProps[icon]
  } else if (state === IssueState.Closed && stateReason) {
    return issueStateReasonProps[stateReason]
  } else {
    return issueStateProps[state as IssueState]
  }
}

export const ItemState: React.FC<ItemStateProps & SxProp> = ({type, state, stateReason, isDraft, sx, ...rest}) => {
  const {icon, color, ...props} = getStateProps({type, state, stateReason, isDraft})
  return <Octicon icon={icon} {...props} {...rest} sx={{color, ...sx}} />
}

type ItemStateForTitleProps = IconPropsDefinition &
  SxProp & {
    title: IssueTitleWithContentType | PullRequestTitleWithContentType
  }

/**
 * Component for converting issue or pull request title into the related item
 * state icon.
 */
export const ItemStateForTitle: React.FC<ItemStateForTitleProps> = ({title, ...rest}) => {
  switch (title.contentType) {
    case ItemType.Issue: {
      const stateReason = title.value.stateReason

      return (
        <ItemState
          type={title.contentType}
          state={title.value.state}
          stateReason={stateReason}
          isDraft={false}
          {...rest}
        />
      )
    }
    case ItemType.PullRequest: {
      const isDraft = title.value.isDraft

      return <ItemState type={title.contentType} state={title.value.state} isDraft={isDraft} {...rest} />
    }
    default: {
      assertNever(title)
    }
  }
}
