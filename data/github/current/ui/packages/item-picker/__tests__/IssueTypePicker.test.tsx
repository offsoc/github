import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {TestIssueTypePickerComponent, buildIssueType} from '../test-utils/IssueTypePickerHelpers'
import {IssueTypePickerGraphqlQuery} from '../components/IssueTypePicker'

test('render issue types when clicking the anchor', async () => {
  const environment = setupEnvironment()

  render(<TestIssueTypePickerComponent environment={environment} shortcutEnabled={true} readonly={false} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  expect(screen.getAllByRole('option')).toHaveLength(2)

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('IssueTypeA')
  expect(options[1]).toHaveTextContent('IssueTypeB')
})

test('render issue types when pressing the shortcut', async () => {
  const environment = setupEnvironment()

  const {user} = render(
    <TestIssueTypePickerComponent environment={environment} shortcutEnabled={true} readonly={false} />,
  )

  await user.keyboard('t')

  expect(screen.getAllByRole('option')).toHaveLength(2)

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('IssueTypeA')
  expect(options[1]).toHaveTextContent('IssueTypeB')
})

test('can display readonly preselected issue type', async () => {
  const environment = setupEnvironment()

  render(
    <TestIssueTypePickerComponent
      environment={environment}
      shortcutEnabled={true}
      readonly={true}
      preselectedIssueTypeName="My Type"
    />,
  )

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('My Type')
  fireEvent.click(button)

  expect(screen.queryAllByRole('option')).toHaveLength(0)
})

function setupEnvironment() {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(IssueTypePickerGraphqlQuery, {owner: 'github', repo: 'issues'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.params.name).toBe('IssueTypePickerQuery')
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          issueTypes: {
            edges: [
              {node: buildIssueType({name: 'IssueTypeA', color: 'RED', description: ''})},
              {node: buildIssueType({name: 'IssueTypeB', description: '', color: 'GRAY'})},
            ],
          },
        }
      },
    })
  })

  return environment
}
