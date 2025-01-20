import {Route, Routes} from 'react-router-dom'
import {screen, fireEvent} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {ShowPage} from '../Show'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {SandboxLayout} from '../../SandboxLayout'

test('Renders the show page at the URL', async () => {
  render(
    <Routes>
      <Route path="/_react_sandbox/:sandbox_id" element={<ShowPage />} />
    </Routes>,
    {
      routePayload: 'payload',
      pathname: '/_react_sandbox/123',
      routes: [
        jsonRoute({
          path: '/_react_sandbox/:sandbox_id',
          Component: () => null,
        }),
      ],
      wrapper: SandboxLayout,
    },
  )

  expect(RouteContext.location?.pathname).toBe('/_react_sandbox/123')
  expect(screen.getByRole('heading')).toHaveTextContent('React sandbox show page (sandbox ID: 123)')

  // eslint-disable-next-line testing-library/no-node-access
  fireEvent.click(screen.getByText('Show 1').closest('a')!)

  expect(RouteContext.location?.pathname).toBe('/_react_sandbox/1')
  expect(screen.getByRole('heading')).toHaveTextContent('React sandbox show page (sandbox ID: 1)')
})
