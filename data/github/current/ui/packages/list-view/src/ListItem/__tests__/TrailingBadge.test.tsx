import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {ListItemTrailingBadge, type ListItemTrailingBadgeProps} from '../TrailingBadge'

it('displays given title', () => {
  renderTrailingBadge({title: 'test title'})

  const trailingBadge = screen.getByTestId('list-view-item-trailing-badge')
  expect(trailingBadge).toBeInTheDocument()
})

const renderTrailingBadge = ({...args}: ListItemTrailingBadgeProps) => {
  return render(<ListItemTrailingBadge {...args} />)
}
