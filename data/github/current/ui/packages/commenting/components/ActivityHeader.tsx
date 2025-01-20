import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'
import {DotFillIcon} from '@primer/octicons-react'
import {Box, Link, RelativeTime, type SxProp, Text} from '@primer/react'

import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'
import {CommentAuthorAssociation} from './CommentAuthorAssociation'
import {CommentHeaderBadge} from './CommentHeaderBadge'
import {CommentSubjectAuthor} from './CommentSubjectAuthor'
import type {CommentAuthorAssociation as GraphQlCommentAuthorAssociation} from './issue-comment/__generated__/IssueCommentHeader.graphql'
import {SponsorsBadge} from './SponsorsBadge'

function DefaultAvatar({avatarUrl, login, isHidden}: {avatarUrl: string; login: string; isHidden: boolean}) {
  return (
    <>
      <GitHubAvatar
        data-hovercard-url={userHovercardPath({owner: login})}
        src={avatarUrl}
        size={24}
        alt={`@${login}`}
        sx={{
          flexShrink: 0,
          opacity: isHidden ? '0.5' : '1',
          display: ['none', 'block', 'block', 'block'],
        }}
      />
      <GitHubAvatar
        data-hovercard-url={userHovercardPath({owner: login})}
        src={avatarUrl}
        size={32}
        alt={`@${login}`}
        sx={{
          flexShrink: 0,
          opacity: isHidden ? '0.5' : '1',
          display: ['block', 'none', 'none', 'none'],
        }}
      />
    </>
  )
}

type ActivityData = {
  authorAssociation: GraphQlCommentAuthorAssociation
  id: string
  createdAt: string
  isHidden: boolean
  minimizedReason: string | null | undefined
  pendingMinimizeReason?: string | null
  repository: {
    id: string
    isPrivate: boolean
    name: string
    owner: {
      login: string
      url: string
    }
  }
  url: string
  createdViaEmail?: boolean
  authorToRepoOwnerSponsorship?: {
    createdAt: string
    isActive: boolean
  } | null
  state?: string
}

