import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {NestedListItemDescriptionProvider} from '../context/DescriptionContext'
import {NestedListItemDescription} from '../Description'

function renderDescription(props: ComponentProps<typeof NestedListItemDescription>) {
  return render(
    <NestedListItemDescriptionProvider>
      <NestedListItemDescription {...props} />
    </NestedListItemDescriptionProvider>,
  )
}

describe('NestedListItemDescription', () => {
  it('renders with children', () => {
    renderDescription({children: <a href="/my-url">foo</a>})

    const description = screen.getByTestId('nested-list-view-item-description')
    expect(within(description).getByRole('link', {name: 'foo'})).toHaveAttribute('href', '/my-url')
  })

  it('renders custom `sx` styling', () => {
    renderDescription({sx: {fontWeight: 'bold'}})

    const description = screen.getByTestId('nested-list-view-item-description')
    expect(description).toHaveStyle('font-weight: 600') // custom styling
  })
})
