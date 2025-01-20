import {parseHTML} from '@github-ui/parse-html'
import {serverXSafeHTMLPolicy} from '@github-ui/trusted-types-policies/server-x-safe-html'

export async function fetchSafeDocumentFragment(
  document: Document,
  url: RequestInfo,
  options?: RequestInit,
): Promise<DocumentFragment> {
  const request = new Request(url, options)
  request.headers.append('X-Requested-With', 'XMLHttpRequest')
  const response = await self.fetch(request)
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`HTTP ${response.status}${response.statusText || ''}`)
  }
  const trustedHTML = serverXSafeHTMLPolicy.createHTML(await response.text(), response)
  return parseHTML(document, trustedHTML)
}

export function fetchPoll(
  url: RequestInfo,
  options?: RequestInit,
  timeBetweenRequests = 1000,
  acceptedStatusCodes = [200],
  pollStatusCodes = [202],
): Promise<Response> {
  return (async function poll(wait: number): Promise<Response> {
    const request = new Request(url, options)
    request.headers.append('X-Requested-With', 'XMLHttpRequest')
    const response = await self.fetch(request)

    if (pollStatusCodes.includes(response.status)) {
      await new Promise(resolve => setTimeout(resolve, wait))
      return poll(wait * 1.5)
    }
    if (acceptedStatusCodes.includes(response.status)) {
      return response
    }
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP ${response.status}${response.statusText || ''}`)
    }
    throw new Error(`Unexpected ${response.status} response status from poll endpoint`)
  })(timeBetweenRequests)
}

type RetryResult = Response | 'retry'
type FetchRetryOptions = {
  // Base wait time between retries
  // this will be multiplied with the current attempt to perform a backoff strategy
  // Defaults to 500ms
  wait?: number
  // List of accepted status codes that should not be retried. Defaults to [200]
  acceptedStatusCodes?: number[]
  // Max number of attempts. Defaults to 3
  max?: number
  // Current retry attempt. Starts at 0
  attempt?: number
}

// Execute a fetch call in a callback and retry it up to `options.max` times
// Each retry will be delayed `options.wait` * `options.attempt`
export async function fetchRetry(
  url: RequestInfo,
  fetchOptions?: RequestInit,
  options?: FetchRetryOptions,
): Promise<Response> {
  const {wait = 500, acceptedStatusCodes = [200], max = 3, attempt = 0} = options || {}

  const retry: () => Promise<RetryResult> = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const request = new Request(url, fetchOptions)
          request.headers.append('X-Requested-With', 'XMLHttpRequest')
          const response = await self.fetch(request)
          if (acceptedStatusCodes.includes(response.status) || attempt + 1 === max) {
            return resolve(response)
          }

          // The response failed, we indicate that it must be retried
          resolve('retry')
        } catch (err) {
          // Only non successful HTTP status codes are controlled by this retry mechanism
          // Any other error is propagated
          reject(err)
        }
      }, wait * attempt)
    })
  }

  const result = await retry()
  if (result !== 'retry') {
    return result
  }

  return fetchRetry(url, fetchOptions, {wait, acceptedStatusCodes, max, attempt: attempt + 1})
}
