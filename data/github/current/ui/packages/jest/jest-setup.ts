import {userAnalyticsTestSetup} from '@github-ui/analytics-test-utils'
import {applyDefaultClientEnvMock} from '@github-ui/client-env/mock'
import {mockFetch} from '@github-ui/mock-fetch'
import {ssrShimFileMap} from '@github-ui/ssr-shims'
import '@testing-library/jest-dom/extend-expect'
import failOnConsole from 'jest-fail-on-console'
import {TextDecoder, TextEncoder} from 'util'
import {randomUUID} from 'node:crypto'

jest.retryTimes(4, {logErrorsBeforeRetry: true})

if (typeof window !== 'undefined') {
  window.crypto.randomUUID ||= () => randomUUID() as `${string}-${string}-${string}-${string}-${string}`
}
// Node 18+ has Broadcast channel defined, but creating one will leave open handles preventing Jest from exiting
global.BroadcastChannel = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
}))

// we only want to mock browser globals in DOM (or js-dom) environments – not in SSR / node
if (typeof document !== 'undefined') {
  global.TextEncoder ||= TextEncoder
  // @ts-expect-error TextDecoder types aren't exact matches
  global.TextDecoder ||= TextDecoder
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  window.requestIdleCallback = jest.fn()

  // IntersectionObserver is not supported in JSDOM, which does not contain
  // DOM layout functionality. https://github.com/jsdom/jsdom/issues/2032
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    takeRecords: jest.fn(),
    disconnect: jest.fn(),

    root: null,
    rootMargin: [],
    thresholds: [],
  }))

  window.fetch = mockFetch.fetch

  // @ts-expect-error not defining all properties
  window.CSS = {
    supports: jest.fn(),
    escape: jest.fn(),
  }

  /**
   * Required for internal usage of matchMedia in primer/react
   * this is not implemented in JSDOM, and until it is we'll need to polyfill
   * https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
   */
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  })
} else {
  /**
   * Our custom elements all extend from HTMLElement, which will fail
   * when we run Jest in a node environment. We can shim HTMLElement with Object
   * to avoid errors. There is a similar shim for SSR in webpack-alloy.config.js
   */
  global.HTMLElement = Object as never

  const skipModuleShims = ['@oddbird/popover-polyfill/fn']

  /**
   * When we run Jest in a node environment, we need to apply the same shims that
   * will be used in our SSR environment. We do this by mocking the imports and
   * returning the shim exports instead.
   */
  const shims = Object.entries(ssrShimFileMap)
  for (const [file, shimPath] of shims) {
    if (!skipModuleShims.includes(file)) {
      jest.mock(file, () => {
        // eslint-disable-next-line import/no-dynamic-require
        return require(shimPath)
      })
    }
  }
}

const failOnAllConsoleMessages = process.env.CI === 'true'

/**
 * Memex currently logs errors/warnings in some of their tests. In order to get a shared
 * base Jest config, we need to ignore these for now. Once they are cleaned up, this
 * exception should be removed.
 */
const isMemexPackage = process.env.PWD?.includes('ui/packages/memex')

failOnConsole({
  shouldFailOnWarn: !isMemexPackage,
  shouldFailOnError: !isMemexPackage,

  shouldFailOnDebug: failOnAllConsoleMessages,
  shouldFailOnInfo: failOnAllConsoleMessages,
  shouldFailOnLog: failOnAllConsoleMessages,

  silenceMessage(message, methodName) {
    // silence messages related to JSDOM not implementing navigation
    if (methodName === 'error' && message.startsWith('Error: Not implemented: navigation (except hash changes)')) {
      return true
    }
    return false
  },
})

userAnalyticsTestSetup()
applyDefaultClientEnvMock()

/**
 * Required for internal usage of dialog in primer/react
 * this is not implemented in JSDOM, and until it is we'll need to polyfill
 * https://github.com/jsdom/jsdom/issues/3294
 * https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 * we only want to mock browser globals in DOM (or js-dom) environments – not in SSR / node
 */
if (typeof document !== 'undefined') {
  global.HTMLDialogElement.prototype.showModal = jest.fn(function mock(this: HTMLDialogElement) {
    this.open = true
  })

  global.HTMLDialogElement.prototype.close = jest.fn(function mock(this: HTMLDialogElement) {
    this.open = false
  })

  global.HTMLElement.prototype.scrollIntoView = jest.fn()
  global.HTMLElement.prototype.scrollTo = jest.fn()
}
