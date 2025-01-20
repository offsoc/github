import {useState} from 'react'
import type {PropsWithChildren} from 'react'
import {Box, PageLayout, Octicon} from '@primer/react'

import GlobalNavigation from './GlobalNavigation'
import Categories from './Categories'
import Featured from './Featured'
import Trending from './Trending'
import Header from './Header'

import {Dialog} from '@primer/react/drafts'
import {ChevronDownIcon} from '@primer/octicons-react'

export function Marketplace() {
  const pageTitle = 'Featured'
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
      <Header />
      <PageLayout padding="none" rowGap="none" columnGap="none" sx={{px: [1, 3, 6]}}>
        <PageLayout.Pane
          position="start"
          padding="none"
          hidden={{
            narrow: true,
            regular: false,
            wide: false,
          }}
        >
          <Categories />
        </PageLayout.Pane>
        <PageLayout.Content padding="none" sx={{minHeight: '100vh'}}>
          <Box
            sx={{
              maxWidth: 1400,
              mx: 'auto',
              px: [0, 0, 2],
              pt: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                pl: [2, 2, 4],
                pr: [3, 3, 4],
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: ['block', 'block', 'none'],
                    pb: 3,
                  }}
                >
                  <MobileNavigationButton>
                    <Box
                      sx={{
                        color: 'fg.muted',
                        display: 'inline-block',
                        pr: 1,
                      }}
                    >
                      Category:
                    </Box>{' '}
                    {pageTitle}
                  </MobileNavigationButton>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                px: [3, 3, 4],
                pb: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <Featured />
              <Trending />
            </Box>
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  )
}

function MobileNavigationButton({children}: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const onDialogClose = () => setIsOpen(false)
  return (
    <>
      <TitleButton onClick={() => setIsOpen(!isOpen)}>{children}</TitleButton>
      {isOpen && (
        <>
          <Dialog
            width="large"
            height="auto"
            renderBody={() => (
              <Box sx={{px: 1, py: 2}}>
                <Categories />
              </Box>
            )}
            position={{narrow: 'bottom'}}
            title="Category"
            onClose={onDialogClose}
          />
        </>
      )}
    </>
  )
}

function TitleButton({children, onClick}: PropsWithChildren<{onClick: () => void}>) {
  return (
    <Box
      as="button"
      sx={{
        fontSize: 1,
        border: 0,
        padding: 0,
        cursor: 'pointer',
        bg: 'canvas.default',
        color: 'fg.default',
        borderRadius: 2,
        fontWeight: 'bold',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        py: 1,
        px: 2,
        ':hover': {
          bg: 'btn.hoverBg',
        },
      }}
      onClick={onClick}
    >
      {children}
      <Octicon icon={ChevronDownIcon} size={16} sx={{ml: 1, color: 'fg.muted'}} />
    </Box>
  )
}
