import {ReactionViewer} from '@github-ui/reaction-viewer/ReactionViewer'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {Box} from '@primer/react'
import type React from 'react'
import {Suspense, useCallback, useEffect, useRef, useState} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {useFragment, useRelayEnvironment} from 'react-relay/hooks'

import {CLASS_NAMES} from '../../constants/dom-elements'
import {TEST_IDS} from '../../constants/test-ids'
import {VALUES} from '../../constants/values'
import {getQuotedText} from '../../utils/quotes'
import {CommentLoading} from '../CommentLoading'
import type {IssueCommentViewerCommentRow$key} from './__generated__/IssueCommentViewerCommentRow.graphql'
import type {IssueCommentViewerGhostUserQuery as IssueCommentViewerGhostUserQueryType} from './__generated__/IssueCommentViewerGhostUserQuery.graphql'
import type {IssueCommentViewerMarkdownViewer$key} from './__generated__/IssueCommentViewerMarkdownViewer.graphql'
import type {IssueCommentViewerReactable$key} from './__generated__/IssueCommentViewerReactable.graphql'
import {IssueCommentHeader} from './IssueCommentHeader'
import {IssueMarkdownViewer} from './IssueMarkdownViewer'
import {commitUpdateIssueCommentBodyMutation} from './mutations/update-issue-comment-body-mutation'

type Props = {
  anchorBaseUrl?: string
  comment: IssueCommentViewerCommentRow$key
  reactable: IssueCommentViewerReactable$key
  setIsEditing: () => void
  onReply: (quotedComment: string) => void
  onLinkClick?: (event: MouseEvent) => void
  refAttribute?: React.RefObject<HTMLDivElement>
  highlightedCommentId?: string
  navigate: (url: string) => void
  relayConnectionIds?: string[]
  commentSubjectAuthorLogin?: string
}

type InternalProps = Props & {
  commentAuthorLogin: string
  avatarUrl: string
  commentAuthorType?: string
}

export const IssueCommentFragment = graphql`
  fragment IssueCommentViewerCommentRow on IssueComment {
    id
    databaseId
    ...IssueCommentViewerMarkdownViewer
    ...IssueCommentHeader
    author {
      avatarUrl
      login
      __typename
    }
    issue {
      id
      locked
    }
    body
    isHidden: isMinimized
    viewerCanUpdate
    pendingMinimizeReason
  }
`

const IssueCommentViewerMarkdownViewer = graphql`
  fragment IssueCommentViewerMarkdownViewer on IssueComment {
    id
    body
    bodyHTML(unfurlReferences: true)
    bodyVersion
    viewerCanUpdate
  }
`

export function IssueCommentViewer({comment, ...rest}: Props) {
  const data = useFragment(IssueCommentFragment, comment)
  const withAuthor = data.author != null
  return withAuthor ? (
    <IssueCommentViewerInternal
      comment={comment}
      {...rest}
      commentAuthorLogin={data.author.login}
      commentSubjectAuthorLogin={rest.commentSubjectAuthorLogin}
      avatarUrl={data.author.avatarUrl}
      commentAuthorType={data.author.__typename}
    />
  ) : (
    <Suspense fallback={<CommentLoading />}>
      <IssueCommentViewerInternalWithoutAuthor comment={comment} {...rest} />
    </Suspense>
  )
}

function IssueCommentViewerInternalWithoutAuthor(props: Props) {
  const data = useLazyLoadQuery<IssueCommentViewerGhostUserQueryType>(
    graphql`
      query IssueCommentViewerGhostUserQuery($ghostLogin: String!) {
        user(login: $ghostLogin) {
          login
          avatarUrl
          __typename
        }
      }
    `,
    {ghostLogin: VALUES.ghostUser.login},
    {fetchPolicy: 'store-or-network'},
  )
  if (data.user == null) {
    throw new Error('Ghost user not found')
  }
  return (
    <IssueCommentViewerInternal
      {...props}
      commentAuthorLogin={data.user.login}
      avatarUrl={data.user.avatarUrl}
      commentAuthorType={data.user.__typename}
    />
  )
}

function IssueCommentViewerInternal({
  anchorBaseUrl,
  comment,
  setIsEditing,
  onLinkClick,
  onReply,
  refAttribute,
  commentAuthorLogin,
  avatarUrl,
  highlightedCommentId,
  navigate,
  relayConnectionIds,
  commentSubjectAuthorLogin,
  reactable,
  commentAuthorType,
}: InternalProps) {
  const commentData = useFragment(IssueCommentFragment, comment)
  const reactionData = useFragment(
    graphql`
      fragment IssueCommentViewerReactable on Reactable {
        ...ReactionViewerGroups
      }
    `,
    reactable,
  )
  const highlighted = String(commentData.databaseId) === highlightedCommentId
  const commentHidden = !!commentData.pendingMinimizeReason || commentData.isHidden
  const [isMinimized, setIsMinimized] = useState(commentHidden)

  // sync external mark as hidden with internal state
  useEffect(() => {
    if (isMinimized === commentHidden) return
    setIsMinimized(commentHidden)

    // we wish to sync only when external isHidden changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentHidden])

  const handleOnReply = (quotedText?: string) => {
    onReply(quotedText || getQuotedText(commentData.body))
  }

  const commentRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}} className={CLASS_NAMES.issueComment} ref={commentRef}>
        <Box
          data-testid={TEST_IDS.commentViewerOuterBox(commentData.id)}
          sx={{
            overflowX: 'auto',
            scrollMarginTop: '100px',
            flexGrow: 1,
          }}
          ref={highlighted ? refAttribute : null}
        >
          <IssueCommentHeader
            anchorBaseUrl={anchorBaseUrl}
            comment={commentData}
            commentAuthorLogin={commentAuthorLogin}
            navigate={navigate}
            editComment={setIsEditing}
            onReplySelect={handleOnReply}
            isMinimized={isMinimized}
            onMinimize={setIsMinimized}
            avatarUrl={avatarUrl}
            commentRef={commentRef}
            relayConnectionIds={relayConnectionIds}
            commentSubjectAuthorLogin={commentSubjectAuthorLogin}
            commentAuthorType={commentAuthorType}
          />
          <Box sx={{display: 'flex', flexDirection: 'column', margin: 3, gap: '12px'}}>
            {(!commentHidden || !isMinimized) && (
              <>
                <CommentMarkdownViewer comment={commentData} onLinkClick={onLinkClick} />
                <ReactionViewer
                  subjectId={commentData.id}
                  reactionGroups={reactionData}
                  locked={commentData.issue.locked}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}

type CommentMarkdownViewerProps = {
  comment: IssueCommentViewerMarkdownViewer$key
  onLinkClick?: (event: MouseEvent) => void
}

function CommentMarkdownViewer({comment, onLinkClick}: CommentMarkdownViewerProps) {
  const {id, bodyVersion, bodyHTML, viewerCanUpdate, body} = useFragment(IssueCommentViewerMarkdownViewer, comment)
  const environment = useRelayEnvironment()
  const html = (bodyHTML ?? '') as SafeHTMLString

  const onSave = useCallback(
    (newBody: string, onCompleted: () => void, onError: () => void) => {
      commitUpdateIssueCommentBodyMutation({
        environment,
        input: {id, body: newBody, bodyVersion},
        onCompleted,
        onError,
      })
    },
    [bodyVersion, environment, id],
  )

  return (
    <IssueMarkdownViewer
      html={html}
      markdown={body}
      viewerCanUpdate={viewerCanUpdate}
      onSave={onSave}
      onLinkClick={onLinkClick}
    />
  )
}
