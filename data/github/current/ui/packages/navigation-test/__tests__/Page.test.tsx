import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Page} from '../routes/Page'
import {getPageRoutePayload} from '../test-utils/mock-data'

test('Renders the Page', () => {
  const routePayload = getPageRoutePayload()
  render(<Page />, {
    routePayload,
  })
  expect(screen.getByTestId('payload')).toHaveTextContent(routePayload.someField)
})
