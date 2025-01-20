import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Users} from '../routes/Users'
import {getUsersPayload} from '../test-utils/mock-data'

test('Renders api insights users page', async () => {
  const routePayload = getUsersPayload()
  const {
    user_stats: {request_count, rate_limited_request_count, current_limit},
  } = routePayload
  render(<Users />, {
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

test('Renders api insights users page with breadcrumb', async () => {
  const routePayload = getUsersPayload()
  const {
    breadcrumb: {username, api_insights_base_url},
  } = routePayload
  render(<Users />, {
    routePayload,
  })
  const breadcrumb = screen.getByRole('navigation', {name: 'Breadcrumbs'})
  expect(breadcrumb).toBeInTheDocument()
  expect(breadcrumb).toHaveTextContent('API')
  expect(breadcrumb).toHaveTextContent(`@${username}`)

  expect(within(breadcrumb).getByRole('link', {name: 'API'})).toHaveAttribute('href', api_insights_base_url)
})

test('Renders api insights users page with requests chart', async () => {
  const routePayload = getUsersPayload()
  render(<Users />, {
    routePayload,
  })
  const chart = await screen.findByTestId('chart-card')
  expect(chart).toBeInTheDocument()
  expect(within(chart).getByRole('heading')).toHaveTextContent('Amount of requests')
})

test('Renders api insights users page with requests table', async () => {
  const routePayload = getUsersPayload()
  render(<Users />, {
    routePayload,
  })
  const requestsTable = screen.getByRole('table')
  expect(requestsTable).toBeInTheDocument()

  const pagination = screen.getByRole('navigation', {name: 'Pagination for actors'})
  expect(pagination).toBeInTheDocument()
})