type ActivityHeaderProps = {
  actions?: JSX.Element
  additionalHeaderMessage?: JSX.Element
  avatarUrl: string
  comment: ActivityData
  commentSubjectAuthorLogin?: string
  commentSubjectType?: string
  commentRef?: React.RefObject<HTMLDivElement>
  isMinimized: boolean
  commentAuthorLogin: string
  userAvatar?: JSX.Element
  viewerDidAuthor?: boolean
  isReply?: boolean
  commentAuthorType?: string
  headingProps?: {
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
  id?: string
} & SxProp

/**
 * Abstraction of a comment header that can be used in different contexts.
 */
export function ActivityHeader({
  actions,
  comment,
  commentAuthorLogin,
  isMinimized = false,
  avatarUrl,
  additionalHeaderMessage,
  sx,
  viewerDidAuthor = false,
  userAvatar = (
    <DefaultAvatar
      avatarUrl={avatarUrl}
      login={commentAuthorLogin}
      isHidden={!!comment.pendingMinimizeReason || comment.isHidden}
    />
  ),
  commentSubjectAuthorLogin,
  commentSubjectType,
  isReply = false,
  headingProps: {as: HeadingElement, ...headingProps} = {
    as: 'h3',
  },
  commentAuthorType,
  id,
}: ActivityHeaderProps) {
  const containerStyles = isReply
    ? {}
    : {
        backgroundColor: viewerDidAuthor ? 'accent.subtle' : 'canvas.subtle',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        borderBottom: '1px solid',
        borderColor: viewerDidAuthor ? 'accent.muted' : 'border.default',
        py: 2,
        pr: 2,
        pl: 3,
        ...sx,
      }

  const commentMinimizedReason = comment.pendingMinimizeReason ?? comment.minimizedReason
  const commentHidden = !!commentMinimizedReason || comment.isHidden
  const createdAt = new Date(comment.createdAt)

  return (
    <Box
      id={id}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...containerStyles,
      }}
      data-testid={TEST_IDS.commentHeader}
    >
      <Box
        sx={{
          minHeight: 'var(--control-small-size, 28px)',
          display: 'flex',
          justifyContent: 'space-between',
          flexGrow: 1,
        }}
      >
        <HeadingElement {...headingProps} className="sr-only">
          {commentAuthorLogin} commented{' '}
          <RelativeTime date={createdAt}>
            on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}{' '}
          </RelativeTime>
        </HeadingElement>
        <Box
          data-testid={TEST_IDS.commentHeaderLeftSideItems}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{alignSelf: 'flex-start'}}>
            {userAvatar ?? (
              <>
                <GitHubAvatar
                  data-hovercard-url={userHovercardPath({owner: commentAuthorLogin})}
                  src={avatarUrl}
                  size={24}
                  alt={`@${commentAuthorLogin}`}
                  sx={{
                    flexShrink: 0,
                    opacity: commentHidden ? '0.5' : '1',
                    display: ['none', 'block', 'block', 'block'],
                  }}
                />
                <GitHubAvatar
                  data-hovercard-url={userHovercardPath({owner: commentAuthorLogin})}
                  src={avatarUrl}
                  size={32}
                  alt={`@${commentAuthorLogin}`}
                  sx={{
                    flexShrink: 0,
                    opacity: commentHidden ? '0.5' : '1',
                    display: ['block', 'none', 'none', 'none'],
                  }}
                />
              </>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              columnGap: 1,
              flexWrap: 'wrap',
              ...sx,
            }}
          >
            <Link
              data-testid={TEST_IDS.avatarLink}
              href={`/${commentAuthorType === 'Bot' ? 'apps/' : ''}${commentAuthorLogin}`}
              data-hovercard-url={userHovercardPath({owner: commentAuthorLogin})}
              sx={{
                fontSize: '14px',
                color: commentHidden ? 'fg.muted' : 'fg.default',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {commentAuthorLogin}
            </Link>
            {additionalHeaderMessage && (
              <Text sx={{color: 'fg.muted', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {additionalHeaderMessage}
              </Text>
            )}
            <Text sx={{fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              <Link href={comment.url} sx={{color: 'fg.muted'}}>
                <RelativeTime date={createdAt}>
                  on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              </Link>
            </Text>
          </Box>
        </Box>

        <Box data-testid={TEST_IDS.commentHeaderRightSideItems} sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          {comment.createdViaEmail && (
            <Text
              sx={{
                color: 'fg.muted',
                fontSize: '12px',
              }}
            >
              {LABELS.sentViaEmail}
            </Text>
          )}
          {commentHidden && (
            <Box sx={{display: 'flex', gap: 2, alignItems: 'center', color: 'fg.muted'}}>
              <Text sx={{fontSize: 0}}>
                {commentMinimizedReason
                  ? `${LABELS.hiddenCommentWithReason} ${commentMinimizedReason.replace(/_/g, '-').toLowerCase()}`
                  : LABELS.hiddenComment}
              </Text>
            </Box>
          )}

          {comment.state === 'PENDING' && (
            <CommentHeaderBadge
              leadingElement={<DotFillIcon />}
              label="Pending"
              ariaLabel="This review comment is pending"
              testId="pending-badge"
              variant="attention"
              sx={{mr: 1}}
            />
          )}

          {!commentHidden &&
            !isMinimized &&
            comment.authorToRepoOwnerSponsorship &&
            comment.authorToRepoOwnerSponsorship.isActive && (
              <SponsorsBadge
                createdAt={comment.authorToRepoOwnerSponsorship.createdAt}
                owner={comment.repository.owner.login}
                viewerDidAuthor={viewerDidAuthor}
              />
            )}

          {!comment.repository.isPrivate && !commentHidden && !isMinimized && (
            <CommentAuthorAssociation
              association={comment.authorAssociation}
              viewerDidAuthor={viewerDidAuthor}
              org={comment.repository.owner.login}
              repo={comment.repository.name}
            />
          )}
          {commentAuthorLogin === commentSubjectAuthorLogin && (
            <CommentSubjectAuthor viewerDidAuthor={viewerDidAuthor} subjectType={commentSubjectType} />
          )}
          {actions}
        </Box>
      </Box>
    </Box>
  )
}
