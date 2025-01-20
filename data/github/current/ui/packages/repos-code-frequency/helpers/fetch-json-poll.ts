import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export function fetchJsonPoll(
  url: string,
  timeBetweenRequests = 1000,
  acceptedStatusCodes = [200],
  maxTries = 10,
): Promise<Response> {
  let tries = 0
  return (async function poll(wait: number): Promise<Response> {
    if (tries++ > maxTries) {
      throw new Error(`Failed to receive a response after ${maxTries} tries`)
    }

    const response = await verifiedFetchJSON(url)

    if (response.status === 202) {
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
