import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {ToastContextProvider} from '@github-ui/toast/ToastContext'
import {ThemeProvider} from '@primer/react'
import type {StoryContext, StoryFn} from '@storybook/react'
import {render as rtlRender, type RenderResult as CoreRenderResult, type RenderOptions} from '@testing-library/react'
import type React from 'react'
import {MemoryRouter, useLocation, type Location} from 'react-router-dom'
import type {Options as ImportedUserEventOptions, UserEvent} from 'user-event-14'
import {AppContextProvider} from '../AppContextProvider'
import {CommonElements} from '../CommonElements'
import {createBrowserHistory} from '../create-browser-history'
import {jsonRoute} from '../JsonRoute'
import type {AppRegistration} from '../react-app-registry'
import {RouteStateMapContext} from '../route-state-map-context'
import {AppPayloadContext} from '../use-app-payload'

export type UserEventOptions = ImportedUserEventOptions
// user-event-14 attaches afterEach and afterAll hooks that reset the clipboard mocks after every test. So if we always
// import it and an SSR-only test imports this (ie, through a utils file that is shared with non-SSR tests), it will
// error on cleanup when user-event tries to access `navigator.clipboard`.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userEvent: UserEvent | null = typeof document !== 'undefined' ? require('user-event-14').userEvent : null

interface WrapperProps {
  appName?: string
  pathname?: string
  // If defined, search should be a string that starts with `?`
  search?: string
  // If defined, hash should be a string that starts with `#`
  hash?: string
  routePayload?: unknown
  appPayload?: unknown
  /**
   * Determines the AppContext value, which drives behaviors around things like links.
   */
  routes?: AppRegistration['routes']
  children?: React.ReactNode
}

export const Wrapper: React.FC<WrapperProps> = ({
  appName = 'test-app',
  children,
  pathname = '/',
  search = undefined,
  hash = undefined,
  routePayload = {},
  appPayload = {},
  routes = [jsonRoute({path: pathname, Component: () => null})],
}) => {
  const key = 'k1'
  // @ts-expect-error `routePayload` types don't account for title properties directly
  const title = (routePayload && routePayload['title']) || 'Test title'
  return (
    <AppContextProvider history={createBrowserHistory()} routes={routes}>
      <ThemeProvider>
        <AnalyticsProvider appName={appName} category="" metadata={{}}>
          <MemoryRouter initialEntries={[{pathname, search, hash, key}]}>
            <AppPayloadContext.Provider value={appPayload}>
              <ToastContextProvider>
                <RouteStateMapContext.Provider
                  // eslint-disable-next-line react/jsx-no-constructed-context-values
                  value={{
                    [key]: {
                      type: 'loaded',
                      data: {payload: routePayload},
                      title,
                    },
                  }}
                >
                  <>{children}</>
                  <RouteContext />
                </RouteStateMapContext.Provider>
                <CommonElements />
              </ToastContextProvider>
            </AppPayloadContext.Provider>
          </MemoryRouter>
        </AnalyticsProvider>
      </ThemeProvider>
    </AppContextProvider>
  )
}

type RouteContextType = {
  (): null
  location: Location | null
}
export const RouteContext: RouteContextType = () => {
  RouteContext.location = useLocation()
  return null
}
/**
 * `RouteContext.location` provides access to the current `location` context provided by the `MemoryRouter`
 * rendered in `Wrapper` via `render()`. This location can be used in tests to assert on the current location or wait for a route change.
 *
 * @see https://github.com/remix-run/react-router/blob/main/packages/react-router/__tests__/Router-test.tsx#L28-L32
 * @see https://github.com/github/github/blob/master/ui/packages/react-sandbox/routes/__tests__/Show.test.tsx
 *
 * @example
 * ```ts
 * import {screen, fireEvent} from "@testing-library/react"
 * import {render, RouteContext} from 'react-core/test-utils'
 *
 * test('navigates to /shawarma', () => {
 *   render(<MyComponent />, {pathname: '/falafel'})
 *   expect(RouteContext.location?.pathname).toBe('/falafel')
 *   fireEvent.click(screen.getByText('Shawarma'))
 *   expect(RouteContext.location?.pathname).toBe('/shawarma')
 * })
 * ```
 */
RouteContext.location = null

export type User = UserEvent & {
  /**
   * Clicking a link directly will log an error because page navigation is not supported by the testing library.
   * This alternative will prevent page navigation when clicking the link, allowing it to still emit click events.
   *
   * @note If a click event handler on the link checks for `event.defaultPrevented`, the handler behavior will be
   * affected because this method calls `preventDefault` on click.
   */
  clickLink(anchor: HTMLElement): Promise<void>
}

