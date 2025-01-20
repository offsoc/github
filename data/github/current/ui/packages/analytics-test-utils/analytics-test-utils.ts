import {mockFetch} from '@github-ui/mock-fetch'

const TEST_ANALYTICS_URL = '/TEST_ANALYTICS_URL'

interface ExpectedEvent<T = string> {
  type: string
  target?: T
  data?: Record<string, string>
}

/**
 * Check what user analytics event was dispatched. Provide multiple arguments if you want to check a sequence.
 *
 * @example
 * ```tsx
 * test('emits user analytics event', async () => {
 *   renderRepoTree(<ContributeButton />)
 *
 *   // Act on component
 *
 *   expectAnalyticsEvents({
 *     type: 'repository.click',
 *     target: 'CONTRIBUTE_BUTTON',
 *     data: {
 *       category: 'Branch Infobar',
 *       label: 'ref_loc:contribute_dropdown'
 *       action: 'Open Contribute dropdown',
 *     }
 *   })
 * })
 * ```
 */
export function expectAnalyticsEvents<T = string>(...events: Array<ExpectedEvent<T>>) {
  try {
    const analyticsCalls = mockFetch.fetch.mock.calls.filter(call => call[0] === TEST_ANALYTICS_URL)
    // If we expect more events to be sent than it actually was.
    if (analyticsCalls.length < events.length) {
      const actual = analyticsCalls.map(call => parseFetchArgs(call).target)
      throw new Error(`
        Expected at least ${events.length} analytics events, but received ${analyticsCalls.length}.
        Expected: ${events.map(({target}) => target)}
        Actual: ${actual}
      `)
    }

    const errors: string[][] = []
    for (let index = 0; index < events.length; index++) {
      const expectedEvent = events[index]!
      const actualEvent = parseFetchArgs(analyticsCalls[index])

      const eventCheckErrors: string[] = []

      if (expectedEvent.type !== actualEvent.type) {
        eventCheckErrors.push(
          `Analytics event number ${index + 1} expected type '${expectedEvent.type}' but got '${actualEvent.type}'`,
        )
      }
      if (expectedEvent.target !== actualEvent.target) {
        eventCheckErrors.push(
          `Analytics event number ${index + 1} expected target '${expectedEvent.target}' but got '${
            actualEvent.target
          }'`,
        )
      }

      const {data = {}} = expectedEvent
      const correctData = Object.keys(data).every(dataKey => data[dataKey]!.toString() === actualEvent.context[dataKey])
      if (!correctData) {
        eventCheckErrors.push(
          `Analytics event number ${index + 1} expected data '${JSON.stringify(data)}' to be in '${JSON.stringify(
            actualEvent.context,
          )}'`,
        )
      }

      if (eventCheckErrors.length) {
        errors.push(eventCheckErrors)
      }
    }

    if (errors.length) {
      throw new Error(errors.map(eventErrors => eventErrors.join('\n')).join('\n\n'))
    }
  } catch (error) {
    // This allows jest to show the error at the call site, rather than within this function
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    Error.captureStackTrace(error, expectAnalyticsEvents)
    throw error
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFetchArgs(call: any[]) {
  const [, requestInit] = call
  const body = (requestInit as RequestInit).body ? JSON.parse(requestInit.body) : {}
  const {type} = body?.events[0] || {}
  const {target, ...context} = body?.events[0]?.context || {}

  return {type, target, context}
}

export function userAnalyticsTestSetup() {
  // document will be undefined when running SSR tests in a node environment
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'octolytics-url')
    meta.setAttribute('content', TEST_ANALYTICS_URL)
    document.head.appendChild(meta)
  }
}
