import type {Meta} from '@storybook/react'
import type {OperationDescriptor} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {TestComponentRoot} from '../test-utils/components/IssueViewerTestComponent'
import {generateMockPayloadWithDefaults} from '../test-utils/DefaultWrappers'

const environment = createMockEnvironment()

function EntryPoint() {
  return <TestComponentRoot environment={environment} />
}

const meta = {
  title: 'IssueViewer',
  component: TestComponentRoot,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof EntryPoint>

export default meta

export const IssueViewerExample = {
  args: {},
  render: () => {
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      const payload = generateMockPayloadWithDefaults(operation, {})
      return payload
    })

    return <EntryPoint />
  },
}
