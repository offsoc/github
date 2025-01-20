import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AccountFilter} from '../AccountFilter'
import {getAccountFilterProps} from '../test-utils/mock-data'

test('Renders the AccountFilter', () => {
  render(<AccountFilter {...getAccountFilterProps()} />)
  expect(screen.getByTestId('account-button')).toHaveTextContent('monalisa')
})

test('Sets new account on select', () => {
  const mockSetFilter = jest.fn()
  render(<AccountFilter {...getAccountFilterProps()} setAccountFilter={mockSetFilter} />)

  const menuButton = screen.getByTestId('account-button')
  fireEvent.click(menuButton)

  const accountListItem = screen.getByTestId('account-github')
  fireEvent.click(accountListItem)

  expect(mockSetFilter.mock.calls.length).toBe(1)
  expect(mockSetFilter.mock.calls[0][0]).toStrictEqual('github')
})
