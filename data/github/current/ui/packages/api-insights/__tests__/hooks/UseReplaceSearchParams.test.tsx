import {useReplaceSearchParams} from '../../hooks/UseReplaceSearchParams'
import {screen} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {getPageParamsPayload} from '../../test-utils/mock-data'

beforeAll(() => {
  performance.clearResourceTimings = jest.fn()
  performance.mark = jest.fn()
})

const TestButton = ({queryParam, value}: {queryParam: string; value: string}) => {
  const {searchParams, replaceSearchParams} = useReplaceSearchParams()
  return <button onClick={() => replaceSearchParams(queryParam, value)}>{searchParams.toString()}</button>
}

test('updates the query param and makes search params available', async () => {
  const {user} = render(<TestButton queryParam="foo" value="bar" />, {
    pathname: '/donut',
    search: '?foo=baz&a=b',
  })
  const button = screen.getByRole('button')

  expect(RouteContext.location?.pathname).toEqual('/donut')
  expect(RouteContext.location?.search).toEqual('?foo=baz&a=b')

  expect(button).toHaveTextContent('foo=baz&a=b')

  await user.click(button)

  expect(RouteContext.location?.pathname).toEqual('/donut')
  expect(RouteContext.location?.search).toEqual('?foo=bar&a=b')
})

test('uses validated search params if available', async () => {
  const {user} = render(<TestButton queryParam="type" value="all" />, {
    pathname: '/api-insights',
    search: '?foo=baz&a=b',
    routePayload: getPageParamsPayload(),
  })
  const button = screen.getByRole('button')

  expect(RouteContext.location?.pathname).toEqual('/api-insights')
  expect(RouteContext.location?.search).toEqual('?foo=baz&a=b')

  expect(button).toHaveTextContent(
    'q=foo&p=2&n=asc&tr=asc&rlr=asc&lrl=asc&period=7d&interval=3h&type=apps&requests=rate&t=UTC',
  )

  await user.click(button)

  expect(RouteContext.location?.pathname).toEqual('/api-insights')
  expect(RouteContext.location?.search).toEqual(
    '?q=foo&p=2&n=asc&tr=asc&rlr=asc&lrl=asc&period=7d&interval=3h&type=all&requests=rate&t=UTC',
  )
})
