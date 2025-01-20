import type {Meta} from '@storybook/react'
import {CopilotReferencePreviewDialog} from './CopilotReferencePreviewDialog'
import {CopilotChatProvider} from '@github-ui/copilot-chat/CopilotChatContext'
import {getCopilotChatProviderProps} from '@github-ui/copilot-chat/test-utils/mock-data'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import {exampleReference} from './test-utils/mock-data'

const meta = {
  title: 'Copilot/CopilotReferencePreviewDialog',
  component: CopilotReferencePreviewDialog,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    isOpen: {control: 'checkbox', defaultValue: true},
  },
} satisfies Meta<typeof CopilotReferencePreviewDialog>

export default meta

const defaultArgs = {}

export const CopilotReferencePreviewDialogExample = {
  args: {
    ...defaultArgs,
  },
  render: () => (
    <QueryClientProvider client={new QueryClient()}>
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        refs={[exampleReference]}
        selectedReference={exampleReference}
        topic={undefined}
        threadId="2"
        mode="immersive"
      >
        <CopilotReferencePreviewDialog />
      </CopilotChatProvider>
    </QueryClientProvider>
  ),
}
