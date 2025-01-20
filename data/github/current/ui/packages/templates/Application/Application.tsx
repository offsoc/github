import {Box, IconButton, PageLayout, ActionMenu, ActionList, Button, Heading} from '@primer/react'
import {Dialog} from '@primer/react/drafts'

import {KebabHorizontalIcon, TagIcon, MilestoneIcon} from '@primer/octicons-react'
import {useState} from 'react'

import SidebarNavigation from './SidebarNavigation'
import GlobalNavigation from './GlobalNavigation'
import MobileTitleNavigationButton from './MobileTitleNavigationButton'
import Filter from './Filter'

const COLLECTION_TITLE = 'Issues'
const PAGE_TITLE = 'Assigned to you'

export function Application() {
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
      <GlobalNavigation />
      <PageLayout containerWidth="full" padding="none" rowGap="none" columnGap="none">
        <PageLayout.Pane
          padding="none"
          position="start"
          divider="line"
          hidden={{
            narrow: true,
            regular: false,
            wide: false,
          }}
        >
          <Box sx={{p: 2, py: 4}}>
            <Heading as="h1" sx={{fontSize: 3, fontWeight: 'bold', px: 3}}>
              {COLLECTION_TITLE}
            </Heading>
            <Box sx={{mt: 2}}>
              <SidebarNavigation />
            </Box>
          </Box>
        </PageLayout.Pane>
        <PageLayout.Content padding="none" sx={{minHeight: '100vh', pt: [3, 3, 4]}}>
          <Box sx={{maxWidth: 1400, mx: 'auto', px: [0, 0, 2]}}>
            <Box
              sx={{
                display: 'flex',
                pb: 3,
                gap: 2,
                overflow: 'hidden',
                pl: [2, 2, 4],
                pr: [3, 3, 4],
              }}
            >
              <Box sx={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                <Box sx={{display: ['block', 'block', 'none'], overflow: 'hidden'}}>
                  <MobileNavigationButton />
                </Box>
                <Heading
                  as="h2"
                  sx={{
                    display: ['none', 'none', 'block'],
                    fontSize: 3,
                    fontWeight: 'bold',
                  }}
                >
                  {PAGE_TITLE}
                </Heading>
              </Box>
              <Box sx={{display: 'flex', gap: 2, flexShrink: 0}}>
                <Button variant="primary">New issue</Button>
                <ActionMenu>
                  <ActionMenu.Anchor>
                    {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                    <IconButton unsafeDisableTooltip={true} icon={KebabHorizontalIcon} aria-label="More" />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay align="end">
                    <ActionList>
                      <ActionList.Item onSelect={() => alert('Workflows clicked')}>
                        Manage labels
                        <ActionList.LeadingVisual>
                          <TagIcon />
                        </ActionList.LeadingVisual>
                      </ActionList.Item>
                      <ActionList.Item onSelect={() => alert('Workflows clicked')}>
                        Manage milestones
                        <ActionList.LeadingVisual>
                          <MilestoneIcon />
                        </ActionList.LeadingVisual>
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Box>
            </Box>
            <Box sx={{px: [3, 3, 4], display: 'flex', flexDirection: 'column', gap: 3}}>
              <Filter />
              <Box
                sx={{
                  height: 700,
                  bg: 'canvas.subtle',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  borderColor: 'border.default',
                  borderRadius: 2,
                  color: 'fg.muted',
                  fontSize: 1,
                }}
              >
                Content
              </Box>
            </Box>
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  )
}

function MobileNavigationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const onDialogClose = () => setIsOpen(false)
  return (
    <>
      <MobileTitleNavigationButton onClick={() => setIsOpen(!isOpen)}>{PAGE_TITLE}</MobileTitleNavigationButton>
      {isOpen && (
        <Dialog
          renderBody={() => (
            <Box sx={{px: 1, py: 2}}>
              <SidebarNavigation />
            </Box>
          )}
          title={COLLECTION_TITLE}
          onClose={onDialogClose}
          position={{narrow: 'bottom'}}
        />
      )}
    </>
  )
}
