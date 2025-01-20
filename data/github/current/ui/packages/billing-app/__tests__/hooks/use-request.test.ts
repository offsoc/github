import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import type {UseRequestResponse} from '../../hooks/use-request'
import useRequest from '../../hooks/use-request'
import {USAGE_ROUTE} from '../../routes'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

describe('useRequest', () => {
  test('makes an HTTP GET request to the provided route', async () => {
    const response = [{id: '1'}]
    mockFetch.mockRouteOnce('/enterprises/github-inc/billing/usage?foo=1', response)

    let onStartCalled = false
    let onSuccessCalled = false
    let onErrorCalled = false
    let result: unknown = null
    renderHook(() => {
      return useRequest({
        route: USAGE_ROUTE,
        reqParams: {foo: '1'},
        onStart: () => (onStartCalled = true),
        onSuccess: r => {
          onSuccessCalled = true
          result = r.data
        },
        onError: () => (onErrorCalled = true),
      })
    })

    await waitFor(() => expect(onStartCalled).toBe(true))
    await waitFor(() => expect(onSuccessCalled).toBe(true))
    await waitFor(() => expect(onErrorCalled).toBe(false))
    await waitFor(() => expect(result).toEqual(response))
  })

  test('calls the onError callback when the response has an error status code', async () => {
    const response = {message: 'Something went wrong'}
    mockFetch.mockRouteOnce('/enterprises/github-inc/billing/usage?foo=1', response, {
      ok: false,
      status: 500,
    })

    let onStartCalled = false
    let onSuccessCalled = false
    let onErrorCalled = false
    let result: unknown = null
    renderHook(() => {
      return useRequest({
        route: USAGE_ROUTE,
        reqParams: {foo: '1'},
        onStart: () => (onStartCalled = true),
        onSuccess: () => (onSuccessCalled = true),
        onError: r => {
          result = (r as UseRequestResponse).data
          onErrorCalled = true
        },
      })
    })

    await waitFor(() => expect(onStartCalled).toBe(true))
    await waitFor(() => expect(onSuccessCalled).toBe(false))
    await waitFor(() => expect(onErrorCalled).toBe(true))
    await waitFor(() => expect(result).toEqual(response))
  })
})
