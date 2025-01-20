import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ApiInsights} from '../routes/ApiInsights'
import {getApiInsightsRoutePayload} from '../test-utils/mock-data'

test('Renders api insights org summary page', async () => {
  const routePayload = getApiInsightsRoutePayload()
  const {
    summary_stats: {request_count, rate_limited_request_count},
  } = routePayload
  render(<ApiInsights />, {
    routePayload,
  })
  const header = await screen.findByTestId('api-insights-header')
  expect(header).toHaveTextContent('API Insights')
  const totalRequests = screen.getByTestId('total-requests')
  expect(totalRequests).toHaveTextContent(request_count)
  const rateLimitedRequests = await screen.findByTestId('rate-limited-requests')
  expect(rateLimitedRequests).toHaveTextContent(rate_limited_request_count)
})

test('Renders api insights users page with requests chart', async () => {
  const routePayload = getApiInsightsRoutePayload()
  render(<ApiInsights />, {
    routePayload,
  })
  const chart = await screen.findByTestId('chart-card')
  expect(chart).toBeInTheDocument()
  expect(within(chart).getByRole('heading')).toHaveTextContent('Amount of requests')
})

test('Renders api insights users page with requests table', async () => {
  const routePayload = getApiInsightsRoutePayload()
  render(<ApiInsights />, {
    routePayload,
  })
  const requestsTable = screen.getByRole('table')
  expect(requestsTable).toBeInTheDocument()

  const pagination = screen.getByRole('navigation', {name: 'Pagination for actors'})
  expect(pagination).toBeInTheDocument()
})
