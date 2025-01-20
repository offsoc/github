import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, within} from '@testing-library/react'
import {RelayEnvironmentProvider, type OperationDescriptor} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'

import {ListLabelFilter} from '../ListLabelFilter'
import {LabelPickerGraphqlQuery} from '@github-ui/item-picker/LabelPicker'
import {buildLabel} from '@github-ui/item-picker/test-utils/LabelPickerHelpers'
import {SPECIAL_VALUES} from '@github-ui/item-picker/Placeholders'

const mockUseQueryContext = jest.fn().mockReturnValue({activeSearchQuery: 'aa', currentViewId: 'repo'})
jest.mock('../../../../contexts/QueryContext', () => ({
  useQueryContext: () => mockUseQueryContext({}),
}))

test('renders a menu with labels', async () => {
  const {user} = renderListLabelFilter(() => {})

  const button = screen.getByTestId('labels-anchor-button')
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Labels')

  expect(screen.queryByPlaceholderText('Filter labels')).not.toBeInTheDocument()

  await user.click(button)

  const list = screen.queryByPlaceholderText('Filter labels')
  expect(list).toBeInTheDocument()

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(3)
  expect(listItems[0]).toHaveTextContent(SPECIAL_VALUES.noLabelsData.name)
  expect(listItems[1]).toHaveTextContent('labelA')
  expect(listItems[2]).toHaveTextContent('labelB')
})

test('when selection is changed, it calls the provided callback', async () => {
  const callback = jest.fn()

  const {user} = renderListLabelFilter(callback)
  expect(callback).not.toHaveBeenCalled()

  const button = screen.getByTestId('labels-anchor-button')
  expect(button).toBeInTheDocument()
  await user.click(button)

  const list = screen.queryByLabelText('Label results')
  expect(list).toBeInTheDocument()

  expect(list).toBeVisible()

  const listItems = within(list!).getAllByRole('option')
  expect(listItems.length).toBe(3)

  expect(listItems[1]).toHaveTextContent('labelA')

  await user.click(await within(listItems[1]!).findByText('labelA'))
  expect(within(list!).getAllByRole('option')[1]!).toHaveAttribute('aria-selected', 'true')

  // Close the picker
  fireEvent.keyDown(document, {key: 'Escape', keyCode: 'Escape'})

  expect(screen.queryByPlaceholderText('Filter labels')).not.toBeInTheDocument()

  expect(callback).toHaveBeenCalled()
})

test('filters correctly the no labels option', async () => {
  const {user} = renderListLabelFilter(() => {})

  const button = screen.getByTestId('labels-anchor-button')
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Labels')

  expect(screen.queryByPlaceholderText('Filter labels')).not.toBeInTheDocument()

  await user.click(button)

  const list = screen.queryByPlaceholderText('Filter labels')!
  await user.type(list, SPECIAL_VALUES.noLabelsData.name.substring(0, 3))

  const listItems = screen.getAllByRole('option')
  expect(listItems.length).toBe(1)
  expect(listItems[0]).toHaveTextContent(SPECIAL_VALUES.noLabelsData.name)
})

const renderListLabelFilter = (onSelectCallback: () => void) => {
  const environment = createMockEnvironment()
  environment.mock.queuePendingOperation(LabelPickerGraphqlQuery, {owner: 'github', repo: 'issues'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          labels: {
            nodes: [buildLabel({name: 'labelA'}), buildLabel({name: 'labelB'})],
          },
        }
      },
    })
  })

  return render(
    <RelayEnvironmentProvider environment={environment}>
      <ListLabelFilter
        nested={false}
        repo={{name: 'github', owner: 'issues'}}
        applySectionFilter={() => onSelectCallback()}
      />
    </RelayEnvironmentProvider>,
  )
}
