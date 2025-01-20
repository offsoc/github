import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {OrderingFilter} from '../OrderingFilter'
import {getOrderingFilterProps} from '../test-utils/mock-data'

test('Renders the OrderingFilter', () => {
  render(<OrderingFilter {...getOrderingFilterProps()} />)
  expect(screen.getByTestId('ordering-button')).toHaveTextContent('Most used')
})

test('Sets new ordering on select', () => {
  const mockSetFilter = jest.fn()
  render(<OrderingFilter {...getOrderingFilterProps()} setOrderingFilter={mockSetFilter} />)

  const menuButton = screen.getByTestId('ordering-button')
  fireEvent.click(menuButton)

  const orderingListItem = screen.getByTestId('ordering-LEAST_USED')
  fireEvent.click(orderingListItem)

  expect(mockSetFilter.mock.calls.length).toBe(1)
  expect(mockSetFilter.mock.calls[0][0]).toStrictEqual('LEAST_USED')
})
