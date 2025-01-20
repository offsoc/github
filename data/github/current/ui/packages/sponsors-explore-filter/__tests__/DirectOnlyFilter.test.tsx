import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DirectOnlyFilter} from '../DirectOnlyFilter'
import {getDirectOnlyFilterProps} from '../test-utils/mock-data'

test('Renders the DirectOnlyFilter', () => {
  render(<DirectOnlyFilter {...getDirectOnlyFilterProps()} />)
  expect(screen.getByTestId('direct-only-checkbox')).toHaveAccessibleName('Direct dependencies only')
})

test('Sets direct dependencies only on click', () => {
  const mockSetFilter = jest.fn()
  render(<DirectOnlyFilter {...getDirectOnlyFilterProps()} setDirectOnlyFilter={mockSetFilter} />)

  const checkbox = screen.getByTestId('direct-only-checkbox')
  fireEvent.click(checkbox)

  expect(mockSetFilter.mock.calls.length).toBe(1)
  expect(mockSetFilter.mock.calls[0][0]).toStrictEqual(false)
})
