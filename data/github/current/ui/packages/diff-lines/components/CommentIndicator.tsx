import {clsx} from 'clsx'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {AvatarStack, Text, type SxProp} from '@primer/react'
import type {CommentAuthor, DiffLine} from '../types'
import {
  AnimatedAnnotationIcon,
  AnnotationIcon,
  AnnotationPresentationMap,
} from '@github-ui/conversations/annotation-icon'
import type {DiffAnnotationLevels} from '@github-ui/conversations'
import {useEffect, type MutableRefObject} from 'react'
import styles from './CommentIndicator.module.css'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {useDiffContext} from '../contexts/DiffContext'

/**
 * Indicates whether a line has annotations, threads, and comments
 * Displays at most 3 avatars/icons as well as the total comment count across threads and annotations
 *
 */
export default function CommentIndicator({shouldAnimateRef}: {shouldAnimateRef?: MutableRefObject<boolean>} & SxProp) {
  const {diffLine} = useDiffLineContext()
  const line = diffLine as DiffLine
  const {ghostUser} = useDiffContext()
  // Reset the animation state after the first render so that the animation doesn't play on subsequent renders
  useEffect(() => {
    if (shouldAnimateRef?.current) {
      shouldAnimateRef.current = false
    }
  }, [shouldAnimateRef])

  const totalCommentsCount = line.threadsData?.totalCommentsCount || 0
  const totalAnnotationsCount = line.annotationsData?.totalCount || 0
  const totalCommentsAndAnnotationsCount = totalCommentsCount + totalAnnotationsCount
  if (totalCommentsAndAnnotationsCount === 0) {
    return null
  }

  const commentAuthors: {[key: string]: CommentAuthor} = {}
  const annotations: Array<{id: string; level: DiffAnnotationLevels}> = []

  line.annotationsData?.annotations?.map(annotation => {
    if (annotation?.annotationLevel) {
      annotations.push({id: annotation.id, level: annotation.annotationLevel})
    }
  })

  line.threadsData?.threads?.map(
    thread =>
      thread?.commentsData?.comments?.map(comment => {
        if (comment?.author) {
          commentAuthors[comment?.author.login] = comment.author
        } else if (ghostUser?.login) {
          commentAuthors[ghostUser.login] = ghostUser
        }
      }),
  )

  const annotationIcons = annotations
    .sort((annotationA, annotationB) => {
      const priorityA = AnnotationPresentationMap[annotationA.level]?.priority || 0
      const priorityB = AnnotationPresentationMap[annotationB.level]?.priority || 0
      return priorityA < priorityB ? -1 : 1
    })
    .map(annotation => {
      if (shouldAnimateRef?.current) {
        return <AnimatedAnnotationIcon key={annotation.id} annotationLevel={annotation.level} />
      }
      return <AnnotationIcon key={annotation.id} annotationLevel={annotation.level} />
    })

  const commentAuthorAvatars = Object.keys(commentAuthors).map(authorName => {
    const authorLogin = commentAuthors[authorName]?.login
    const authorAvatarUrl = commentAuthors[authorName]?.avatarUrl ?? (ghostUser?.avatarUrl || ' ')
    return <GitHubAvatar key={authorLogin} alt={authorLogin} size={20} src={authorAvatarUrl} />
  })

  // Display max of 3 stacked avatars/icons
  const avatarStackChildren = [...annotationIcons, ...commentAuthorAvatars].slice(0, 3)
  const indicatorText = totalCommentsAndAnnotationsCount > 9 ? '9+' : `${totalCommentsAndAnnotationsCount}`

  return (
    <div className={clsx('d-flex', 'flex-justify-between', 'flex-items-center', styles.commentIndicatorContainer)}>
      <AvatarStack
        disableExpand={true}
        sx={{
          maxWidth: '40px',
          // This is neccesary to override the defaults of the avatar stack to make sure that a list of 3 avatar elements doesn't render to far left of the thread count
          '--avatar-stack-three-plus-min-width': '32px',
        }}
      >
        {avatarStackChildren}
      </AvatarStack>
      <Text
        sx={{
          color: 'fg.default',
          ml: 1,
          fontSize: 0,
          fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          // Setting a static width here to always give the comment text element enough space for 2 characters (e.g. 1..9 or 9+)
          width: '2ch',
          textAlign: 'start',
        }}
      >
        {indicatorText}
      </Text>
    </div>
  )
}
