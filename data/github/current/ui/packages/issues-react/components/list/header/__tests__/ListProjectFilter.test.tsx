import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, waitFor, within} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'
import {RelayEnvironmentProvider, type OperationDescriptor} from 'react-relay'
import {MockPayloadGenerator} from 'relay-test-utils'

import {ListProjectFilter} from '../ListProjectFilter'
import {ProjectPickerGraphqlQuery} from '@github-ui/item-picker/ProjectPicker'
import {buildProject} from '@github-ui/item-picker/test-utils/ProjectPickerHelpers'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'

const mockUseQueryContext = jest.fn().mockReturnValue({activeSearchQuery: 'aa', currentViewId: 'repo'})
jest.mock('../../../../contexts/QueryContext', () => ({
  useQueryContext: () => mockUseQueryContext({}),
}))

test('renders a menu with projects', async () => {
  // this test is emitting the following warning that we're not able to track down
  // Warning: Each child in a list should have a unique "key" prop
  jest.spyOn(console, 'error').mockImplementation()

  renderListProjectFilter(() => {})

  const button = screen.getByTestId('projects-anchor-button')
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Projects')

  expect(screen.queryByPlaceholderText('Filter projects')).not.toBeInTheDocument()

  userEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const list = screen.queryByPlaceholderText('Filter projects')
  expect(list).toBeInTheDocument()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(2)
  expect(listItems[0]).toHaveTextContent('Project 1')
  expect(listItems[1]).toHaveTextContent('Project 2')
})

test('when selection is changed, it calls the provided callback', async () => {
  const callback = jest.fn()

  renderListProjectFilter(callback)
  expect(callback).not.toHaveBeenCalled()

  const button = screen.getByTestId('projects-anchor-button')
  expect(button).toBeInTheDocument()
  userEvent.click(button)

  const list = screen.queryByLabelText('Project results')
  expect(list).toBeInTheDocument()

  expect(list).toBeVisible()

  const listItems = within(list!).getAllByRole('option')
  expect(listItems.length).toBe(2)

  expect(listItems[0]).toHaveTextContent('Project 1')

  userEvent.click(await within(listItems[0]!).findByText('Project 1'))
  expect(within(list!).getAllByRole('option')[0]!).toHaveAttribute('aria-selected', 'true')

  // Close the picker
  fireEvent.keyDown(document, {key: 'Escape', keyCode: 'Escape'})

  expect(screen.queryByPlaceholderText('Filter projects')).not.toBeInTheDocument()

  expect(callback).toHaveBeenCalled()
})

test('when selection has not changed, it does not call the provided callback', async () => {
  const callback = jest.fn()

  renderListProjectFilter(callback)
  expect(callback).not.toHaveBeenCalled()

  const button = screen.getByTestId('projects-anchor-button')
  expect(button).toBeInTheDocument()
  userEvent.click(button)

  // Close the picker
  fireEvent.keyDown(document, {key: 'Escape', keyCode: 'Escape'})

  expect(callback).not.toHaveBeenCalled()
})

const renderListProjectFilter = (onSelectCallback: () => void) => {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queuePendingOperation(ProjectPickerGraphqlQuery, {
    owner: 'github',
    repo: 'issues',
  })
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          projectsV2: {
            nodes: [
              buildProject({title: 'Project 1', closed: false}),
              buildProject({title: 'Project 2', closed: false}),
            ],
          },
          projects: {nodes: []},
          recentProjects: {edges: []},
          owner: {
            projectsV2: {edges: []},
            recentProjects: {edges: []},
            projects: {nodes: []},
          },
        }
      },
    })
  })

  render(
    <RelayEnvironmentProvider environment={environment}>
      <ListProjectFilter
        nested={false}
        repo={{name: 'github', owner: 'issues'}}
        applySectionFilter={() => onSelectCallback()}
      />
    </RelayEnvironmentProvider>,
  )
}
