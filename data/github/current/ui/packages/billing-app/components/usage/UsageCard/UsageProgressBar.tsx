import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {COLORS} from '../../../constants'

import type {RepoUsageLineItem} from '../../../types/usage'

interface Props {
  allOtherUsage?: number
  usage: RepoUsageLineItem[]
  totalUsage: number
  sx?: BetterSystemStyleObject
}

export default function UsageProgressBar({allOtherUsage, usage, totalUsage, sx}: Props) {
  const usageLength = usage.length
  const hasOtherUsage = !!allOtherUsage && allOtherUsage > 0

  return (
    <Box sx={{display: 'flex', ...sx}}>
      {usage.map((lineItem, index) => {
        return (
          <Box
            // TODO: update this key with org ID once we have org data wired in
            key={`usage-${index}`}
            sx={{
              height: '8px',
              // Calculate the width of the progress bar segment based on the share of the total usage
              width: `${(lineItem.billedAmount / totalUsage) * 100}%`,
              bg: COLORS[index],
              mr: hasOtherUsage || index !== usageLength - 1 ? '1px' : '0px',
              borderTopLeftRadius: index === 0 ? 2 : 0,
              borderBottomLeftRadius: index === 0 ? 2 : 0,
              // We only want to have a radius on the right if we don't have
              // an other usage segment and this is the last element
              borderTopRightRadius: !hasOtherUsage && index === usageLength - 1 ? 2 : 0,
              borderBottomRightRadius: !hasOtherUsage && index === usageLength - 1 ? 2 : 0,
            }}
            data-testid={`${COLORS[index]}-usage-bar`}
          />
        )
      })}
      {hasOtherUsage && (
        <Box
          sx={{
            height: '8px',
            width: `${((allOtherUsage ?? 0) / totalUsage) * 100}%`,
            bg: 'border.default',
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
          }}
          data-testid="other-usage-bar"
        />
      )}
    </Box>
  )
}
