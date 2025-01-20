import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {Index} from '../routes/Index'
import {getIndexRoutePayload} from '../test-utils/mock-data'

test('Renders the Index page', () => {
  const routePayload = getIndexRoutePayload()
  render(<Index />, {
    routePayload,
  })
  expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Enhance your workflow with extensions')
})
