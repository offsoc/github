import {ArrowDownIcon, ArrowUpIcon, PulseIcon} from '@primer/octicons-react'
import {Box, Octicon, Spinner} from '@primer/react'

type Props = {
  loading: boolean
  error: boolean
  value?: number
  flipColor?: boolean
  sx?: object
  maxValue?: number
  metric?: string
}

export function TrendIndicator({
  loading,
  error,
  value,
  flipColor = false,
  sx = {},
  maxValue = 999,
  metric = '%',
}: Props): JSX.Element {
  if (error) {
    return <></>
  }

  if (loading || value === undefined) {
    return <Spinner data-testid="trend-indicator-spinner" size="small" sx={{...sx, mt: 1, ml: 3}} />
  }

  let color = 'fg.muted'
  let icon = PulseIcon
  if (value > 0) {
    color = flipColor ? 'success.fg' : 'closed.fg'
    icon = ArrowUpIcon
  } else if (value < 0) {
    color = flipColor ? 'closed.fg' : 'success.fg'
    icon = ArrowDownIcon
  }

  return (
    <Box className="text-small" sx={{...sx, mt: 1, color}}>
      <Octicon icon={icon} />{' '}
      <span data-testid="trend-indicator-value">
        {value > maxValue ? `${maxValue}${metric}+` : `${value}${metric}`}
      </span>
    </Box>
  )
}
