import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {fireEvent, screen, within} from '@testing-library/react'
import {RelayEnvironmentProvider, type OperationDescriptor} from 'react-relay'
import {ListMilestoneFilter} from '../ListMilestoneFilter'
import {MilestonesPickerGraphqlQuery} from '@github-ui/item-picker/MilestonePicker'
import {MockPayloadGenerator} from 'relay-test-utils'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {render} from '@github-ui/react-core/test-utils'

const mockUseFeatureFlags = jest.fn().mockReturnValue({prefetchInteractionDataEnabled: true})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))
const mockUseQueryContext = jest.fn().mockReturnValue({activeSearchQuery: 'aa', currentViewId: 'repo'})
jest.mock('../../../../contexts/QueryContext', () => ({
  useQueryContext: () => mockUseQueryContext({}),
}))

test('renders a menu with milestones', async () => {
  const {user} = renderListMilestoneFilter(() => {})

  const button = screen.getByTestId('milestones-anchor-button')
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Milestones')

  expect(screen.queryByPlaceholderText('Filter milestones')).not.toBeInTheDocument()

  await user.click(button)

  const list = screen.queryByPlaceholderText('Filter milestones')
  expect(list).toBeInTheDocument()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(3)
  expect(listItems[0]).toHaveTextContent('No milestone')
  expect(listItems[1]).toHaveTextContent('milestoneA')
  expect(listItems[2]).toHaveTextContent('milestoneB')
})

test('when selection is changed, it calls the provided callback', async () => {
  const callback = jest.fn()

  const {user} = renderListMilestoneFilter(callback)
  expect(callback).not.toHaveBeenCalled()

  const button = screen.getByTestId('milestones-anchor-button')
  expect(button).toBeInTheDocument()
  await user.click(button)

  const list = screen.queryByPlaceholderText('Filter milestones')
  expect(list).toBeInTheDocument()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(3)

  expect(listItems[1]).toHaveTextContent('milestoneA')
  await user.click(await within(listItems[1]!).findByText('milestoneA'))

  fireEvent.keyDown(document, {key: 'Escape', keyCode: 'Escape'})
  expect(screen.queryByPlaceholderText('Filter milestones')).not.toBeInTheDocument()

  expect(callback).toHaveBeenCalled()
})

const renderListMilestoneFilter = (onSelectCallback: () => void) => {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queuePendingOperation(MilestonesPickerGraphqlQuery, {owner: 'github', repo: 'issues'})

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          milestones: {
            nodes: [
              {id: mockRelayId(), title: 'milestoneA', closed: false, __typename: 'Milestone'},
              {id: mockRelayId(), title: 'milestoneB', closed: false, __typename: 'Milestone'},
            ],
          },
        }
      },
    })
  })

  return render(
    <RelayEnvironmentProvider environment={environment}>
      <ListMilestoneFilter
        nested={false}
        repo={{name: 'github', owner: 'issues'}}
        applySectionFilter={() => onSelectCallback()}
      />
    </RelayEnvironmentProvider>,
  )
}
