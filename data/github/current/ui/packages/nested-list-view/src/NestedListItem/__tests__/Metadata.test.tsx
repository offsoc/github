import {render} from '@github-ui/react-core/test-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {screen} from '@testing-library/react'

import {NestedListItemMetadata} from '../Metadata'

describe('NestedListItemMetadata', () => {
  it('renders to the right when specified', () => {
    render(<NestedListItemMetadata alignment="right">What a lovely day</NestedListItemMetadata>)

    const item = screen.getByTestId('nested-list-view-item-metadata-item')
    expect(item).toHaveTextContent('What a lovely day')
  })

  it('uses the given testid', () => {
    render(<NestedListItemMetadata {...testIdProps('my-item')}>Goodnight, moon</NestedListItemMetadata>)

    const item = screen.getByTestId('my-item')
    expect(item).toHaveTextContent('Goodnight, moon')
  })

  it('renders with custom `sx` styling', () => {
    render(
      <NestedListItemMetadata sx={{color: 'paleturquoise'}} variant="secondary">
        Roll for initiative
      </NestedListItemMetadata>,
    )

    const item = screen.getByTestId('nested-list-view-item-metadata-item')
    expect(item).toHaveStyle('color: paleturquoise') // custom styling
    expect(item).toHaveTextContent('Roll for initiative')
  })
})
