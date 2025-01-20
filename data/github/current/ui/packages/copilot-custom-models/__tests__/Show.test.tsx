import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Show} from '../routes/Show/Page'
import {getShowRoutePayload} from '../test-utils/mock-data'

// <Banner /> is experimental and has some console errors
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation()
})

test('Renders the CustomModels', () => {
  const routePayload = getShowRoutePayload()
  render(<Show />, {routePayload})

  const {organization} = routePayload

  expect(screen.getByRole('button', {name: 'Cancel training'})).toBeInTheDocument()

  const title = `Training run for ${organization.slug} model`
  expect(screen.getByText(title)).toBeInTheDocument()
})

test('shows relative createdAt when createdAt present', async () => {
  const routePayload = getShowRoutePayload()
  const nowDate = new Date()
  const oneHourAgo = new Date(nowDate.setHours(nowDate.getHours() - 1))
  routePayload.pipelineDetails.createdAt = oneHourAgo.toString()

  render(<Show />, {
    routePayload: {
      ...routePayload,
      withinRateLimit: true,
    },
  })

  expect(await screen.findByText('Created about 1 hour ago by')).toBeVisible()
})

test('shows generic message when createdAt not present', async () => {
  const routePayload = getShowRoutePayload()
  routePayload.pipelineDetails.createdAt = ''

  render(<Show />, {
    routePayload: {
      ...routePayload,
      withinRateLimit: true,
    },
  })

  expect(await screen.findByText('Created by')).toBeVisible()
})
