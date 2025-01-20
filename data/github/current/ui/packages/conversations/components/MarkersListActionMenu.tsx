import {VALUES} from '@github-ui/commenting/Values'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ArrowRightIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Octicon, Text} from '@primer/react'
import type {RefObject} from 'react'

import type {CommentAuthor, DiffAnnotation, ThreadSummary} from '../types'
import {AnnotationIcon} from './AnnotationIcon'

export function MarkersListActionMenu({
  anchorRef,
  annotations,
  handleOpenChange,
  threads,
  onShowAnnotation,
  onShowCommentThread,
  ghostUser = VALUES.ghostUser,
}: {
  anchorRef: RefObject<HTMLElement>
  annotations: DiffAnnotation[]
  handleOpenChange: (isOpen: boolean) => void
  threads: ThreadSummary[]
  onShowAnnotation: (annotationId: string) => void
  onShowCommentThread: (threadId: string) => void
  ghostUser?: CommentAuthor
}) {
  function lineClampStyles(numberOfLines: number) {
    return {
      display: '-webkit-box',
      overflow: 'hidden',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': numberOfLines.toString(),
      maxWidth: 'unset',
    }
  }

  return (
    <ActionMenu anchorRef={anchorRef} open onOpenChange={handleOpenChange}>
      <ActionMenu.Overlay width="small">
        <div>
          <ActionList>
            {annotations.map(annotation => {
              return (
                <ActionList.Item key={annotation.id} onSelect={() => onShowAnnotation(annotation.id)}>
                  <ActionList.LeadingVisual sx={{mr: 2}}>
                    <AnnotationIcon key={annotation.id} annotationLevel={annotation.annotationLevel} />
                  </ActionList.LeadingVisual>
                  <Box sx={{...lineClampStyles(2)}}>
                    {annotation.checkSuite.name} /{' '}
                    <Text sx={{fontWeight: 400, color: 'fg.muted'}}>{annotation.checkRun.name}</Text>
                  </Box>
                  <ActionList.Description variant="block">
                    <Box sx={{...lineClampStyles(1)}}>{annotation.title}</Box>
                  </ActionList.Description>
                  <ActionList.TrailingVisual>
                    <Octicon icon={ArrowRightIcon} />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              )
            })}
            {threads.map(thread => (
              <ActionList.Item key={thread.id} onSelect={() => onShowCommentThread(thread.id)}>
                <ActionList.LeadingVisual sx={{mr: 2}}>
                  <GitHubAvatar
                    alt={thread.author.login}
                    size={20}
                    src={thread.author.avatarUrl ?? ghostUser.avatarUrl}
                  />
                </ActionList.LeadingVisual>
                Thread by {thread.author.login}
                <ActionList.Description variant="block">
                  {thread.commentCount} comment{thread.commentCount > 1 ? 's' : ''}
                </ActionList.Description>
                <ActionList.TrailingVisual>
                  <Octicon icon={ArrowRightIcon} />
                </ActionList.TrailingVisual>
              </ActionList.Item>
            ))}
          </ActionList>
        </div>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
