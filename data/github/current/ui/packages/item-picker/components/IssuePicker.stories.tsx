import type {Meta} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import type {OperationDescriptor} from 'relay-runtime'
import {TestIssuePickerComponent, buildIssue} from '../test-utils/IssuePickerHelpers'

type TestIssuePickerProps = React.ComponentProps<typeof TestIssuePickerComponent>

const environment = createMockEnvironment()

const meta = {
  title: 'ItemPicker/IssuePicker',
  component: TestIssuePickerComponent,
} satisfies Meta<typeof TestIssuePickerComponent>

export default meta

const args = {
  environment,
} satisfies TestIssuePickerProps

export const Example = {
  args,
  play: () => {
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        Query() {
          return {
            commenters: {
              nodes: [buildIssue({title: 'issueA'}), buildIssue({title: 'issueB'})],
            },
          }
        },
      })
    })
  },
}
