import type {ReactNode} from 'react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {boxStyle} from '../utils/style'

const containerStyle = {
  width: '100%',
  flex: '1',
  ...boxStyle,
}

const skeletonStyle = {
  width: '100%',
  height: '100%',
}

interface Props {
  children?: ReactNode
  sx?: BetterSystemStyleObject
  testid?: string
}

export default function LoadingComponent({children, sx, testid}: Props) {
  return (
    <Box sx={{...containerStyle, ...sx}} data-testid={testid}>
      {children ? children : <LoadingSkeleton sx={skeletonStyle} variant="rounded" />}
    </Box>
  )
}
