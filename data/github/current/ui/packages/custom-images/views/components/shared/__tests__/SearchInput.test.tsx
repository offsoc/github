import {screen, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SearchInput from '../SearchInput'

describe('SearchInput', () => {
  const mockOnSetSearchQuery = jest.fn()

  const renderSearchInput = () => {
    render(<SearchInput onSetSearchQuery={mockOnSetSearchQuery} />)
  }

  test('renders search input correctly', () => {
    renderSearchInput()

    const inputEl = screen.getByPlaceholderText('Search custom images')
    expect(inputEl).toBeInTheDocument()
    expect(inputEl).toHaveAttribute('type', 'text')
  })

  test('calls onSetSearchQuery when input changes', () => {
    renderSearchInput()

    const inputEl = screen.getByPlaceholderText('Search custom images')
    fireEvent.change(inputEl, {target: {value: 'test query'}})

    expect(mockOnSetSearchQuery).toHaveBeenCalledWith('test query')
  })
})
