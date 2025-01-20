import isEqual from 'lodash-es/isEqual'
import isMatch from 'lodash-es/isMatch'
import {mockFetch} from './mock-fetch'

/**
 * Checks is `mockFetch` was called with the expected path expected number of times.
 * @param expectedPath
 * @param times
 *
 * @example
 * ```ts
 * expectMockFetchCalledTimes("/monalisa/settings", 2)
 * ```
 */
export function expectMockFetchCalledTimes(expectedPath: string | RegExp, times: number) {
  try {
    const calls = mockFetch.fetch.mock.calls.filter(([path]) => matchPath(path, expectedPath))

    if (calls.length !== times) {
      throw new Error(`Path ${expectedPath} expected number of calls to be ${times} but was ${calls.length}`)
    }
  } catch (error) {
    // This allows jest to show the error at the call site, rather than within this function
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    Error.captureStackTrace(error)
    throw error
  }
}

/**
 * Checks if any of the requests to the specified path contained expected body.
 * @param expectedPath
 * @param expectedBody
 * @param comparison - type of comparison. Defaults to `match`
 *
 * @example
 * ```ts
 * mockFetch.mockRoute("/monalisa/settings")
 * expectMockFetchCalledWith("/monalisa/settings", {property: "value"})
 * expectMockFetchCalledWith("/monalisa/settings", {property: "value"}, 'equal')
 * ```
 */
export function expectMockFetchCalledWith(
  expectedPath: string | RegExp,
  expectedBody: Record<string, unknown>,
  comparison: 'equal' | 'match' = 'match',
) {
  try {
    const calls = mockFetch.fetch.mock.calls.filter(([path]) => matchPath(path, expectedPath))
    if (calls.length === 0) {
      throw new Error(`Path ${expectedPath} was never called`)
    }

    const hasMatches = calls
      .map(([, {body}]) => body)
      .some(body => {
        body = JSON.parse(body)
        return comparison === 'equal' ? isEqual(body, expectedBody) : isMatch(body, expectedBody)
      })

    if (!hasMatches) {
      throw new Error(`Path ${expectedPath} was never called with ${JSON.stringify(expectedBody)}`)
    }
  } catch (error) {
    // This allows jest to show the error at the call site, rather than within this function
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    Error.captureStackTrace(error)
    throw error
  }
}

function matchPath(path: string, expectedPath: string | RegExp): boolean {
  if (typeof expectedPath === 'string') {
    return path === expectedPath
  } else {
    return !!path.match(expectedPath)
  }
}
