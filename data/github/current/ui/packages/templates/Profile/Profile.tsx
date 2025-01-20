// eslint-disable-next-line no-restricted-imports
import {Box, PageLayout, Text, Button, Link, Avatar, Heading} from '@primer/react'

import CustomReadme from './CustomReadme'
import PinnedRepositories from './PinnedRepositories'
import Navigation from './Navigation'
import Contributions from './Contributions'

import SidebarAchievements from './SidebarAchievements'
import SidebarSocialStats from './SidebarSocialStats'
import SidebarOrganizations from './SidebarOrganizations'
import SidebarSocialLinks from './SidebarSocialLinks'
import SidebarMatchingFollowers from './SidebarMatchingFollowers'

export function Profile() {
  return (
    <Box
      sx={{
        bg: 'canvas.default',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'stretch',
        alignItems: 'stretch',
        flexDirection: 'column',
      }}
    >
      <Navigation />
      <PageLayout containerWidth="xlarge">
        <Box
          as="main"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          <PageLayout.Pane position="start">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: [3, 3, 4],
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: ['row', 'row', 'column'],
                  alignItems: ['center', 'center', 'flex-start'],
                  gap: [3, 3, 2],
                  pt: 2,
                }}
              >
                <Avatar
                  src="https://avatars.githubusercontent.com/u/92997159?v=4"
                  sx={{
                    width: ['16%', '16%', '100%'],
                    flexShrink: 0,
                    height: 'auto',
                  }}
                />
                <Heading
                  as="h1"
                  sx={{
                    fontSize: 4,
                    fontWeight: 'bold',
                    lineHeight: 'normal',
                  }}
                >
                  Mona
                  <Text
                    as="span"
                    sx={{
                      display: 'block',
                      fontSize: 3,
                      fontWeight: 300,
                      color: 'fg.muted',
                      lineHeight: 'normal',
                    }}
                  >
                    mona · she/her
                  </Text>
                </Heading>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexDirection: 'column',
                }}
              >
                <Button>Follow</Button>
                <span>
                  Chief Purr-ogramming Mascot{' '}
                  <Link
                    href="https://github.com/github"
                    sx={{
                      fontWeight: 'bold',
                      color: 'fg.default',
                    }}
                  >
                    @github
                  </Link>
                  . Guardian of open-source seas, and whisker-twitching fan of yarn balls 🐙🧶
                </span>
                <SidebarSocialStats />
                <SidebarMatchingFollowers />
              </Box>
              <SidebarSocialLinks />
            </Box>
            <SidebarAchievements />
            <SidebarOrganizations />
          </PageLayout.Pane>
          <PageLayout.Content as="div" padding="none" sx={{minHeight: '100vh', pt: [0, 0, 2]}}>
            <Box sx={{maxWidth: 1400, mx: 'auto', px: [0, 0, 2]}}>
              <CustomReadme />
              <PinnedRepositories />
              <Contributions />
            </Box>
          </PageLayout.Content>
        </Box>
      </PageLayout>
    </Box>
  )
}
