import {Box, type BoxProps, Label, Link} from '@primer/react'

type BetaIndicatorProps = BoxProps & {
  feedbackUrl: string
}

export const BetaIndicator: React.FC<BetaIndicatorProps> = props => (
  <Box sx={{...(props.sx || {}), fontSize: 1}}>
    <Label variant="success">Beta</Label>{' '}
    <Link
      href={props.feedbackUrl}
      muted
      target="_blank"
      onClick={e => {
        e.stopPropagation() // prevent any other click handlers from firing
      }}
    >
      Give feedback
    </Link>
  </Box>
)
