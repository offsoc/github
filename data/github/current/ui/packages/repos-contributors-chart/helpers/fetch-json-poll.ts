import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export function fetchJsonPoll(
  url: string,
  timeBetweenRequests = 1000,
  acceptedStatusCodes = [200],
  pollStatusCodes = [202],
): Promise<Response> {
  return (async function poll(wait: number): Promise<Response> {
    const response = await verifiedFetchJSON(url)

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
