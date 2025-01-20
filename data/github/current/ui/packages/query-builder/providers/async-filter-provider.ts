import type {QueryEvent} from '@github-ui/query-builder-element/query-builder-api'
import {getInsightsUrl, isTracingEnabled, reportTraceData} from '@github-ui/internal-api-insights'

export class AsyncFilterProvider extends EventTarget {
  endpoint: string
  repositoryScope: string | undefined
  abortController: AbortController

  constructor(endpoint: string, repositoryScope: string | undefined) {
    super()
    this.endpoint = endpoint
    this.repositoryScope = repositoryScope
    this.abortController = new AbortController()
  }

  abortPreviousRequests() {
    // If we had any previous requests that were still pending, terminate them and start a new one
    // This avoids race conditions with results coming back out of order
    this.abortController.abort()
    this.abortController = new AbortController()
  }

  async fetchData(event: QueryEvent): Promise<Response | undefined> {
    const lastElement = event.parsedQuery.at(-1)!
    const suggestionEndpoint = new URL(this.endpoint, window.location.origin)
    const params = suggestionEndpoint.searchParams || new URLSearchParams()

    let query = event.rawQuery.toString()
    if (this.repositoryScope && this.repositoryScope !== '') {
      const tokenToAdd = `repo:${this.repositoryScope}`
      if (!query.includes(tokenToAdd)) {
        query = `${query} ${tokenToAdd}`
      }
    }

    params.set('q', query)
    params.set('filter_value', lastElement.value)
    suggestionEndpoint.search = params.toString()

    let response
    try {
      const url = getInsightsUrl(suggestionEndpoint.toString())
      response = await fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: this.abortController.signal,
      })
    } catch (error) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (error.name !== 'AbortError') {
        throw error
      }
    }

    if (response && isTracingEnabled()) {
      const data = await response.clone().json()
      reportTraceData(data)
    }

    return response
  }
}
