import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {ListViewSectionFilterLink} from '../SectionFilterLink'

it('uses given title, URL, and count', async () => {
  render(<ListViewSectionFilterLink title="Hello world" href="/some/path" count="8,675,309" />)

  const link = await screen.findByTestId('list-view-section-filter-link')
  expect(link).toHaveAttribute('href', '/some/path')
  expect(within(link).getByText('Hello world')).toBeInTheDocument()
  expect(within(link).getByText('8,675,309')).toBeInTheDocument()
})

it('has attribute aria-current=true when selected', async () => {
  render(<ListViewSectionFilterLink title="Hello world" href="/some/path" isSelected />)

  const link = await screen.findByTestId('list-view-section-filter-link')
  expect(link).toBeInTheDocument()
  expect(link).toHaveAttribute('aria-current', 'true')
})

it('does not have aria-current attribute when not selected', async () => {
  render(<ListViewSectionFilterLink title="Hello world" href="/some/path" />)

  const link = await screen.findByTestId('list-view-section-filter-link')
  expect(link).toBeInTheDocument()
  expect(link).not.toHaveAttribute('aria-current')
})

it('allows overriding styles', () => {
  render(<ListViewSectionFilterLink title="foo" style={{color: 'darkgoldenrod'}} href="/" />)

  const link = screen.getByTestId('list-view-section-filter-link')
  expect(link).toHaveStyle('color: darkgoldenrod')
})
