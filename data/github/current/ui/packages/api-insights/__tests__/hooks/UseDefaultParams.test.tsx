import {screen} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {useDefaultParams} from '../../hooks/UseDefaultParams'
import {getPageParamsPayload} from '../../test-utils/mock-data'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

beforeAll(() => {
  performance.clearResourceTimings = jest.fn()
  performance.mark = jest.fn()
})

const TestButton = () => {
  const {setDefaultParams} = useDefaultParams()
  return <button onClick={() => setDefaultParams()} />
}

test('does not blow up if validated query params are not provided', async () => {
  const {user} = render(<TestButton />, {pathname: '/donut', search: '?foo=baz&a=b'})
  const button = screen.getByRole('button')

  expect(RouteContext.location?.pathname).toEqual('/donut')
  expect(RouteContext.location?.search).toEqual('?foo=baz&a=b')

  await user.click(button)

  expect(RouteContext.location?.pathname).toEqual('/donut')
  expect(RouteContext.location?.search).toEqual('?foo=baz&a=b')
})

test('replaces current url if validated search params if available', async () => {
  const {user} = render(<TestButton />, {
    pathname: '/api-insights',
    search: '?foo=baz&a=b',
    routePayload: getPageParamsPayload(),
  })
  const button = screen.getByRole('button')

  expect(RouteContext.location?.pathname).toEqual('/api-insights')
  expect(RouteContext.location?.search).toEqual('?foo=baz&a=b')

  await user.click(button)

  expect(RouteContext.location?.pathname).toEqual('/api-insights')
  expect(ssrSafeLocation?.search).toEqual(
    '?q=foo&p=2&n=asc&tr=asc&rlr=asc&lrl=asc&period=7d&interval=3h&type=apps&requests=rate&t=UTC',
  )
})
