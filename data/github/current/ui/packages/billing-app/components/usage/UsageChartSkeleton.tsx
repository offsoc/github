import {Box, Heading} from '@primer/react'

import {LoadingComponent} from '..'
import {boxStyle} from '../../utils/style'

const containerStyle = {
  ...boxStyle,
  width: '100%',
  height: '100%',
  p: 0,
  mb: 3,
}

const innerContainerStyle = {
  height: '432px',
  border: 0,
}

const chartHeaderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  pl: 3,
  pr: 3,
  pt: 3,
}

const chartSubtitleStyle = {
  color: 'fg.muted',
  fontSize: 1,
  fontWeight: 'normal',
}

export default function UsageChartSkeleton() {
  return (
    <Box sx={containerStyle}>
      <Box sx={chartHeaderContainerStyle}>
        <Box sx={{flex: 1}}>
          <Heading as="h3" sx={{fontSize: 2}}>
            All usage
          </Heading>
          <Heading as="h4" sx={chartSubtitleStyle}>
            Loading...
          </Heading>
        </Box>
      </Box>
      <LoadingComponent sx={innerContainerStyle} />
    </Box>
  )
}
