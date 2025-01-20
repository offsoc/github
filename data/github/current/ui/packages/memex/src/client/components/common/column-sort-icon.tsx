import {SortAscIcon, SortDescIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'

import type {SortDirection} from '../../api/view/contracts'

interface ColumnSortIconProps {
  direction: SortDirection
  index?: number
}

export function ColumnSortIcon({direction, index}: ColumnSortIconProps) {
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', verticalAlign: 'text-bottom'}}>
      {direction === 'desc' ? <SortDescIcon /> : <SortAscIcon />}
      {index !== undefined && (
        <Text sx={{px: '2px', fontWeight: 'bold', fontSize: 0}} role="presentation">
          {index + 1}
        </Text>
      )}
    </span>
  )
}
