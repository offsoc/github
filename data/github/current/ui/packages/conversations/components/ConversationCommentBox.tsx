import {CommentBox, type CommentBoxHandle, type CommentBoxProps} from '@github-ui/comment-box/CommentBox'
import type {SxProp} from '@primer/react'
import type {ForwardedRef} from 'react'
import type React from 'react'
import {forwardRef} from 'react'

import {useConversationMarkdownSubjectContext} from '../contexts/ConversationMarkdownSubjectContext'

type ConversationCommentBoxProps = Omit<CommentBoxProps, 'children' | 'body' | 'subject'> & {
  children?: React.ReactNode
  label: string
  value: string
} & SxProp

export const ConversationCommentBox = forwardRef(
  ({children, ...rest}: ConversationCommentBoxProps, ref: ForwardedRef<CommentBoxHandle>) => {
    const subject = useConversationMarkdownSubjectContext()

    return (
      <CommentBox
        {...rest}
        ref={ref}
        placeholder="Leave a comment"
        actions={children}
        subject={subject ?? undefined}
        showLabel={false}
      />
    )
  },
)

ConversationCommentBox.displayName = 'ConversationCommentBox'
