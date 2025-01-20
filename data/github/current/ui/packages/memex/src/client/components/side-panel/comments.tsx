import type {CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {testIdProps} from '@github-ui/test-id-props'
import {ArrowDownIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useRef, useState} from 'react'

import type {IssueComment, ReactionEmotion} from '../../api/side-panel/contracts'
import {useElementSizes} from '../../hooks/common/use-element-sizes'
import {useIssueContext} from '../../state-providers/issues/use-issue-context'
import {Resources} from '../../strings'
import {SidePanelAddComment} from './add-comment'
import {SidePanelComment} from './comment'

const JUMP_TO_BOTTOM_HEIGHT_THRESHOLD_PX = 10_000

export const SidePanelComments: React.FC<{itemURL: string}> = ({itemURL}) => {
  const {
    sidePanelMetadata: {comments, capabilities},
    editIssueComment,
    reactToSidePanelItem,
  } = useIssueContext()

  const [container, setContainer] = useState<HTMLElement | null>(null)

  const addCommentEditorRef = useRef<CommentBoxHandle>(null)
  const sizes = useElementSizes(container)
  const height = sizes.offsetHeight ?? 0

  const goToEditor = () => {
    addCommentEditorRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
    addCommentEditorRef.current?.focus({preventScroll: true})
  }

  return comments ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        backgroundColor: 'canvas.subtle',
        borderTop: '1px solid',
        borderColor: 'border.muted',
        flex: 'auto',
      }}
      as="section"
      ref={setContainer}
      {...testIdProps('all-comments-box')}
    >
      <h3 style={{clipPath: 'circle(0)', position: 'absolute'}}>Comments</h3>

      <JumpToBottomButton onClick={goToEditor} visible={height >= JUMP_TO_BOTTOM_HEIGHT_THRESHOLD_PX} />

      <ul style={{listStyle: 'none'}}>
        {comments.map(comment => (
          <SidePanelIssueComment
            key={comment.id}
            comment={comment}
            editIssueComment={editIssueComment}
            reactToSidePanelItem={reactToSidePanelItem}
            itemURL={itemURL}
          />
        ))}
      </ul>
      {
        // The close/reopen issues are inside the addcomment component, so by doing this we are assuming
        // that if a user can close/reopen, they must also be able to comment. This is reasonable but if
        // incorrect we can revisit later - this is just much simpler from a readability perspective.
        capabilities?.includes('comment') && <SidePanelAddComment ref={addCommentEditorRef} />
      }
    </Box>
  ) : null
}

const JumpToBottomButton: React.FC<{onClick: () => void; visible: boolean}> = ({onClick, visible}) => (
  // Screen reader users don't care about scroll location or screen height, but it is useful
  // to be able to skip past the potentially hundreds of focuseable items to get to the 'add comment' field
  <TimelineSpacer
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
      px: 3,
    }}
  >
    <Button
      variant="invisible"
      size="small"
      onClick={onClick}
      trailingVisual={ArrowDownIcon}
      sx={{
        px: 2,
        position: visible ? 'unset' : 'absolute',
        clipPath: visible ? 'unset' : 'Circle(0)',
        ':focus': {
          position: 'unset',
          clipPath: 'unset',
        },
      }}
      aria-label="Jump to 'add comment' input"
      {...testIdProps('jump-to-bottom-button')}
    >
      {Resources.jumpToBottom}
    </Button>
  </TimelineSpacer>
)

const TimelineSpacer: React.FC<{children?: React.ReactNode; sx?: BetterSystemStyleObject}> = ({children, sx}) => (
  <Box sx={{borderLeft: `1px solid`, borderColor: 'border.muted', py: 2, ml: 4, ...sx}}>{children}</Box>
)

const SidePanelIssueComment: React.FC<{
  comment: IssueComment
  editIssueComment: (commentId: number, body: string) => Promise<IssueComment>
  itemURL: string
  reactToSidePanelItem: (
    reaction: ReactionEmotion,
    reacted: boolean,
    actor: string,
    commentId?: number,
  ) => Promise<void>
}> = ({comment, editIssueComment, reactToSidePanelItem, itemURL}) => {
  const commentUrl = `${itemURL}#issuecomment-${comment.id}`

  const onEdit = comment.capabilities?.includes('editDescription')
    ? async (body: string) => {
        await editIssueComment(comment.id, body)
      }
    : undefined

  const onReact = comment.capabilities?.includes('react')
    ? (reaction: ReactionEmotion, reacted: boolean, actor: string) =>
        reactToSidePanelItem(reaction, reacted, actor, comment.id)
    : undefined

  return (
    <li {...testIdProps(`comments-box-${comment.id}`)}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'border.muted',
          backgroundColor: 'canvas.default',
          borderRadius: 2,
          boxShadow: 'shadow.small',
        }}
      >
        <SidePanelComment
          author={comment.user}
          authorAssociation={comment.authorAssociation}
          createdAt={new Date(comment.createdAt)}
          editedAt={comment.description.editedAt ? new Date(comment.description.editedAt) : undefined}
          description={comment.description}
          reactions={comment.reactions}
          onEdit={onEdit}
          onReact={onReact}
          url={commentUrl}
        />
      </Box>
      <TimelineSpacer />
    </li>
  )
}
