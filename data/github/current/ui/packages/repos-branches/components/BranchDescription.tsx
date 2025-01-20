import {Box} from '@primer/react'
import type {TooltipProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import type {Branch} from '../types'
import BranchProtectionShield from './BranchProtectionShield'
import TruncatedBranchName from './TruncatedBranchName'

interface BranchDescriptionProps
  extends Pick<Branch, 'name' | 'path' | 'rulesetsPath' | 'protectedByBranchProtections'> {
  isLarge?: boolean
  sx?: BetterSystemStyleObject
}

export default function BranchDescription({isLarge = false, sx = {}, ...branch}: BranchDescriptionProps) {
  const direction: TooltipProps['direction'] = !isLarge && branch.name.length < 3 ? 'ne' : undefined
  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: BranchDescriptionHeight,
      }}
    >
      <TruncatedBranchName {...branch} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <CopyToClipboardButton
          className="d-flex flex-justify-center"
          sx={{width: BranchDescriptionHeight}}
          textToCopy={branch.name}
          ariaLabel="Copy branch name to clipboard"
          tooltipProps={{direction}}
          hasPortalTooltip={true}
        />
        <BranchProtectionShield {...branch} isLarge={isLarge} />
      </Box>
    </Box>
  )
}

export const BranchDescriptionHeight = 32
