import {useRef} from 'react'
import {IconButton, Octicon, Tooltip} from '@primer/react'
import type {TooltipProps} from '@primer/react'
import {ShieldIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import useIsBranchProtected from '../hooks/use-is-branch-protected'
import type {Branch} from '../types'

interface BranchProtectionShieldProps extends Pick<Branch, 'name' | 'rulesetsPath' | 'protectedByBranchProtections'> {
  isLarge: boolean
}

export default function BranchProtectionShield({isLarge, ...branch}: BranchProtectionShieldProps) {
  const {isProtectedBy} = useIsBranchProtected(branch)
  const contentRef = useRef<HTMLDivElement>(null)
  const direction: TooltipProps['direction'] = !isLarge && branch.name.length < 5 ? 'ne' : undefined
  const [contentProps, tooltip] = usePortalTooltip({
    contentRef,
    'aria-label': 'This branch is protected by branch protections',
    direction,
  })

  if (isProtectedBy.branchProtections) {
    return (
      <>
        <div data-testid="branch-protection-shield" ref={contentRef} {...contentProps}>
          <Octicon
            size={16}
            icon={ShieldIcon}
            aria-label="This branch is protected by branch protections"
            sx={{width: 32, color: 'fg.muted'}}
          />
        </div>
        {tooltip}
      </>
    )
  }

  if (isProtectedBy.rulesets) {
    return (
      <Tooltip aria-label="View rules">
        <Link to={branch.rulesetsPath!} aria-label="This branch is protected">
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            icon={ShieldIcon}
            aria-label="This branch is protected"
          />
        </Link>
      </Tooltip>
    )
  }
  return null
}
