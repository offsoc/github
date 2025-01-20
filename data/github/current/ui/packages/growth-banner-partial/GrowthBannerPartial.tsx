import {TagIcon, RepoPushIcon} from '@primer/octicons-react'
import {GrowthBanner} from '@github-ui/growth-banner'
import {TagProtectionDeprecationHeader} from './components/TagProtectionDeprecationHeader'
import {BranchProtectionDeprecationBlankslate} from './components/BranchProtectionDeprecationBlankslate'
import {BranchProtectionDeprecationHeader} from './components/BranchProtectionDeprecationHeader'
import type {BannerType, RegisteredComponent, RegisteredComponentChildren} from './types'

const componentRegistry: Record<BannerType, RegisteredComponent> = {
  tag_protection_deprecation_header: {
    Children: props => <TagProtectionDeprecationHeader {...props} />,
    icon: TagIcon,
    title: 'Level up your tag protections with Repository Rules',
    variant: 'warning',
  },
  branch_protection_deprecation_blankslate: {
    Children: props => <BranchProtectionDeprecationBlankslate {...props} />,
    icon: RepoPushIcon,
    title: "You haven't protected any of your branches",
    variant: 'information',
  },
  branch_protection_deprecation_header: {
    Children: props => <BranchProtectionDeprecationHeader {...props} />,
    icon: RepoPushIcon,
    title: 'Level up your branch protections with Repository Rules',
    variant: 'information',
  },
}

interface GrowthBannerPartialProps {
  bannerType: BannerType
  childrenProps?: RegisteredComponentChildren
}

export function GrowthBannerPartial({bannerType, childrenProps}: GrowthBannerPartialProps) {
  const {Children, icon, title, variant} = componentRegistry[bannerType]

  return (
    <GrowthBanner
      icon={icon}
      showCloseButton={false}
      sx={{marginBottom: 24}}
      title={title}
      variant={variant}
      data-testid="growth-banner-partial"
    >
      <Children {...childrenProps} />
    </GrowthBanner>
  )
}
