import {Box, Text, Octicon, IconButton, UnderlineNav} from '@primer/react'

import {
  StarIcon,
  BookIcon,
  RepoIcon,
  ProjectIcon,
  PackageIcon,
  ThreeBarsIcon,
  MarkGithubIcon,
} from '@primer/octicons-react'

// 🚨 Note: This is a fake component mimicking our global navigation.

function Navigation() {
  return (
    <Box as="header" sx={{bg: 'canvas.inset', width: '100%', maxWidth: '100%'}}>
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          gap: 3,
          alignItems: 'center',
        }}
      >
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton unsafeDisableTooltip={true} icon={ThreeBarsIcon} aria-label="Open global navigation menu" />
        <Octicon icon={MarkGithubIcon} size={32} />
        <Box sx={{display: 'flex', gap: 2}}>
          <Text sx={{fontSize: 1, fontWeight: 'bold'}}>mona</Text>
        </Box>
      </Box>
      <UnderlineNav aria-label="User">
        <UnderlineNav.Item aria-current="page" icon={BookIcon}>
          Overview
        </UnderlineNav.Item>
        <UnderlineNav.Item icon={RepoIcon} counter={25}>
          Repositories
        </UnderlineNav.Item>
        <UnderlineNav.Item icon={ProjectIcon}>Projects</UnderlineNav.Item>
        <UnderlineNav.Item icon={PackageIcon}>Packages</UnderlineNav.Item>
        <UnderlineNav.Item icon={StarIcon} counter={28}>
          Stars
        </UnderlineNav.Item>
      </UnderlineNav>
    </Box>
  )
}

export default Navigation
