import {render} from '@github-ui/react-core/test-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {screen} from '@testing-library/react'

import {ListItemMetadata} from '../Metadata'

it('renders', () => {
  render(<ListItemMetadata>Hello world</ListItemMetadata>)

  const item = screen.getByTestId('list-view-item-metadata-item')
  expect(item).toHaveTextContent('Hello world')
})

it('uses the given testid', () => {
  render(<ListItemMetadata {...testIdProps('my-item')}>Goodnight, moon</ListItemMetadata>)

  const item = screen.getByTestId('my-item')
  expect(item).toHaveTextContent('Goodnight, moon')
})

it('applies custom styling', () => {
  render(
    <ListItemMetadata style={{color: 'paleturquoise'}} variant="secondary">
      Roll for initiative
    </ListItemMetadata>,
  )

  const item = screen.getByTestId('list-view-item-metadata-item')
  expect(item).toHaveStyle('color: paleturquoise')
  expect(item).toHaveTextContent('Roll for initiative')
})
