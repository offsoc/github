import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useMemo} from 'react'
import {TimelineDivider} from './TimelineDivider'

export type TimelineRowBorderProps = {
  children: React.ReactNode
  addDivider: boolean
  item: {
    __id: string
  }
  isMajor?: boolean
  isHighlighted?: boolean
  sx?: BetterSystemStyleObject
  commentParams?: TimelineRowBorderCommentParams
}

export type TimelineRowBorderCommentParams = {
  first: boolean
  last: boolean
  viewerDidAuthor?: boolean
}

const sharedStyling: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  borderRadius: 2,
  backgroundColor: 'canvas.default',
  transition: '0.2s',
}

export const TimelineRowBorder = (props: TimelineRowBorderProps) => {
  const {children, addDivider, item, isMajor, isHighlighted, commentParams, sx} = props

  const highlightedStyling = useMemo(
    () =>
      isHighlighted
        ? {
            border: '1px solid',
            borderColor: 'accent.fg',
            boxShadow: `0px 0px 0px 1px var(--fgColor-accent, var(--color-accent-fg)), 0px 0px 0px 4px var(--bgColor-accent-muted, var(--color-accent-subtle))`,
          }
        : {},
    [isHighlighted],
  )

  const commentStyling = useMemo(
    () =>
      commentParams
        ? {
            ...(!commentParams.first ? {marginTop: 2} : {}),
            ...(!commentParams.last ? {marginBottom: 2} : {}),
          }
        : {},
    [commentParams],
  )

  const majorEventStyling = useMemo(() => {
    return {
      ...sharedStyling,
      border: '1px solid',
      borderColor: commentParams?.viewerDidAuthor ? 'accent.muted' : 'border.default',
      py: 0,
      ...commentStyling,
      ...highlightedStyling,
      ...sx,
      paddingTop: '0px',
    }
  }, [commentParams?.viewerDidAuthor, commentStyling, highlightedStyling, sx])

  const defaultStyling = useMemo(() => {
    return {
      pl: '12px',
      ...sharedStyling,
      ...highlightedStyling,
      ...sx,
    }
  }, [highlightedStyling, sx])

  return (
    <>
      {addDivider && <TimelineDivider id={item.__id} />}
      <Box
        data-highlighted-event={isHighlighted}
        key={item.__id}
        sx={isMajor ? majorEventStyling : defaultStyling}
        data-testid={`timeline-row-border-${item.__id}`}
      >
        {children}
      </Box>
    </>
  )
}
