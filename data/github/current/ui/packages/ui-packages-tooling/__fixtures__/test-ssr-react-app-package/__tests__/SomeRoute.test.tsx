import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SomeRoute} from '../routes/SomeRoute'
import {getSomeRouteRoutePayload} from '../test-utils/mock-data'

test('Renders the SomeRoute', () => {
  const routePayload = getSomeRouteRoutePayload()
  render(<SomeRoute />, {
    routePayload,
  })
  expect(screen.getByRole('article')).toHaveTextContent(routePayload.someField)
})