/**
 * Calls `userEvent.setup()` while adding the `clickLink` API and a fix for `useFakeTimer`.
 *
 * @warning Tests should typically not need to call this directly! If you are using the `render` function from this
 * package, you should simply unpack `user` from the result: `const {user} = render(...)`.
 */
export const setupUserEvent = (options?: ImportedUserEventOptions): User => {
  if (!userEvent) throw new Error('user-event requires a browser and cannot be accessed in an SSR context.')

  const coreUser = userEvent.setup({
    advanceTimers: delay => {
      // If fake timers are not enabled, a warning will be logged which will cause tests to fail. This warning is safe
      // to ignore in this case since we want it to work regardless of whether fake timers are enabled or not.

      // eslint-disable-next-line no-console
      const _warn = console.warn
      // eslint-disable-next-line no-console
      console.warn = jest.fn()
      jest.advanceTimersByTime(delay)
      // eslint-disable-next-line no-console
      console.warn = _warn
    },
    ...options,
  })

  return {
    ...coreUser,
    clickLink: async (element: HTMLElement) => {
      const preventNavigation = (e: MouseEvent) => e.preventDefault()
      element.addEventListener('click', preventNavigation)
      await coreUser.click(element)
      element.removeEventListener('click', preventNavigation)
    },
  }
}

/**
 *
 * @param result An object that has all of the properties returned from testing-library/render
 * @param userEventOptions an optional object of config for `userEvent.setup()`
 * @returns the result with an additional `user` getter that
 */
export function withUserEvent<View extends ReturnType<typeof rtlRender>>(
  view: View & {user?: never},
  userEventOptions?: UserEventOptions,
): View & {readonly user: User} {
  /**
   *  `user` is lazily initiated to prevent unnecessary side effects since many tests don't use
   * userEvent or are still on v13
   *  */
  let user: User | undefined

  return Object.assign(view, {
    get user() {
      return (user ??= setupUserEvent(userEventOptions))
    },
  })
}

export type TestRenderOptions = RenderOptions &
  WrapperProps & {
    userEventOptions?: ImportedUserEventOptions
  }

export type RenderResult = CoreRenderResult & {
  /**
   * `userEvent` instance for testing user interactions. Using this instance is preferable over calling methods on
   * `userEvent` directly because it will automatically advance timers when using `jest.useFakeTimers()`, and will
   * automatically mock the clipboard state across a test.
   *
   * IMPORTANT: Note that this `user` is built with `user-event@14` and behaves differently from `userEvent` imported
   * from `user-event-13`. The two should not be mixed within a test.
   */
  user: User
}

export const render = (
  ui: React.ReactElement,
  {
    pathname,
    routePayload,
    appPayload,
    search,
    hash,
    routes,
    wrapper: InnerWrapper,
    appName,
    userEventOptions,
    ...passthroughOptions
  }: TestRenderOptions = {},
): RenderResult => {
  const view = rtlRender(ui, {
    wrapper: ({children}) => (
      <Wrapper
        appName={appName}
        routePayload={routePayload}
        appPayload={appPayload}
        pathname={pathname}
        search={search}
        hash={hash}
        routes={routes}
      >
        {InnerWrapper ? <InnerWrapper>{children}</InnerWrapper> : children}
      </Wrapper>
    ),
    ...passthroughOptions,
  })

  return withUserEvent(view, userEventOptions)
}

/**
 * Returns a [storybook decorator](https://storybook.js.org/docs/writing-stories/decorators) that wraps the story in
 * the `react-core/test-utils`Wrapper`
 *
 * @example
 * ```tsx
 * import type {Meta} from '@storybook/react'
 * import {storyWrapper} from 'react-core/test-utils'
 *
 * // define the story Meta
 * export default {
 *  title: 'MyComponent',
 *  component: MyComponent,
 *  // wrap every story in the decorators defined on the Meta.
 *  decorators: [storyWrapper({pathname: '/falafel', appPayload: {owner: 'monalisa'}})],
 * } satisfies Meta<typeof MyComponent>
 *
 * // The story wrapper will wrap this story with the default props defined in the Meta
 * export const Example = {}
 *
 * // or you can override props on an individual story via parameters.storyWrapper
 * export const OtherExample = {parameters: {storyWrapper: {pathname: '/shawarma'}}}
 *
 * // or you can wrap an individual story if you only need the wrapper on a single story
 * export const OneOffExample = {decorators: [storyWrapper({pathname: '/kofta'})]}
 * ```
 */
export function storyWrapper(props: WrapperProps = {}) {
  return function WrapperDecorator(Story: StoryFn, context: StoryContext) {
    return (
      <Wrapper {...props} {...context.parameters.storyWrapper}>
        <Story />
      </Wrapper>
    )
  }
}
