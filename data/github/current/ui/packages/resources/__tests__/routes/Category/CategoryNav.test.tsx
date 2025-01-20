import {render, screen} from '@testing-library/react'
import {CategoryNav} from '../../../routes/Category/CategoryNav'
import {Topics} from '../../../lib/types/utils/topics'

describe('CategoryNav', () => {
  it('renders the heading', () => {
    render(<CategoryNav activeCategory="" />)
    const heading = screen.getByRole('heading', {name: 'Topics'})
    expect(heading).toBeInTheDocument()
  })

  it('renders all topics as navigation items', () => {
    render(<CategoryNav activeCategory="" />)
    const navItems = screen.getAllByRole('listitem')
    expect(navItems).toHaveLength(Object.keys(Topics).length)
  })

  it('applies the selected class to the active category', () => {
    const activeCategory = 'Security'
    render(<CategoryNav activeCategory={activeCategory} />)
    const selectedNavItem = screen.getByRole('link', {name: activeCategory})
    expect(selectedNavItem).toHaveClass('navListItemSelected')
    expect(selectedNavItem).toHaveAttribute('aria-current', 'page')
  })
})
