import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import type {Meta, StoryObj} from '@storybook/react'

import {MarkdownEditHistoryViewer} from './MarkdownEditHistoryViewer'
import {
  createEdits,
  queueHistoryQueryMock,
  setupEnvironment,
  TestComponent,
} from './test-utils/MarkdownEditHistoryViewerTestComponent'

type Story = StoryObj<typeof TestComponent>

const meta = {
  title: 'MarkdownEditHistoryViewer',
  component: MarkdownEditHistoryViewer,
} satisfies Meta<typeof MarkdownEditHistoryViewer>

export const MarkdownEditHistoryViewerExample: Story = (function () {
  const {environment} = createRelayMockEnvironment()

  return {
    argTypes: {},
    args: {
      environment,
    },
    render: args => {
      return <TestComponent environment={args.environment} />
    },
    play: async () => {
      setupEnvironment(environment)
      queueHistoryQueryMock(environment, createEdits(3))
    },
  }
})()

export default meta
