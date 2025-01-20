import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Actors} from '../routes/Actors'
import {getActorsPayload} from '../test-utils/mock-data'

test('Renders api insights actors page', async () => {
  const routePayload = getActorsPayload()
  const {
    actor_stats: {request_count, rate_limited_request_count, current_limit},
  } = routePayload
  render(<Actors />, {
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

test('Renders api insights actors page with breadcrumb', async () => {
  const routePayload = getActorsPayload()
  const {
    breadcrumb: {username, api_insights_base_url},
  } = routePayload
  render(<Actors />, {
    routePayload,
  })
  const breadcrumb = screen.getByRole('navigation', {name: 'Breadcrumbs'})
  expect(breadcrumb).toBeInTheDocument()
  expect(breadcrumb).toHaveTextContent('API')
  expect(breadcrumb).toHaveTextContent(`@${username}`)

  expect(within(breadcrumb).getByRole('link', {name: 'API'})).toHaveAttribute('href', api_insights_base_url)
})

test('Renders api insights actors page with requests chart', async () => {
  const routePayload = getActorsPayload()
  render(<Actors />, {
    routePayload,
  })
  const chart = await screen.findByTestId('chart-card')
  expect(chart).toBeInTheDocument()
  expect(within(chart).getByRole('heading')).toHaveTextContent('Amount of requests')
})

test('Renders api insights actors page with requests table', async () => {
  const routePayload = getActorsPayload()
  render(<Actors />, {
    routePayload,
  })
  const requestsTable = screen.getByRole('table')
  expect(requestsTable).toBeInTheDocument()

  const pagination = screen.getByRole('navigation', {name: 'Pagination for actors'})
  expect(pagination).toBeInTheDocument()
})
