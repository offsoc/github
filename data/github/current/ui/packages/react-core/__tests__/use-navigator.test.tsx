import {renderHook, act} from '@testing-library/react'
import {Action} from '@remix-run/router'
import {jsonRoute} from '../JsonRoute'
import {mockFetch} from '@github-ui/mock-fetch'
import {useNavigator} from '../use-navigator'

// jsdom doesn't support window.performance so we have to mock it
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByName: () => [],
    mark: jest.fn(),
    measure: jest.fn(),
    clearResourceTimings: jest.fn(),
  },
})

// eslint-disable-next-line compat/compat
window.requestIdleCallback = jest.fn()

function buildLocation(pathname: string, key: string) {
  return {pathname, search: '', hash: '', state: null, key}
}

const blueHomeInitData = {
  initialLocation: buildLocation('/home', 'h1'),
  appName: 'my-app',
  embeddedData: {payload: {color: 'blue'}, appPayload: {helpUrl: 'https://help.github.com'}},
  routes: [
    jsonRoute({path: '/home', Component: () => null}),
    jsonRoute({path: '/about', Component: () => null}),
    jsonRoute({path: '/will-fail', Component: () => null}),
    jsonRoute({path: '/pass-error', Component: () => null, shouldNavigateOnError: true}),
  ],
}

describe('useNavigator', () => {
  it('gets initial payload', () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))

    const [{appPayload, location, routeStateMap}] = result.current
    expect(appPayload).toEqual({helpUrl: 'https://help.github.com'})
    expect(location.pathname).toBe('/home')
    expect((routeStateMap['h1']!.data as {payload: unknown}).payload).toEqual({color: 'blue'})
  })

  it('fetches the new page payload on navigation', async () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))
    const [{location}, {handleHistoryUpdate}] = result.current
    expect(location.pathname).toBe('/home')

    // We need 2 steps to simulate navigation: update window.location, and then trigger handleHistoryUpdate
    history.pushState({}, '', '/about')
    await act(() => handleHistoryUpdate({location: buildLocation('/about', 'a1'), action: Action.Push, delta: 1}))

    const [{location: loadingLocation, isLoading}] = result.current
    expect(loadingLocation.pathname).toBe('/home')
    expect(isLoading).toBe(true)

    await act(() => mockFetch.resolvePendingRequest('/about', {payload: {color: 'red'}}))

    const [{location: newLocation, routeStateMap}] = result.current
    expect(newLocation.pathname).toBe('/about')
    expect((routeStateMap['a1']!.data as {payload: unknown}).payload).toEqual({color: 'red'})
  })

  it('reports error when the initial route is not present in the React app', async () => {
    jest.spyOn(console, 'error').mockImplementation()

    const wrongRouteInitData = {...blueHomeInitData, initialLocation: buildLocation('/unknown', 'w1')}
    expect(() => renderHook(() => useNavigator(wrongRouteInitData))).toThrow(
      'No route found for initial location: /unknown in [/home, /about, /will-fail, /pass-error]',
    )
  })

  it('reports error when it fails navigating to a route', async () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))
    const [{location}, {handleHistoryUpdate}] = result.current
    expect(location.pathname).toBe('/home')

    history.pushState({}, '', 'will-fail')
    await act(() => handleHistoryUpdate({location: buildLocation('/will-fail', 'w1'), action: Action.Push, delta: 1}))

    await act(() => mockFetch.resolvePendingRequest('/will-fail', {}, {ok: false, status: 404}))

    const [{location: newLocation, isLoading, error, navigateOnError}] = result.current
    expect(newLocation.pathname).toBe('/will-fail')
    expect(isLoading).toBe(false)
    expect(error).toEqual({type: 'httpError', httpStatus: 404})
    expect(navigateOnError).toBe(false)
  })

  it('reports error when it fails navigating to a route with navigateOnError', async () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))
    const [{location}, {handleHistoryUpdate}] = result.current
    expect(location.pathname).toBe('/home')

    history.pushState({}, '', 'pass-error')
    // react-router matchPath requires an initial slash in the new location to match
    await act(() => handleHistoryUpdate({location: buildLocation('/pass-error', 'p1'), action: Action.Push, delta: 1}))

    await act(() => mockFetch.resolvePendingRequest('/pass-error', {}, {ok: false, status: 404}))

    const [{location: newLocation, isLoading, error, navigateOnError}] = result.current
    expect(newLocation.pathname).toBe('/pass-error')
    expect(isLoading).toBe(false)
    expect(error).toEqual({type: 'httpError', httpStatus: 404})
    expect(navigateOnError).toBe(true)
  })

  it('reports error when the fetch response is invalid', async () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))
    const [{location}, {handleHistoryUpdate}] = result.current
    expect(location.pathname).toBe('/home')

    history.pushState({}, '', 'pass-error')
    await act(() => handleHistoryUpdate({location: buildLocation('/pass-error', 'p1'), action: Action.Push, delta: 1}))

    await act(() =>
      mockFetch.resolvePendingRequest('/pass-error', 'unused', {
        json: () => Promise.reject(new Error('Invalid json')),
      }),
    )

    const [{location: newLocation, isLoading, error, navigateOnError}] = result.current
    expect(newLocation.pathname).toBe('/pass-error')
    expect(isLoading).toBe(false)
    expect(error).toEqual({type: 'badResponseError'})
    expect(navigateOnError).toBe(true)
  })

  it('reports error when the fetch fails (network down)', async () => {
    const {result} = renderHook(() => useNavigator(blueHomeInitData))
    const [{location}, {handleHistoryUpdate}] = result.current
    expect(location.pathname).toBe('/home')

    history.pushState({}, '', 'pass-error')
    await act(() => handleHistoryUpdate({location: buildLocation('/pass-error', 'p1'), action: Action.Push, delta: 1}))

    await act(() => mockFetch.rejectPendingRequest('/pass-error', 'network down'))

    const [{location: newLocation, isLoading, error, navigateOnError}] = result.current
    expect(newLocation.pathname).toBe('/pass-error')
    expect(isLoading).toBe(false)
    expect(error).toEqual({type: 'fetchError'})
    expect(navigateOnError).toBe(true)
  })
})
