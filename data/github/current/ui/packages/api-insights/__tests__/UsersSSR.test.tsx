/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getUsersPayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders api insights users with SSR', async () => {
  const routePayload = getUsersPayload()
  const {
    user_stats: {request_count, rate_limited_request_count, current_limit},
  } = routePayload
  const view = await serverRenderReact({
    name: 'api-insights',
    path: '/orgs/:org/insights/api/users/:user',
    data: {payload: routePayload},
  })

  expect(view).toMatch('API Insights')
  expect(view).toMatch(request_count)
  expect(view).toMatch(rate_limited_request_count)
  expect(view).toMatch(current_limit)
})
