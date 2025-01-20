import {Box} from '@primer/react'
import {ListItem} from '../ListItem'
import type {RunViolationItem, RunViolationsData} from '../../../../types/rules-types'

export function ViolationsList({violations, format}: {violations: RunViolationsData; format: 'path' | 'commit'}) {
  const itemCount = violations.items.length
  const totalCount = violations.total

  return (
    <ul>
      {itemCount < totalCount && (
        <Box sx={{paddingLeft: 4, paddingTop: 0, color: 'danger.fg'}}>
          Found {totalCount} violations (showing first {itemCount})
        </Box>
      )}

      {violations.items.map((item: RunViolationItem, index: number) => (
        <ListItem
          key={index}
          state={'failure'}
          title={
            format === 'path'
              ? item.candidate?.substring(item.candidate.lastIndexOf('/') + 1) || 'Unknown'
              : item.candidate
          }
          titleClass={format === 'commit' ? 'text-mono' : undefined}
          description={format === 'path' ? item.candidate || 'N/A' : undefined}
          paddingY={1}
        />
      ))}
    </ul>
  )
}
