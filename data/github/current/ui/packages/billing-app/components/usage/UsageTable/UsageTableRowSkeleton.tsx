import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

import {borderTop, fixedWidthCell, identifierCell, trStyle} from './style'

interface Props {
  showQuantity: boolean
  showPricePerUnit: boolean
}

export default function UsageTableRowSkeleton({showQuantity, showPricePerUnit}: Props) {
  return (
    <Box sx={borderTop}>
      <Box sx={trStyle}>
        <Box sx={identifierCell}>
          <LoadingSkeleton variant="text" />
        </Box>
        {showQuantity && (
          <Box sx={fixedWidthCell}>
            <LoadingSkeleton variant="text" />
          </Box>
        )}
        {showPricePerUnit && (
          <Box sx={fixedWidthCell}>
            <LoadingSkeleton variant="text" />
          </Box>
        )}
        <Box sx={fixedWidthCell}>
          <LoadingSkeleton variant="text" />
        </Box>
        <Box sx={fixedWidthCell}>
          <LoadingSkeleton variant="text" />
        </Box>
      </Box>
    </Box>
  )
}
