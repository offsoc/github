import {MergeStatusButtonWithSuspense} from '@github-ui/mergebox'
import {Box, Button} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {HeaderRightSideContent_pullRequest$key} from './__generated__/HeaderRightSideContent_pullRequest.graphql'
import type {HeaderRightSideContent_user$key} from './__generated__/HeaderRightSideContent_user.graphql'
import {ApplySuggestionsButton} from './ApplySuggestionsButton'
import ReviewMenu from './ReviewMenu'

type HeaderRightSideContentProps = {
  hideSummaryInfo: boolean
  onUpdateReviewBody: (body: string) => void
  onUpdateReviewEvent: (body: string) => void
  pullRequest: HeaderRightSideContent_pullRequest$key
  reviewBody: string
  reviewEvent: string
  user: HeaderRightSideContent_user$key
  editTitleButtonRef: React.RefObject<HTMLButtonElement>
  onEdit: () => void
  viewOnly: boolean
  isSticky: boolean
}

export function HeaderRightSideContent({
  hideSummaryInfo,
  pullRequest,
  user,
  editTitleButtonRef,
  onEdit,
  viewOnly,
  isSticky,
  ...rest
}: HeaderRightSideContentProps) {
  const data = useFragment(
    graphql`
      fragment HeaderRightSideContent_pullRequest on PullRequest {
        id
        state
        ...ReviewMenu_pullRequest
      }
    `,
    pullRequest,
  )

  const viewerData = useFragment(
    graphql`
      fragment HeaderRightSideContent_user on User {
        ...ReviewMenu_user
      }
    `,
    user,
  )

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: ['flex-end', 'flex-end', 'flex-end', 'flex-start'],
        gap: 2,
      }}
    >
      {!viewOnly && !isSticky && (
        <Button ref={editTitleButtonRef} sx={{ml: 1}} onClick={onEdit}>
          Edit
        </Button>
      )}
      {!hideSummaryInfo && data.state === 'OPEN' && (
        <>
          <MergeStatusButtonWithSuspense pullRequestId={data.id} />
          <ApplySuggestionsButton />
        </>
      )}
      <ReviewMenu pullRequest={data} redirectOnSubmit={true} user={viewerData} {...rest} />
    </Box>
  )
}
