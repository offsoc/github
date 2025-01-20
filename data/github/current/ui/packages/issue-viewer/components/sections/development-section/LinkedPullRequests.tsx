import {ActionList} from '@primer/react'
import {PullRequestStateIcons} from '@github-ui/timeline-items/Icons'
import {getPrIconColor, getPrState} from '@github-ui/item-picker/PullRequestPicker'
import type {PullRequestPickerPullRequest$data} from '@github-ui/item-picker/PullRequestPickerPullRequest.graphql'

type LinkedPullRequestsProps = {
  linkedPullRequests: PullRequestPickerPullRequest$data[]
}

export function LinkedPullRequests({linkedPullRequests}: LinkedPullRequestsProps) {
  return (
    <>
      {linkedPullRequests.map(pullRequest => {
        return (
          <ActionList.LinkItem
            href={pullRequest.url}
            target="_blank"
            key={pullRequest.id}
            sx={{
              span: {
                fontSize: 0,
                lineHeight: 1.5,
                marginBlockEnd: '0',
              },
            }}
          >
            <ActionList.LeadingVisual
              sx={{
                color: getPrIconColor(pullRequest),
              }}
            >
              {getPrIcon(pullRequest)}
            </ActionList.LeadingVisual>
            {pullRequest.title}
            <ActionList.Description variant="block">{pullRequest.repository.nameWithOwner}</ActionList.Description>
          </ActionList.LinkItem>
        )
      })}
    </>
  )
}

function getPrIcon(pullRequest: PullRequestPickerPullRequest$data) {
  const item = PullRequestStateIcons[getPrState(pullRequest.isDraft, pullRequest.isInMergeQueue, pullRequest.state)]
  return <item.icon />
}
