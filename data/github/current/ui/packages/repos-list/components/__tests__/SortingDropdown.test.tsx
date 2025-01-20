import {render, type User} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {SortingDropdown} from '../SortingDropdown'

describe('SortingDropdown', () => {
  it('renders default ordering', async () => {
    const {user} = render(<SortingDropdown sortingItemSelected="" onSortingItemSelect={jest.fn()} />)

    expect(screen.getByRole('button', {name: 'Sort by Last pushed descending'})).toBeInTheDocument()

    await openDropdown(user)

    const menuItems = screen.getAllByRole('menuitemradio')
    expect(menuItems).toHaveLength(5)

    const [lastUpdatedItem, nameItem, starsItem, ascendingItem, descendingItem] = menuItems

    expect(lastUpdatedItem).toHaveTextContent('Last pushed')
    expect(lastUpdatedItem).toBeChecked()
    expect(nameItem).toHaveTextContent('Name')
    expect(nameItem).not.toBeChecked()
    expect(starsItem).toHaveTextContent('Stars')
    expect(starsItem).not.toBeChecked()

    expect(ascendingItem).toHaveTextContent('Ascending')
    expect(ascendingItem).not.toBeChecked()
    expect(descendingItem).toHaveTextContent('Descending')
    expect(descendingItem).toBeChecked()
  })

  it('renders other ordering', () => {
    render(<SortingDropdown sortingItemSelected="license" onSortingItemSelect={jest.fn()} />)

    expect(screen.getByRole('button', {name: 'Sort by license descending'})).toBeInTheDocument()
  })

  it('renders orderings with hyphens', async () => {
    const mockSelected = jest.fn()
    const {user} = render(
      <SortingDropdown sortingItemSelected="help-wanted-issue-asc" onSortingItemSelect={mockSelected} />,
    )

    expect(screen.getByRole('button', {name: 'Sort by help-wanted-issue ascending'})).toBeInTheDocument()

    await openDropdown(user)
    await clickMenuItem(user, 'Descending')

    expect(mockSelected).toHaveBeenCalledWith('help-wanted-issue')
  })

  it('renders custom ordering', async () => {
    const {user} = render(<SortingDropdown sortingItemSelected="name-asc" onSortingItemSelect={jest.fn()} />)

    expect(screen.getByRole('button', {name: 'Sort by Name ascending'})).toBeInTheDocument()

    await openDropdown(user)

    const menuItems = screen.getAllByRole('menuitemradio')
    expect(menuItems).toHaveLength(5)

    const [lastUpdatedItem, nameItem, starsItem, ascendingItem, descendingItem] = menuItems

    expect(lastUpdatedItem).toHaveTextContent('Last pushed')
    expect(lastUpdatedItem).not.toBeChecked()
    expect(nameItem).toHaveTextContent('Name')
    expect(nameItem).toBeChecked()
    expect(starsItem).toHaveTextContent('Stars')
    expect(starsItem).not.toBeChecked()

    expect(ascendingItem).toHaveTextContent('Ascending')
    expect(ascendingItem).toBeChecked()
    expect(descendingItem).toHaveTextContent('Descending')
    expect(descendingItem).not.toBeChecked()
  })

  it('updates sorting field', async () => {
    const mockSelected = jest.fn()
    const {user} = render(<SortingDropdown sortingItemSelected="" onSortingItemSelect={mockSelected} />)

    await openDropdown(user)
    await clickMenuItem(user, 'Name')

    expect(mockSelected).toHaveBeenCalledWith('name-asc')
  })

  it('updates sorting direction', async () => {
    const mockSelected = jest.fn()
    const {user} = render(<SortingDropdown sortingItemSelected="" onSortingItemSelect={mockSelected} />)

    await openDropdown(user)
    await clickMenuItem(user, 'Ascending')

    expect(mockSelected).toHaveBeenCalledWith('updated-asc')

    await openDropdown(user)
    await clickMenuItem(user, 'Descending')

    expect(mockSelected).toHaveBeenCalledWith('') // Default sort
  })
})

async function openDropdown(user: User) {
  await user.click(screen.getByRole('button'))
}

async function clickMenuItem(user: User, name: string) {
  await user.click(screen.getByRole('menuitemradio', {name}))
}
