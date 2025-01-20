import type {Meta} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import type {OperationDescriptor} from 'relay-runtime'
import {TestIssueTypePickerComponent, buildIssueType} from '../test-utils/IssueTypePickerHelpers'
import {IssueTypePickerGraphqlQuery} from './IssueTypePicker'

type TestIssueTypePickerProps = React.ComponentProps<typeof TestIssueTypePickerComponent>

const environment = createMockEnvironment()

const meta = {
  title: 'ItemPicker/IssueTypePicker',
  component: TestIssueTypePickerComponent,
} satisfies Meta<typeof TestIssueTypePickerComponent>

export default meta

const play = () => {
  environment.mock.queuePendingOperation(IssueTypePickerGraphqlQuery, {owner: 'github', repo: 'issues'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          issueTypes: {
            edges: [
              {node: buildIssueType({name: 'Bug', color: 'RED', description: 'Used to report bugs'})},
              {node: buildIssueType({name: 'Feature', color: 'PURPLE', description: 'Used to request new features'})},
              {
                node: buildIssueType({
                  name: 'Epic',
                  color: 'BLUE',
                  description: 'Used to track large bodies of work',
                }),
              },
              {node: buildIssueType({name: 'Task', color: 'YELLOW', description: 'How we work on things'})},
              {node: buildIssueType({name: 'Story', color: 'GREEN', description: 'A small piece of work'})},
              {node: buildIssueType({name: 'Issue Type B', description: 'Something else', color: 'GRAY'})},
            ],
          },
        }
      },
    })
  })
}

const args = {
  environment,
  shortcutEnabled: true,
  readonly: false,
} satisfies TestIssueTypePickerProps

export const Example = {
  args,
  play,
}

export const PreselectedReadOnly = {
  args: {
    ...args,
    readonly: true,
    preselectedIssueTypeName: 'Feature',
  },
  play,
}
