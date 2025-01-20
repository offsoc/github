import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {NestedListItemTrailingBadge, type NestedListItemTrailingBadgeProps} from '../TrailingBadge'

describe('NestedListItemTrailingBadge', () => {
  it('displays given title', () => {
    renderTrailingBadge({title: 'test title'})

    const trailingBadge = screen.getByTestId('nested-list-view-item-trailing-badge')
    expect(trailingBadge).toBeInTheDocument()
  })
})

const renderTrailingBadge = ({...args}: NestedListItemTrailingBadgeProps) => {
  return render(<NestedListItemTrailingBadge {...args} />)
}
