import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {CommentBoxButton} from '@github-ui/comment-box/CommentBoxButton'
import {ActivityHeader} from '@github-ui/commenting/ActivityHeader'
import {CommentHeader} from '@github-ui/commenting/CommentHeader'
import {ConversationCommentBox} from '@github-ui/conversations'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {noop} from '@github-ui/noop'
import {teamHovercardPath} from '@github-ui/paths'
import {ReactionViewer} from '@github-ui/reaction-viewer/ReactionViewer'
import {REVIEW_STATES} from '@github-ui/reviewer-avatar'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {StatusIcon} from '@github-ui/status-avatar/StatusIcon'
import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CheckIcon} from '@primer/octicons-react'
import {Box, Link} from '@primer/react'
import {type RefObject, useCallback, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import usePullRequestPageAppPayload from '../../../../hooks/use-pull-request-page-app-payload'
import updatePullRequestReview from '../../../../mutations/update-pull-request-review-mutation'
import type {
  PullRequestReviewHeaderAndComment_pullRequestReview$key,
  PullRequestReviewState,
} from './__generated__/PullRequestReviewHeaderAndComment_pullRequestReview.graphql'

function reviewDecisionMessage(
  state: PullRequestReviewState,
  dismissedReviewState: PullRequestReviewState | null | undefined,
): JSX.Element | undefined {
  switch (state) {
    case 'APPROVED':
      return <span> approved these changes </span>
    case 'CHANGES_REQUESTED':
      return <span> requested changes </span>
    case 'COMMENTED':
      return <span> reviewed changes </span>
    case 'DISMISSED':
      if (dismissedReviewState === 'APPROVED') return <span> previously approved these changes </span>
      else {
        return <span> previously requested changes </span>
      }
    default:
      return
  }
}

export type OnBehalfOf = {
  organization: {
    name: string | null | undefined
  }
  name: string
  url: string
}
const onBehalfOfText = (onBehalfOf: OnBehalfOf[]) => {
  switch (onBehalfOf.length) {
    case 0:
      return
    case 1:
      return (
        <span>
          on behalf of{' '}
          <Link
            inline
            href={onBehalfOf[0]?.url}
            sx={{color: 'fg.default'}}
            data-hovercard-url={teamHovercardPath({
              owner: onBehalfOf[0]?.organization.name ?? '',
              team: onBehalfOf[0]?.name ?? '',
            })}
          >
            {onBehalfOf[0]?.organization.name?.toLowerCase()}/{onBehalfOf[0]?.name}
          </Link>
        </span>
      )
    case 2:
      return (
        <span>
          on behalf of{' '}
          <Link
            inline
            href={onBehalfOf[0]?.url}
            sx={{color: 'fg.default'}}
            data-hovercard-url={teamHovercardPath({
              owner: onBehalfOf[0]?.organization.name ?? '',
              team: onBehalfOf[0]?.name ?? '',
            })}
          >
            {onBehalfOf[0]?.organization.name?.toLowerCase()}/{onBehalfOf[0]?.name}{' '}
          </Link>
          and{' '}
          <Link
            inline
            href={onBehalfOf[1]?.url}
            sx={{color: 'fg.default'}}
            data-hovercard-url={teamHovercardPath({
              owner: onBehalfOf[1]?.organization.name ?? '',
              team: onBehalfOf[1]?.name ?? '',
            })}
          >
            {onBehalfOf[0]?.organization.name?.toLowerCase()}/{onBehalfOf[1]?.name}
          </Link>
        </span>
      )
    default: {
      const displayedTeams = onBehalfOf.slice(0, 5)
      const otherTeamsCount = onBehalfOf.length - 5

      return (
        <>
          <span> on behalf of </span>
          {displayedTeams.map((team, index) => (
            <span key={index}>
              {index === displayedTeams.length - 1 && otherTeamsCount <= 0 ? 'and ' : ''}
              <Link
                href={team.url}
                sx={{color: 'fg.default'}}
                data-hovercard-url={teamHovercardPath({
                  owner: team?.organization.name ?? '',
                  team: team?.name ?? '',
                })}
              >
                {team.organization.name?.toLowerCase()}/{team.name}
              </Link>
              {index !== displayedTeams.length - 1 || otherTeamsCount > 0 ? ', ' : ' '}
            </span>
          ))}
          {otherTeamsCount > 0 && <span>and {otherTeamsCount} other teams </span>}
        </>
      )
    }
  }
}

type PullRequestReviewHeaderAndCommentProps = {
  anchorBaseUrl?: string
  review: PullRequestReviewHeaderAndComment_pullRequestReview$key
  // reactionGroups: ReactionViewerGroups$key
  onLinkClick?: (event: MouseEvent) => void
  onChange?: () => void
  onEditCancel?: () => void
  onReply?: (quotedComment: string) => void
  onSave?: () => void
  isMajor?: boolean
  commentBoxConfig?: CommentBoxConfig
  refAttribute?: RefObject<HTMLDivElement>
  navigate: (url: string) => void
}

export function PullRequestReviewHeaderAndComment({
  anchorBaseUrl,
  review,
  isMajor,
  commentBoxConfig,
  onChange = noop,
  onSave = noop,
  onEditCancel = noop,
}: PullRequestReviewHeaderAndCommentProps) {
  const data = useFragment(
    graphql`
      fragment PullRequestReviewHeaderAndComment_pullRequestReview on PullRequestReview {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...MarkdownEditHistoryViewer_comment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...ReactionViewerGroups
        id
        databaseId
        author {
          id
          avatarUrl(size: 64)
          login
          ...TimelineRowEventActor
        }
        authorAssociation
        bodyHTML
        bodyText
        createdAt
        pullRequest {
          number
          author {
            login
          }
        }
        onBehalfOf(first: 10) {
          edges {
            node {
              organization {
                name
              }
              name
              url
            }
          }
        }
        repository {
          id
          isPrivate
          name
          owner {
            id
            login
            url
          }
        }
        dismissedReviewState
        state
        url
        # eslint-disable-next-line relay/unused-fields
        viewerCanDelete
        viewerCanUpdate
        viewerCanReport
        viewerCanReportToMaintainer
        viewerCanBlockFromOrg
        viewerCanUnblockFromOrg
      }
    `,
    review,
  )
  const {ghostUser} = usePullRequestPageAppPayload()
  const environment = useRelayEnvironment()
  const onBehalfOfTeams = data.onBehalfOf.edges?.flatMap(n => n?.node || []) || []
  const onBehalfOfMessage = onBehalfOfText(onBehalfOfTeams)
  const decisionMessage = reviewDecisionMessage(data.state, data.dismissedReviewState)
  const authorLogin = data.author?.login ?? ghostUser.login
  const authorAvatarUrl = data.author?.avatarUrl ?? ghostUser.avatarUrl
  const hasBody = !!data.bodyText
  const url = anchorBaseUrl ? `${anchorBaseUrl}#pullrequestreview-${data.databaseId}` : data.url
  const pullRequestAuthorLogin = data.pullRequest?.author?.login ?? ''
  const currentReviewState = REVIEW_STATES[data.state as keyof typeof REVIEW_STATES]
  const bodyHTML = data.bodyHTML as SafeHTMLString
  const additionalHeaderMessage = (
    <>
      {decisionMessage}
      {onBehalfOfMessage}
    </>
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bodyText, setBodyText] = useState(data.bodyText)

  const {addToast} = useToastContext()
  const editReview = useCallback(
    ({
      pullRequestReviewId,
      onCompleted,
      onError,
      text,
    }: {
      pullRequestReviewId: string
      onCompleted?: () => void
      onError?: (error: Error) => void
      text: string
    }) => {
      updatePullRequestReview({
        environment,
        input: {body: text, pullRequestReviewId},
        onCompleted,
        onError,
      })
    },
    [environment],
  )

  const onEdit = () => {
    setIsEditing(true)
  }

  const onCancel = () => {
    setIsEditing(false)
    setBodyText(bodyText)
    onEditCancel()
  }

  const onChangeReview = (newBody: string) => {
    setBodyText(newBody)
    onChange()
  }

  const onSaveReview = useCallback(() => {
    setIsSubmitting(true)
    editReview({
      text: bodyText,
      pullRequestReviewId: data.id,
      onCompleted: () => {
        setIsEditing(false)
        setIsSubmitting(false)
      },
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to update review',
        })
      },
    })
    onSave()
  }, [editReview, bodyText, data.id, onSave, addToast])

  if (hasBody) {
    return (
      <div>
        <CommentHeader
          additionalHeaderMessage={additionalHeaderMessage}
          avatarUrl={authorAvatarUrl}
          commentAuthorLogin={authorLogin}
          commentSubjectAuthorLogin={pullRequestAuthorLogin}
          deleteComment={noop}
          editComment={onEdit}
          hideComment={noop}
          isMinimized={false}
          navigate={noop}
          unhideComment={noop}
          comment={{
            ...data,
            authorAssociation: data.authorAssociation,
            body: bodyText,
            id: data.id,
            createdAt: data.createdAt,
            isHidden: false,
            referenceText: `#${data.pullRequest.number}`,
            minimizedReason: '',
            repository: {
              id: data.repository.id,
              isPrivate: data.repository.isPrivate,
              name: data.repository.name,
              owner: {
                id: data.repository.owner.id,
                login: data.repository.owner.login,
                url: data.repository.owner.url,
              },
            },
            url,
            viewerCanDelete: false,
            viewerCanMinimize: false,
            viewerCanReport: data.viewerCanReport,
            viewerCanReportToMaintainer: data.viewerCanReportToMaintainer,
            viewerCanSeeMinimizeButton: false,
            viewerCanSeeUnminimizeButton: false,
            viewerCanUpdate: data.viewerCanUpdate,
            viewerCanBlockFromOrg: data.viewerCanBlockFromOrg,
            viewerCanUnblockFromOrg: data.viewerCanUnblockFromOrg,
          }}
          userAvatar={
            <Box sx={{display: 'flex', gap: 2}}>
              {['APPROVED', 'CHANGES_REQUESTED'].includes(data.state) ? (
                <StatusIcon
                  absolute={false}
                  icon={currentReviewState.icon}
                  iconColor={currentReviewState.color}
                  size={24}
                />
              ) : null}
              <GitHubAvatar alt={`${authorLogin}'s avatar`} size={24} src={authorAvatarUrl} />
            </Box>
          }
          onMinimize={noop}
          onReplySelect={noop}
        />
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, px: isEditing ? 2 : 3, py: 3}}>
          {isEditing ? (
            <ConversationCommentBox
              label="Update review"
              userSettings={commentBoxConfig}
              value={bodyText}
              onChange={onChangeReview}
              onPrimaryAction={onSaveReview}
            >
              <CommentBoxButton variant="default" onClick={onCancel}>
                Cancel
              </CommentBoxButton>
              <CommentBoxButton disabled={isSubmitting || !bodyText.length} variant="primary" onClick={onSaveReview}>
                Update
              </CommentBoxButton>
            </ConversationCommentBox>
          ) : (
            <MarkdownViewer verifiedHTML={bodyHTML} />
          )}
          <Box sx={{display: 'flex', flexDirection: 'column', mt: 3}}>
            <ReactionViewer reactionGroups={data} subjectId={data.id} />
          </Box>
        </Box>
      </div>
    )
  } else if (isMajor) {
    return (
      <ActivityHeader
        additionalHeaderMessage={additionalHeaderMessage}
        avatarUrl={authorAvatarUrl}
        commentAuthorLogin={authorLogin}
        commentSubjectAuthorLogin={pullRequestAuthorLogin}
        isMinimized={false}
        sx={{whiteSpace: 'normal'}}
        comment={{
          authorAssociation: data.authorAssociation,
          id: data.id,
          createdAt: data.createdAt,
          isHidden: false,
          state: data.state,
          minimizedReason: '',
          repository: {
            id: data.repository.id,
            isPrivate: data.repository.isPrivate,
            name: data.repository.name,
            owner: {
              login: data.repository.owner.login,
              url: data.repository.owner.url,
            },
          },
          url,
        }}
        userAvatar={
          <Box sx={{display: 'flex', gap: 2}}>
            {['APPROVED', 'CHANGES_REQUESTED'].includes(data.state) ? (
              <StatusIcon
                absolute={false}
                icon={currentReviewState.icon}
                iconColor={currentReviewState.color}
                size={24}
              />
            ) : null}
            <GitHubAvatar alt={`${authorLogin}'s avatar`} size={24} src={authorAvatarUrl} />
          </Box>
        }
      />
    )
  } else {
    return (
      <TimelineRow
        actor={data.author}
        createdAt={data.createdAt}
        deepLinkUrl={url}
        highlighted={false}
        iconColoring={{color: currentReviewState.background, backgroundColor: currentReviewState.color}}
        leadingIcon={data.state === 'APPROVED' ? CheckIcon : currentReviewState.icon} // need to override icon for the compact review state
      >
        <TimelineRow.Main>
          <Box sx={{mr: 1, display: 'inline-block'}}>
            {decisionMessage} {onBehalfOfText(onBehalfOfTeams)}
          </Box>
        </TimelineRow.Main>
      </TimelineRow>
    )
  }
}
