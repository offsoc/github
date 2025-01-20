import {Box} from '@primer/react'

import CheckRunItem from './CheckRunItem'
import type {CheckRun} from '../index'

export default function ChecksStatusBadgeFooter({checkRuns}: {checkRuns: CheckRun[]}) {
  return (
    <Box
      as="ul"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: ['230px', '380px'],
        overflow: 'auto',
      }}
    >
      {checkRuns.map((checkRun, i) => (
        // This list will not change, so using the index for the key is safe
        <CheckRunItem key={i} checkRun={checkRun} />
      ))}
    </Box>
  )
}
