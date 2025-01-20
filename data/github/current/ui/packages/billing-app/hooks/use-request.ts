import {useEffect} from 'react'
import type {JSONRequestInit} from '@github-ui/verified-fetch'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import useRoute from './use-route'

export enum HTTPMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export type UseRequestResponse = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  ok: boolean
  statusCode: number
}

export async function doRequest<IBody>(method: HTTPMethod, path: string, body?: IBody): Promise<UseRequestResponse> {
  let opts: JSONRequestInit = {method}
  if (body) opts = {...opts, body}

  const response = await verifiedFetchJSON(path, opts)
  const data = await response.json()
  return {data, ok: response.ok, statusCode: response.status}
}

interface UseRequestProps<Path extends string, FullPath extends string> {
  route: Route<Path, FullPath>
  // Additional URL params to use when generating the path
  args?: {[K in keyof ExtractRouteParams<FullPath>]: string | number}
  // Additional query params to append to the generated path
  reqParams?: Record<string, string>
  noop?: boolean
  // Optional JSON body for POST and PUT requests
  // Optional callback run before making a request
  onStart?: () => void
  // Optional callback run after making the request and receiving an ok status code
  onSuccess?: (response: UseRequestResponse) => void
  // Optional callback run after making the request and receiving an error status code OR an exception is thrown
  onError?: (response: UseRequestResponse | string) => void
}

// This hook allows you to make JSON requests to Billing vNext routes and handle responses via the provided callbacks.
// The hook wraps a useEffect, so a request will be fired any time the dependency array changes.
export default function useRequest({
  route,
  reqParams,
  noop = false,
  onStart = () => {},
  onSuccess = () => {},
  onError = () => {},
}: UseRequestProps<string, string>) {
  const {path} = useRoute(route, {}, reqParams)

  if (path === undefined) onError('Invalid route')

  useEffect(() => {
    if (noop)
      return () => {
        // no-op
      }
    const getData = async () => {
      const response = await doRequest(HTTPMethod.GET, path)
      if (response.ok) {
        onSuccess(response)
      } else {
        onError(response)
      }
    }
    onStart()
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])
}
