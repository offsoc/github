import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {SimpleListItem} from '../SimpleListItem'
import {SimpleListView} from '../SimpleListView'

it('renders the SimpleListView', () => {
  const message = 'Hello React!'
  render(
    <SimpleListView title={message}>
      <SimpleListItem title={message} description="Some description" />
    </SimpleListView>,
  )
  expect(screen.getByRole('heading')).toHaveTextContent(message)
})
