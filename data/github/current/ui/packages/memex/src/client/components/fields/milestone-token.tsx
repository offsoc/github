import {testIdProps} from '@github-ui/test-id-props'
import {MilestoneIcon} from '@primer/octicons-react'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {Milestone} from '../../api/common-contracts'
import {tokenIconSize} from '../common/avatars-token'

interface MilestoneTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text'> {
  milestone: Milestone
}

export const MilestoneToken = forwardRef<HTMLElement, MilestoneTokenProps>(({milestone, ...tokenProps}, ref) => (
  <Token
    leadingVisual={() => <MilestoneIcon size={tokenIconSize(tokenProps.size)} />}
    text={milestone.title}
    ref={ref}
    {...testIdProps('milestone-token')}
    {...tokenProps}
  />
))
MilestoneToken.displayName = 'MilestoneToken'
