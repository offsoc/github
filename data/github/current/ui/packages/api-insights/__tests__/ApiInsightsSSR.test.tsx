/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getApiInsightsRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders ApiInsights with SSR', async () => {
  const routePayload = getApiInsightsRoutePayload()
  const {
    summary_stats: {request_count, rate_limited_request_count},
  } = routePayload
  const view = await serverRenderReact({
    name: 'api-insights',
    path: '/orgs/:org/insights/api',
    data: {payload: routePayload},
  })

  expect(view).toMatch('API Insights')
  expect(view).toMatch(request_count)
  expect(view).toMatch(rate_limited_request_count)
})
