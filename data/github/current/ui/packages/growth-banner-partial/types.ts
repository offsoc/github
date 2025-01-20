import type {FC} from 'react'
import type {Icon} from '@primer/octicons-react'
import type {GrowthBannerProps} from '@github-ui/growth-banner'

export type BannerType =
  | 'tag_protection_deprecation_header'
  | 'branch_protection_deprecation_blankslate'
  | 'branch_protection_deprecation_header'

export type RegisteredComponentChildren = {
  helpUrl?: string
  newBranchRulesetPath?: string
  newClassicBranchProtectionPath?: string
  rulesetsPath?: string
}

export type RegisteredComponent = {
  Children: FC<RegisteredComponentChildren>
  icon: Icon
  title: string
  variant: GrowthBannerProps['variant']
}
