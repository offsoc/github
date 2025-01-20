import {Dialog} from '@primer/react'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'

import {CopilotReferencePreview, useReferences} from './CopilotReferencePreview'
import type {CopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'

export function CopilotReferencePreviewDialog() {
  const {dismissReference, reference} = useReferences()
  const {screenSize} = useScreenSize()
  const smallScreen = screenSize < ScreenSize.large
  const title = dialogTitleForReference(reference)
  return (
    <Dialog
      aria-label={title}
      isOpen={!!reference}
      onDismiss={dismissReference}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 'var(--borderRadius-large)',
        margin: 0,
        ...(smallScreen
          ? {
              height: ['auto', 'auto'], // Needed for specificity - otherwise gets overridden by default small-screen dialog behavior
              top: '1dvh',
              width: '90dvw',
            }
          : {
              top: '10vh',
              width: '50dvw',
              maxWidth: '1024px',
            }),
      }}
    >
      <Dialog.Header>{title}</Dialog.Header>
      <CopilotReferencePreview />
    </Dialog>
  )
}

function dialogTitleForReference(reference: CopilotChatReference | null) {
  switch (reference?.type) {
    case 'web-search':
      return `Bing search results for "${reference.query}"`
    default:
      return 'Reference'
  }
}
