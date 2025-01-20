import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {ListItemMetadataContainer} from '../MetadataContainer'

it('renders', async () => {
  render(<ListItemMetadataContainer>Hello world</ListItemMetadataContainer>)

  const container = await screen.findByTestId('list-view-item-metadata')
  expect(container).toHaveTextContent('Hello world')
})
