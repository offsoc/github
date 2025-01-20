import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {ListViewSectionFilterLink} from '../SectionFilterLink'
import {ListViewSectionFilters} from '../SectionFilters'

it('does not render when no links are given', () => {
  render(<ListViewSectionFilters links={[]} />)
  expect(screen.queryByTestId('list-view-section-filters')).not.toBeInTheDocument()
})

it('renders given links in a list', () => {
  render(
    <ListViewSectionFilters
      links={[
        <ListViewSectionFilterLink key="first" title="Foo" href="/foo" />,
        <ListViewSectionFilterLink isSelected key="second" title="Bar" href="/bar" />,
      ]}
    />,
  )

  const container = screen.getByTestId('list-view-section-filters')
  expect(container).toBeInTheDocument()
  const list = within(container).getByRole('list')

  const listItem1 = within(list).getByTestId('list-view-section-filter-0')
  const link1 = within(listItem1).getByRole('link')
  expect(link1).toHaveAttribute('href', '/foo')
  expect(link1).not.toHaveAttribute('aria-current')
  expect(within(link1).getByText('Foo')).toBeInTheDocument()

  const listItem2 = within(list).getByTestId('list-view-section-filter-1')
  const link2 = within(listItem2).getByRole('link')
  expect(link2).toHaveAttribute('href', '/bar')
  expect(link2).toHaveAttribute('aria-current', 'true')
  expect(within(link2).getByText('Bar')).toBeInTheDocument()
})
