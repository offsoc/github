import {Header as AssistiveHeader} from '@github-ui/copilot-chat/components/Header'
import {useChatState} from '@github-ui/copilot-chat/CopilotChatContext'
import {isRepository} from '@github-ui/copilot-chat/utils/copilot-chat-helpers'
import {CopilotReferencePreviewDialog} from '@github-ui/copilot-reference-preview/CopilotReferencePreviewDialog'
import {useScrollbarWidth} from '@github-ui/use-scrollbar-width'
import {Box, PageLayout} from '@primer/react'
import {useEffect, useRef, useState} from 'react'

import {fullChatWidth} from '../utils/constants'
import {Header} from './Header'

const mobileInputHeight = 92 + 16
const mobileInputHeightNoAttach = 46 + 16

interface LayoutProps {
  chat: JSX.Element
}

export function Layout({chat}: LayoutProps) {
  const state = useChatState()
  const [showExperimentsDialog, setShowExperimentsDialog] = useState(false)
  const experimentsDialogRef = useRef<HTMLDivElement>(null)
  const workspaceHeight = state.messages.length ? '100dvh - 64px - 52px' : '100dvh - 64px' // 64px = header height, 52px = conversation header height if messages present

  const scrollbarWidth = useScrollbarWidth()
  const styleInitialized = useRef(false)

  useEffect(() => {
    if (!styleInitialized.current) {
      const srCss = '#js-global-screen-reader-notice, #js-global-screen-reader-notice-assertive { margin: -1px; }'
      const style = document.createElement('style')
      document.head.appendChild(style)
      style.appendChild(document.createTextNode(srCss))
    }
    styleInitialized.current = true
  }, [])

  const shouldShowReferences = state.currentTopic && isRepository(state.currentTopic)

  return (
    <PageLayout
      columnGap="normal"
      containerWidth="full"
      padding="normal"
      rowGap="normal"
      sx={{
        '> div': {flexDirection: 'column', height: 'inherit', flexWrap: 'nowrap'},
        height: `calc(${workspaceHeight})`,
        paddingLeft: '0 !important',
        paddingRight: '0 !important',
        paddingTop: '0 !important',
      }}
    >
      <PageLayout.Header sx={{mb: '0 !important'}}>
        <Box sx={{'@media screen and (max-width: 767px)': {display: 'none'}}}>
          <Header
            setShowExperimentsDialog={setShowExperimentsDialog}
            experimentsDialogRef={experimentsDialogRef}
            showExperimentsDialog={showExperimentsDialog}
          />
        </Box>
        <Box sx={{'@media screen and (min-width: 768px)': {display: 'none'}}}>
          <AssistiveHeader
            view="thread"
            showExperimentsDialog={showExperimentsDialog}
            setShowExperimentsDialog={setShowExperimentsDialog}
            experimentsDialogRef={experimentsDialogRef}
            isImmersive={true}
          />
        </Box>
      </PageLayout.Header>
      <CopilotReferencePreviewDialog />
      <PageLayout.Content
        as="div"
        sx={{
          'div:has(> [role="separator"])': {
            left: [null, null, '9px', '10px'],
            height: 0,
            top: 'calc(50% - 5%)',
            m: 0,
          },
          marginLeft: 'auto',
          marginRight: 'auto !important',
          '@media screen and (max-width: 767px)': {
            px: 3,
          },
        }}
        width={undefined}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100%',
            maxHeight: `calc(${workspaceHeight})`, // Account for the vertical padding on the PageLayout
            pb: 3,
            pt: 0,
            pr: 0,
            pl: 1,
            overflow: ['visible', 'visible', 'hidden'],
            '.copilot-messages-container': {
              pb: [mobileInputHeight, mobileInputHeight, 0], // Make space for the fixed-position input
            },
            '.copilot-chat-messages, .copilot-chat-input': {
              p: 0,
              width: '100%',
            },
            '.copilot-chat-messages': {
              height: state.messages.length ? '100vh' : undefined,
              overflowY: ['visible', 'visible', 'auto'], // The messages container should not scroll separately on mobile
              pt: 3,
              pb: [
                shouldShowReferences ? mobileInputHeight : mobileInputHeightNoAttach,
                shouldShowReferences ? mobileInputHeight : mobileInputHeightNoAttach,
                0,
              ],
              pl: [0, 0, `calc((100% - ${fullChatWidth}px) / 2)`],
              pr: [0, 0, `calc((100% - ${fullChatWidth}px) / 2 - ${scrollbarWidth}px)`],
              overscrollBehavior: 'auto',
            },
            '.copilot-chat-input': {
              position: ['fixed', 'fixed', 'relative'], // The input needs fixed positioning on mobile
              bottom: [3, 3, 0],
              left: ['20px', '20px', '0'],
              width: [`calc(100vw - 35px - ${scrollbarWidth}px)`, `calc(100vw - 35px - ${scrollbarWidth}px)`, '100%'],
              px: [0, 0, `calc((100% - ${fullChatWidth}px) / 2)`],
            },
          }}
          data-hpc
        >
          {chat}
        </Box>
      </PageLayout.Content>
    </PageLayout>
  )
}
