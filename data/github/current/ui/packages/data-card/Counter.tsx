import type {SxProp} from '@primer/react'
import {Box, Text} from '@primer/react'

export interface CounterProps extends SxProp {
  count: number
  total?: number
  metric?: {singular: string; plural: string} | string
}

function Counter(props: CounterProps) {
  const countStyle = {
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: '24px',
  }

  const mutedStyle = {
    fontSize: '16px',
    fontWeight: 400,
    color: 'fg.muted',
  }

  function pluralizeCountLabel() {
    if (props.metric === undefined) {
      return null
    }

    const style = props.total ? mutedStyle : countStyle
    let metric = ''

    if (typeof props.metric === 'string') {
      metric = props.metric
    } else {
      metric = props.count === 1 ? props.metric.singular : props.metric.plural
    }

    return <Text sx={{...style, ml: 1}}> {metric.toLowerCase()}</Text>
  }

  function renderCount() {
    const numberFormatter = Intl.NumberFormat('en-US', {
      notation: 'standard',
    })
    const count = numberFormatter.format(props.count)

    return (
      <>
        <Text sx={countStyle}>
          {count}
          {props.total !== undefined && <Text sx={mutedStyle}> / {numberFormatter.format(props.total)} </Text>}
        </Text>
      </>
    )
  }

  const boxStyle = {
    display: 'flex',
    ...props.sx,
  }

  return (
    <Box sx={boxStyle}>
      {renderCount()}
      {pluralizeCountLabel()}
    </Box>
  )
}

Counter.displayName = 'DataCard.Counter'

export default Counter
