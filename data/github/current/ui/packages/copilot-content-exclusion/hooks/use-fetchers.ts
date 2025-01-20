import {genericResponseHandler, useMutation} from '@github-ui/use-remote-data'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

type MutationMethods = 'POST' | 'PUT' | 'DELETE'

export function useCopilotContentExclusionMutation<Payload, Data = unknown>(endpoint: string, method: MutationMethods) {
  return useVerifiedMutation<Payload, Data>(endpoint, method)
}

function useVerifiedMutation<Payload, Data>(url: string, method: MutationMethods) {
  return useMutation<Payload, Data>(url, (key: string, payload: Payload | undefined, signal: AbortSignal) => {
    return mutateFetcher<Payload, Data>(key, payload, method, signal)
  })
}

async function mutateFetcher<Payload, Data>(
  url: string,
  payload: Payload | undefined,
  method: string,
  signal: AbortSignal,
) {
  if (method === 'DELETE') {
    url.indexOf('?') === -1 ? (url += '?') : (url += '&')
    // @ts-expect-error we'll asume the caller correctly serializes the payload before sending
    url += new URLSearchParams(payload)
    payload = undefined
  }

  const response = await verifiedFetchJSON(url, {
    method,
    body: payload,
    signal,
  })

  return genericResponseHandler<Data>(response)
}
