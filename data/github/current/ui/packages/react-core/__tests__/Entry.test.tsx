import {act, render, screen} from '@testing-library/react'
import {Link, useLocation} from 'react-router-dom'
import {type RouteRegistration, TransitionType} from '../app-routing-types'
import {ClientEntry} from '../ClientEntry'
import {createBrowserHistory} from '../create-browser-history'
import type {EmbeddedData} from '../embedded-data-types'
import {jsonRoute} from '../JsonRoute'
import {setupUserEvent} from '../test-utils/Render'
import {usePublishPayload} from '../use-publish-payload'
import {useRoutePayload} from '../use-route-payload'

const PageComponent = ({name}: {name: string}) => {
  const payload = useRoutePayload()
  return (
    <>
      <h1>Page {name}</h1>
      <nav>
        <Link to="/a">go to a</Link>
        <Link to="/b">go to b</Link>
        <Link to="/instant">go to instant</Link>
      </nav>
      <pre>{JSON.stringify({payload})}</pre>
    </>
  )
}

const LocationComponent = () => {
  const location = useLocation()

  return (
    <>
      <span data-testid="location-hash">{location.hash}</span>
    </>
  )
}

const routeA: RouteRegistration = jsonRoute({path: '/a', Component: jest.fn(() => <PageComponent name="a" />)})
const routeB: RouteRegistration = jsonRoute({path: '/b', Component: jest.fn(() => <PageComponent name="b" />)})
const routeInstant: RouteRegistration = jsonRoute({
  path: '/instant',
  Component: jest.fn(() => <PageComponent name="instant" />),
  transitionType: TransitionType.TRANSITION_WHILE_FETCHING,
})
const routeLocation: RouteRegistration = jsonRoute({path: '/location', Component: jest.fn(() => <LocationComponent />)})
const routes = [routeA, routeB, routeInstant, routeLocation]

let resolveJsonPromise: (data: unknown) => void

jest.mock('@github-ui/soft-nav/utils', () => ({
  inSoftNav: jest.fn(),
}))
jest.mock('@github-ui/soft-nav/state', () => ({
  startSoftNav: jest.fn(),
  succeedSoftNav: jest.fn(),
  failSoftNav: jest.fn(),
  renderedSoftNav: jest.fn(),
}))

jest.mock('@github-ui/hydro-analytics', () => ({
  sendPageView: jest.fn(),
}))

jest.mock('@github-ui/stats', () => ({
  sendStats: jest.fn(),
}))

Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

const renderEntry = async (initialPath: string = routeA.path, embeddedData: EmbeddedData = {payload: null}) => {
  const user = setupUserEvent()
  const window = globalThis.window
  window.history.replaceState({}, '', initialPath)
  // Initial path is set by ruby. Anchors are not sent to the server.
  // Therefore anchors must be set explicitly by the client.
  const {pathname, search, hash} = new URL(
    `${initialPath}${window?.location.hash ?? ''}`,
    window?.location.href ?? 'https://github.com',
  )

  const history = createBrowserHistory({window, v5Compat: true})
  const {key, state} = history.location
  const initialLocation = {
    pathname,
    search,
    hash,
    key,
    state,
  }

  return {
    user,
    ...render(
      <ClientEntry
        initialLocation={initialLocation}
        history={history}
        appName="test"
        embeddedData={embeddedData}
        routes={routes}
        wasServerRendered={false}
      />,
    ),
  }
}

jest.mock('../use-publish-payload')
const mockedUsePublishPayload = jest.mocked(usePublishPayload)

beforeEach(() => {
  const responsePromise = new Promise(resolve => {
    resolveJsonPromise = resolve
  })
  window.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: jest.fn(() => responsePromise),
  } as unknown as Response)
  mockedUsePublishPayload.mockReturnValue()
})

afterEach(() => {
  ;(window.fetch as unknown as jest.Mock).mockClear()
})

describe('Entry', () => {
  describe('initial renders', () => {
    test('renders the correct route', async () => {
      await renderEntry(routeA.path)

      expect(screen.getByText('Page a')).toBeInTheDocument()
      expect(screen.queryByText('Page b')).not.toBeInTheDocument()
    })

    test('initial renders include embedded data without fetching', async () => {
      await renderEntry(routeA.path, {payload: 1})

      expect(screen.getByText('{"payload":1}')).toBeInTheDocument()
      expect(window.fetch).not.toHaveBeenCalled()
    })
  })

  describe('correct initial location', () => {
    const hash = '#MyHash'

    let spy: jest.SpyInstance<Location, []>
    beforeEach(() => {
      spy = jest.spyOn(window, 'location', 'get').mockReturnValue({...window.location, hash})
    })
    afterEach(() => {
      spy.mockRestore()
    })
    test('uses window hash to set initial location', async () => {
      await renderEntry(routeLocation.path)
      expect(screen.getByTestId('location-hash').textContent).toEqual(hash)
    })
  })

  describe('soft navigations', () => {
    test('fetches and then transitions', async () => {
      const {user} = await renderEntry(routeA.path)

      // Simulate a click on the link to b:

      await user.click(screen.getByText('go to b'))

      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/b'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      )

      // Resolve the mocked fetch response.json:
      await act(async () => {
        resolveJsonPromise({payload: 1})
      })

      // Verify that the new page is shown:
      expect(screen.queryByText('Page a')).not.toBeInTheDocument()
      expect(screen.getByText('Page b')).toBeInTheDocument()
      expect(screen.getByText('{"payload":1}')).toBeInTheDocument()
      expect(screen.getByText('Page b')).toBeInTheDocument()
    })

    test('transitions and then fetches when transtion type is set to before load', async () => {
      const {user} = await renderEntry(routeA.path)

      // Simulate a click on the link to b:
      await user.click(screen.getByText('go to instant'))
      expect(window.fetch).toHaveBeenCalled()

      // Verify that the new page is shown (before the response from the server):
      expect(screen.queryByText('Page a')).not.toBeInTheDocument()
      expect(screen.getByText('Page instant')).toBeInTheDocument()

      // Resolve the mocked fetch response.json:
      await act(async () => {
        resolveJsonPromise({payload: 1})
      })

      // Verify the new page is re-rendered with data
      expect(screen.getByText('Page instant')).toBeInTheDocument()
      expect(screen.getByText('{"payload":1}')).toBeInTheDocument()
    })
  })
})
