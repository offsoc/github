import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {NestedListItemMetadataContainer} from '../MetadataContainer'

describe('NestedListItemMetadataContainer', () => {
  it('renders', async () => {
    render(<NestedListItemMetadataContainer>Hello world</NestedListItemMetadataContainer>)

    const container = await screen.findByTestId('nested-list-view-item-metadata')
    expect(container).toHaveTextContent('Hello world')
  })
})
