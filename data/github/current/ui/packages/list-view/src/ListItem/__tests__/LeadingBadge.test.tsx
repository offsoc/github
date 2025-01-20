import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {ListItemLeadingBadge, type ListItemLeadingBadgeProps} from '../LeadingBadge'
import {LeadingBadgeProvider} from '../LeadingBadgeContext'

it('displays given title', () => {
  renderLeadingBadge({title: 'Issue Type'})

  const container = screen.getByTestId('list-view-item-leading-badge')
  expect(container).toBeInTheDocument()

  // Check that the ":" exists to ensure the screen reader pauses while reading the badge
  expect(container.textContent).toBe('Issue Type: ')
})

it('applies custom styling to the container', () => {
  renderLeadingBadge({title: 'all right then', containerStyle: {backgroundColor: '#ff00ff'}})

  const container = screen.getByTestId('list-view-item-leading-badge')
  expect(container).toHaveStyle('background-color: #ff00ff') // custom styling
  const text = within(container).getByText('all right then')
  expect(text).toBeVisible()
})

it('applies given properties to the Label', () => {
  renderLeadingBadge({title: 'some title', size: 'large', variant: 'sponsors'})

  const container = screen.getByTestId('list-view-item-leading-badge')
  const label = within(container).getByTestId('list-view-item-leading-badge-label')
  expect(label).toHaveStyle('color: var(--fgColor-sponsors,var(--color-sponsors-fg,#bf3989))') // variant=sponsors
  expect(label).toHaveStyle('height: 24px') // size=large
  const text = within(container).getByText('some title')
  expect(text).toBeVisible()
})

const renderLeadingBadge = ({...args}: ListItemLeadingBadgeProps) => {
  return render(
    <LeadingBadgeProvider>
      <ListItemLeadingBadge {...args} />
    </LeadingBadgeProvider>,
  )
}
