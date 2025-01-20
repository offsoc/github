import {SmileyIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'

type RenderAnchorProps = React.HTMLAttributes<HTMLElement>
type ReactionViewerAnchorProps = {
  renderAnchorProps?: RenderAnchorProps
}

export function ReactionViewerAnchor({renderAnchorProps}: ReactionViewerAnchorProps) {
  return (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      unsafeDisableTooltip={true}
      size="small"
      sx={{
        borderRadius: 100,
        height: 28,
        width: 28,
        display: 'flex',
        alignItems: 'center',
        '& > span': {
          lineHeight: 1,
          ml: '-1px',
        },
      }}
      icon={SmileyIcon}
      {...renderAnchorProps}
      aria-label="All reactions"
      aria-labelledby={undefined}
    />
  )
}
