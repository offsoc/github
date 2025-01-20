interface RouteInfo {
  data: unknown
  mock: jest.Mock
  mockOnce: boolean
  responseOverride: Partial<Response>
}

interface PendingRequest {
  resolve: (response: Response) => void
  reject: (reason?: unknown) => void
}

/**
 * This class mocks window.fetch so tests can simulate the response to requests.
 *
 * Call it beforehand to mock the response to a URL:
 *
 *   mockFetch.mockRoute('/owner/repo/endpoint/main/second.txt', threeItems)
 *
 * It can also be used with a Regex that matches the URL:
 *
 *   mockFetch.mockRoute(/tree-commit-info/, {prop: value})
 *
 * It can be declared to return only once.
 *
 *   mockFetch.mockRouteOnce(/tree-commit-info/, {prop: value})
 *
 * These responses resolve the window.fetch call immediately. If you want to wait,
 * in order to check the loading state of a component, or want to resolve requests
 * in a specific order, use resolveRoute instead, which lets you resolve a previous call:
 *
 *   mockFetch.resolvePendingRequest('/owner/repo/endpoint/main/second.txt', twoItems)
 */
class MockFetch {
  private routes: Map<string | RegExp, RouteInfo> = new Map()
  private pendingRequests: Map<RequestInfo | URL, PendingRequest> = new Map()

  fetch = jest.fn().mockImplementation(async (requestInfo, params) => {
    const response = this.respondFromRoutes(requestInfo, params)
    if (response) {
      return response
    } else {
      // Remember this fetch call so we can resolve it later when this URL is mocked.
      // Otherwise, the promise will never be resolved and the test will timeout.
      return new Promise<Response>((resolve, reject) => {
        this.pendingRequests.set(requestInfo, {resolve, reject})
      })
    }
  })

  clear() {
    this.fetch.mockClear()
    this.pendingRequests.clear()
    this.routes.clear()
  }

  calls() {
    return this.fetch.mock.calls
  }

  /**
   * Mocks the given URL to return the given data every time it's called.
   * @param url Literal URL or RegExp to match against.
   * @param data The data to return when this URL is fetched.
   * @param responseOverride Partial object to include on the Response.
   * @returns A Mock object that can be used to assert details of the fetch calls.
   */
  mockRoute<T>(url: string | RegExp, data?: T, responseOverride: Partial<Response> = {}) {
    return this.addRouteMock(url, data, responseOverride)
  }

  /**
   * Mocks the given URL to return the given data only once.
   * @param url Literal URL or Regex to match against.
   * @param data The data object to return in the response.
   * @param responseOverride Partial object to include on the Response.
   * @returns A Mock object that can be used to assert details of this fetch call.
   */
  mockRouteOnce<T>(url: string | RegExp, data?: T, responseOverride: Partial<Response> = {}) {
    return this.addRouteMock(url, data, responseOverride, true)
  }

  /**
   * If the given URL has been fetched, it resolves that call.
   * Otherwise, this method will throw.
   * If the URL was mocked, it will have been resolved already and this method will throw.
   * This method can be awaited to ensure that the fetch call has been already resolved.
   * @param url Literal URL or Regex to match against.
   * @param data The data object to return in the response.
   * @param responseOverride Partial object to include on the Response.
   */
  async resolvePendingRequest<T>(url: string | RegExp, data: T, responseOverride: Partial<Response> = {}) {
    const pendingRequest = this.findPendingRequest(url)
    pendingRequest.resolve(this.buildResponse({data, responseOverride}))
  }

  /**
   * If the given URL has been fetched, it rejects that call.
   * Otherwise, this method will throw.
   * @param url Literal URL or Regex to match against.
   * @param reason Error message
   */
  async rejectPendingRequest(url: string | RegExp, reason: string) {
    const pendingRequest = this.findPendingRequest(url)
    pendingRequest.reject(reason)
  }

  private findPendingRequest(url: string | RegExp): PendingRequest {
    for (const [requestInfo, pendingRequest] of this.pendingRequests.entries()) {
      if (this.matchRequest(requestInfo, url)) {
        this.pendingRequests.delete(requestInfo)
        return pendingRequest
      }
    }

    const pendingUrls = Array.from(this.pendingRequests.keys()).join(', ')
    throw new Error(`No pending request found for URL: ${url}\nWe only got: [${pendingUrls}]`)
  }

  private addRouteMock<T>(
    url: string | RegExp,
    data: T,
    responseOverride: Partial<Response>,
    mockOnce = false,
  ): jest.Mock {
    const mock = jest.fn()
    const routeInfo = {data, mock, mockOnce, responseOverride}
    this.routes.set(url, routeInfo)

    return mock
  }

  private respondFromRoutes(requestInfo: RequestInfo | URL, init?: RequestInit): Response | undefined {
    for (const [path, routeInfo] of this.routes.entries()) {
      if (this.matchRequest(requestInfo, path)) {
        // Call mock with requestInfo. Can be used to assert the number of times `fetch` was called with provided url.
        routeInfo.mock(requestInfo, init)
        if (routeInfo.mockOnce) {
          this.routes.delete(path)
        }

        return this.buildResponse(routeInfo)
      }
    }
  }

  private matchRequest(requestInfo: RequestInfo | URL, path: string | RegExp) {
    if (typeof path === 'string') {
      return path === requestInfo
    } else {
      return requestInfo.toString().match(path)
    }
  }

  private buildResponse<T>({data, responseOverride}: {data: T; responseOverride: Partial<Response>}): Response {
    return {
      json: async () => data,
      ok: true,
      ...responseOverride,
    } as Response
  }
}

export const mockFetch = new MockFetch()

afterEach(() => mockFetch.clear())
