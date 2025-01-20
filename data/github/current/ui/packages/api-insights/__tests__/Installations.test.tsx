import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getInstallationsPayload} from '../test-utils/mock-data'
import {Installations} from '../routes/Installations'

test('Renders api insights installations page', async () => {
  const routePayload = getInstallationsPayload()
  const {
    installation_stats: {request_count, rate_limited_request_count, current_limit},
  } = routePayload
  render(<Installations />, {
    routePayload,
  })
  const header = await screen.findByTestId('api-insights-header')
  expect(header).toHaveTextContent('API Insights')
  const totalRequests = screen.getByTestId('total-requests')
  expect(totalRequests).toHaveTextContent(request_count)
  const rateLimitedRequests = await screen.findByTestId('rate-limited-requests')
  expect(rateLimitedRequests).toHaveTextContent(rate_limited_request_count)
  const currentLimit = await screen.findByTestId('current-limit')
  expect(currentLimit).toHaveTextContent(current_limit)
})

test('Renders api insights installations page with breadcrumb', async () => {
  const routePayload = getInstallationsPayload()
  const {
    breadcrumb: {name, api_insights_base_url},
  } = routePayload
  render(<Installations />, {
    routePayload,
  })
  const breadcrumb = screen.getByRole('navigation', {name: 'Breadcrumbs'})
  expect(breadcrumb).toBeInTheDocument()
  expect(breadcrumb).toHaveTextContent('API')
  expect(breadcrumb).toHaveTextContent(name)

  expect(within(breadcrumb).getByRole('link', {name: 'API'})).toHaveAttribute('href', api_insights_base_url)
})

test('Renders api insights installations page with requests chart', async () => {
  const routePayload = getInstallationsPayload()
  render(<Installations />, {
    routePayload,
  })
  const chart = await screen.findByTestId('chart-card')
  expect(chart).toBeInTheDocument()
  expect(within(chart).getByRole('heading')).toHaveTextContent('Amount of requests')
})

test('Renders api insights installations page with routes table', async () => {
  const routePayload = getInstallationsPayload()
  render(<Installations />, {
    routePayload,
  })
  const requestsTable = screen.getByRole('table')
  expect(requestsTable).toBeInTheDocument()

  const pagination = screen.getByRole('navigation', {name: 'Pagination for routes'})
  expect(pagination).toBeInTheDocument()
})
