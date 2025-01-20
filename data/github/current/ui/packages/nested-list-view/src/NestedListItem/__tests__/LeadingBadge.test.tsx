import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {NestedListItemLeadingBadgeProvider} from '../context/LeadingBadgeContext'
import {NestedListItemLeadingBadge, type NestedListItemLeadingBadgeProps} from '../LeadingBadge'

describe('NestedListItemLeadingBadge', () => {
  it('displays given title', () => {
    renderNestedLeadingBadge({title: 'Issue Type'})

    const container = screen.getByTestId('nested-list-view-item-leading-badge')
    expect(container).toBeInTheDocument()

    // Check that the ":" exists to ensure the screen reader pauses while reading the badge
    expect(container.textContent).toBe('Issue Type: ')
  })

  it('renders with custom `sx` styling', () => {
    renderNestedLeadingBadge({title: 'all right then', containerSx: {backgroundColor: '#ff00ff'}})

    const container = screen.getByTestId('nested-list-view-item-leading-badge')
    expect(container).toHaveStyle('background-color: #ff00ff') // custom styling
    const text = within(container).getByText('all right then')
    expect(text).toBeVisible()
  })

  it('applies given properties to the Label', () => {
    renderNestedLeadingBadge({title: 'some title', size: 'large', variant: 'sponsors'})

    const container = screen.getByTestId('nested-list-view-item-leading-badge')
    const label = within(container).getByTestId('nested-list-view-item-leading-badge-label')
    expect(label).toHaveStyle('color: var(--fgColor-sponsors,var(--color-sponsors-fg,#bf3989))') // variant=sponsors
    expect(label).toHaveStyle('height: 24px') // size=large
    const text = within(container).getByText('some title')
    expect(text).toBeVisible()
  })

  const renderNestedLeadingBadge = ({...args}: NestedListItemLeadingBadgeProps) => {
    return render(
      <NestedListItemLeadingBadgeProvider>
        <NestedListItemLeadingBadge {...args} />
      </NestedListItemLeadingBadgeProvider>,
    )
  }
})
