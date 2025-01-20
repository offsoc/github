import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {ActionList, Box} from '@primer/react'
import type {FC} from 'react'

type Props = {
  width?: string
  showCompactDensity?: boolean
}

const RowLoading: FC<Props> = ({width = 'random', showCompactDensity = false}) => (
  <ActionList.Item>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: showCompactDensity ? 'center' : 'flex-start',
        gap: 2,
        height: showCompactDensity ? '20px' : '40px',
      }}
    >
      <LoadingSkeleton variant="elliptical" height="md" width="md" />
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LoadingSkeleton variant="rounded" height="sm" width={width} />
        {!showCompactDensity && (
          <LoadingSkeleton variant="rounded" height="12px" width={width} sx={{marginTop: '8px'}} />
        )}
      </Box>
    </Box>
  </ActionList.Item>
)

export default RowLoading
