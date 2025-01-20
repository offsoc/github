import {graphql, useFragment} from 'react-relay'
import type {LinkedPullRequest$data, LinkedPullRequest$key} from './__generated__/LinkedPullRequest.graphql'
import {ActionList, Box, Link, Octicon} from '@primer/react'
import {issueLinkedPullRequestHovercardPath} from '@github-ui/paths'
import {PullRequestStateIcons} from '@github-ui/timeline-items/Icons'
import {Tooltip} from '@primer/react/next'
import type {FC} from 'react'

const LinkedPullRequestPull = graphql`
  fragment LinkedPullRequest on PullRequest {
    url
    number
    state
    isDraft
    repository {
      name
      nameWithOwner
      owner {
        login
      }
    }
  }
`

type LinkedPullRequestType = {
  pullKey: LinkedPullRequest$key
  issueRepositoryName: string
  itemKey?: string
  omitIcon?: boolean
  omitHover?: boolean
}

export const LinkedPullRequestLinkItem: FC<LinkedPullRequestType> = props => {
  const {pullKey, issueRepositoryName, omitIcon, omitHover} = props
  const pull = useFragment(LinkedPullRequestPull, pullKey)
  const owner = pull.repository?.owner?.login
  const repoName = pull.repository?.name

  const isExternal = pull.repository.nameWithOwner.toLocaleLowerCase() !== issueRepositoryName.toLocaleLowerCase()

  const tooltipTitle = `${owner}/${repoName}#${pull.number}`
  const hoverCard = issueLinkedPullRequestHovercardPath({
    owner: pull.repository.owner.login,
    repo: pull.repository.name,
    pullRequestNumber: pull.number,
  })
  const linkElement = (
    <Link
      sx={{
        alignItems: 'center',
        color: 'fg.muted',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        fontSize: 0,
        fontWeight: 'normal',
        gap: 1,
        overflow: isExternal ? 'hidden' : 'visible',
        textDecoration: 'none',
        textOverflow: 'ellipsis',
      }}
      href={pull.url}
      data-hovercard-url={!omitHover ? hoverCard : undefined}
      target="_blank"
      role="link"
    >
      {!omitIcon && <LinkedPRIcon {...props} />}
      <LinkedPRName {...props} />
    </Link>
  )

  // Not showing a tooltip for PRs in the same repo, as they can't be truncated so we know all of the information is already visible
  return !omitHover && isExternal ? <Tooltip text={tooltipTitle}>{linkElement}</Tooltip> : linkElement
}

export const LinkedPullRequestListItem: FC<LinkedPullRequestType> = props => {
  const {pullKey, itemKey, issueRepositoryName} = props
  const pull = useFragment(LinkedPullRequestPull, pullKey)

  // Always print full length PR name in ActionList
  const owner = pull.repository?.owner?.login
  const repoName = pull.repository?.name
  const isExternal = pull.repository.nameWithOwner.toLocaleLowerCase() !== issueRepositoryName.toLocaleLowerCase()
  const number = pull.number

  return (
    <ActionList.LinkItem href={pull.url} key={itemKey} target="_blank">
      <ActionList.LeadingVisual>
        <LinkedPRIcon {...props} />
      </ActionList.LeadingVisual>
      <Box
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-all',
        }}
      >
        {isExternal ? `${owner}/${repoName} #${number}` : `#${number}`}
      </Box>
    </ActionList.LinkItem>
  )
}

export const LinkedPRIcon: FC<Pick<LinkedPullRequestType, 'pullKey'>> = ({pullKey}) => {
  const pull = useFragment(LinkedPullRequestPull, pullKey)
  const {icon, color, label} = getPrIconColor(pull)

  return <Octicon icon={icon} sx={{color}} aria-label={label} />
}

export const LinkedPRName: FC<LinkedPullRequestType> = ({pullKey, issueRepositoryName}) => {
  const pull = useFragment(LinkedPullRequestPull, pullKey)
  const owner = pull.repository?.owner?.login
  const repoName = pull.repository?.name

  const isExternal = pull.repository.nameWithOwner.toLocaleLowerCase() !== issueRepositoryName.toLocaleLowerCase()

  // This not straight-forward logic is to make sure that we are always showing the pull number and only truncating
  // the org/repo prefix
  const title = isExternal ? (
    <Box sx={{display: 'flex', gap: '0'}}>
      <Box
        sx={{
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >{`${owner}/${repoName}`}</Box>
      <span>#{pull.number}</span>
    </Box>
  ) : (
    <span>{`#${pull.number}`}</span>
  )

  return <>{title}</>
}

const getPrIconColor = (pullRequest: LinkedPullRequest$data) => {
  // 'CLOSED' is filtered out of Linked PRs pill
  const state = pullRequest.state === 'MERGED' ? 'MERGED' : 'OPEN'
  const stateIcons =
    state === 'OPEN' && pullRequest.isDraft ? PullRequestStateIcons.DRAFT : PullRequestStateIcons[state]
  const {color, icon, label} = stateIcons
  return {color, icon, label}
}
