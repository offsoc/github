import type {Meta} from '@storybook/react'
import {CopilotReferencePreview, type CopilotReferencePreviewProps} from './CopilotReferencePreview'
import {CopilotChatProvider} from '@github-ui/copilot-chat/CopilotChatContext'
import {getCopilotChatProviderProps} from '@github-ui/copilot-chat/test-utils/mock-data'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import {exampleReference} from './test-utils/mock-data'

const meta = {
  title: 'Copilot/CopilotReferencePreview',
  component: CopilotReferencePreview,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    dismissable: {control: 'check', defaultValue: false},
  },
} satisfies Meta<typeof CopilotReferencePreview>

export default meta

const defaultArgs: Partial<CopilotReferencePreviewProps> = {
  dismissable: false,
}

export const CopilotReferencePreviewExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: CopilotReferencePreviewProps) => (
    <QueryClientProvider client={new QueryClient()}>
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        refs={[exampleReference]}
        selectedReference={exampleReference}
        topic={undefined}
        threadId="2"
        mode="immersive"
      >
        <CopilotReferencePreview {...args} />
      </CopilotChatProvider>
    </QueryClientProvider>
  ),
}
