import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {CursorPagination} from '../CursorPagination'

describe('CursorPagination', () => {
  test('renders disabled buttons without cursor inputs', () => {
    render(<CursorPagination onPageChange={() => {}} />)
    expect(screen.getByRole('button', {name: 'Previous'})).toBeDisabled()
    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled()
  })

  test('renders enabled next button if nextCursor provided', () => {
    render(<CursorPagination nextCursor="foo" onPageChange={() => {}} />)
    expect(screen.getByRole('button', {name: 'Previous'})).toBeDisabled()
    expect(screen.getByRole('button', {name: 'Next'})).toBeEnabled()
  })

  test('renders enabled previous button if previousCursor provided', () => {
    render(<CursorPagination previousCursor="foo" onPageChange={() => {}} />)
    expect(screen.getByRole('button', {name: 'Previous'})).toBeEnabled()
    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled()
  })

  test('renders enabled previous and next buttons if both cursor inputs provided', () => {
    render(<CursorPagination previousCursor="foo" nextCursor="bar" onPageChange={() => {}} />)
    expect(screen.getByRole('button', {name: 'Previous'})).toBeEnabled()
    expect(screen.getByRole('button', {name: 'Next'})).toBeEnabled()
  })

  test('calls onPageChange on click', () => {
    const pageChange = jest.fn()
    render(<CursorPagination previousCursor="foo" nextCursor="bar" onPageChange={pageChange} />)
    act(() => screen.getByRole('button', {name: 'Previous'})?.click())
    expect(pageChange).toHaveBeenCalledWith('foo')
    act(() => screen.getByRole('button', {name: 'Next'})?.click())
    expect(pageChange).toHaveBeenCalledWith('bar')
  })
})
