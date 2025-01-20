import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'
import {RelayEnvironmentProvider, type OperationDescriptor} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'

import {ListIssueTypeFilter} from '../ListIssueTypeFilter'
import {IssueTypePickerGraphqlQuery} from '@github-ui/item-picker/IssueTypePicker'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {TEST_IDS} from '../../../../constants/test-ids'

const mockUseQueryContext = jest.fn().mockReturnValue({activeSearchQuery: 'aa', currentViewId: 'repo'})
jest.mock('../../../../contexts/QueryContext', () => ({
  useQueryContext: () => mockUseQueryContext({}),
}))

test('renders a menu with issue types', async () => {
  renderListIssueTypeFilter(() => {})

  const button = screen.getByTestId(TEST_IDS.issueTypeAnchorFilter)
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Types')

  expect(screen.queryByPlaceholderText('Filter by issue type')).not.toBeInTheDocument()

  userEvent.click(button)

  const header = screen.getByText('Filter by issue type')
  await expect(header).toBeInTheDocument()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(3)
  expect(listItems[0]).toHaveTextContent('Bug')
  expect(listItems[1]).toHaveTextContent('Enhancement')
  expect(listItems[2]).toHaveTextContent('Task')
})

test('when selection is changed, it calls the provided callback', async () => {
  const callback = jest.fn()

  renderListIssueTypeFilter(callback)
  expect(callback).not.toHaveBeenCalled()

  const button = screen.getByTestId(TEST_IDS.issueTypeAnchorFilter)
  expect(button).toBeInTheDocument()
  userEvent.click(button)

  const searchInput = screen.queryByLabelText('Filter types')
  expect(searchInput).toBeInTheDocument()
  expect(searchInput).toBeVisible()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(3)
  expect(listItems[1]).toHaveTextContent('Enhancement')

  userEvent.click(await within(listItems[1]!).findByText('Enhancement'))

  // // Close the picker
  await expect(screen.queryByPlaceholderText('Filter types')).not.toBeInTheDocument()
  await expect(callback).toHaveBeenCalled()
})

const renderListIssueTypeFilter = (onSelectCallback: () => void) => {
  const environment = createMockEnvironment()
  environment.mock.queuePendingOperation(IssueTypePickerGraphqlQuery, {owner: 'github', repo: 'issues'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          issueTypes: {
            edges: [
              {
                node: {
                  id: mockRelayId(),
                  name: 'Bug',
                },
              },
              {
                node: {
                  id: mockRelayId(),
                  name: 'Enhancement',
                },
              },
              {
                node: {
                  id: mockRelayId(),
                  name: 'Task',
                },
              },
            ],
          },
        }
      },
    })
  })

  render(
    <RelayEnvironmentProvider environment={environment}>
      <ListIssueTypeFilter
        nested={false}
        repo={{name: 'github', owner: 'issues'}}
        applySectionFilter={() => onSelectCallback()}
      />
    </RelayEnvironmentProvider>,
  )
}
