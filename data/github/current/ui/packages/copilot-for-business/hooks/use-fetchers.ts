import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {genericResponseHandler, useLazyData, useMutation} from '@github-ui/use-remote-data'
import {useCallback, useMemo, useRef, useState} from 'react'
import type {buildTemplate} from '../helpers/template'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import isEqual from 'lodash-es/isEqual'

type MutationMethods = 'POST' | 'PUT' | 'DELETE'
type FetchConfig<Data> = {
  resource: string
  initialData?: Data
}
type MutationConfig = {
  resource: string
  method: MutationMethods
}

function useMemoizedTemplate(urlTemplate: ReturnType<typeof buildTemplate>, config: Record<string, string>) {
  const [currConfig, setCurrConfig] = useState(config)

  if (!isEqual(currConfig, config)) {
    setCurrConfig(config)
  }

  const url = useMemo(() => {
    return urlTemplate(currConfig)
  }, [currConfig, urlTemplate])

  return {url}
}

export function useCreateFetcher(urlTemplate: ReturnType<typeof buildTemplate>, config: Record<string, string>) {
  const {url} = useMemoizedTemplate(urlTemplate, config)

  return useCallback(
    function useFetchResource<Data = unknown>({resource, initialData}: FetchConfig<Data>) {
      const fetcher = useCallback((key: string, signal: AbortSignal) => {
        return fetchData<Data>(key, signal)
      }, [])

      return useLazyData<Data>(`${url}/${resource}`, fetcher, {initialData})
    },
    [url],
  )
}

export function useCreateMutator(urlTemplate: ReturnType<typeof buildTemplate>, config: Record<string, string>) {
  const {url} = useMemoizedTemplate(urlTemplate, config)
  return useCallback(
    function useMutateResource<Payload, Data = unknown>({resource, method}: MutationConfig) {
      return useVerifiedMutation<Payload, Data>(`${url}/${resource}`, method)
    },
    [url],
  )
}

export async function fetchData<Data>(url: string, signal: AbortSignal) {
  const response = await verifiedFetchJSON(url, {
    method: 'GET',
    signal,
  })

  return genericResponseHandler<Data>(response)
}

// --

function useVerifiedMutation<Payload, Data>(url: string, method: MutationMethods) {
  const methodRef = useRef(method)

  useLayoutEffect(() => {
    methodRef.current = method
  })

  const fetcher = useCallback((key: string, payload: Payload | undefined, signal: AbortSignal) => {
    return mutateFetcher<Payload, Data>(key, payload, methodRef.current, signal)
  }, [])

  return useMutation<Payload, Data>(url, fetcher)
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

  try {
    const response = await verifiedFetchJSON(url, {
      method,
      body: payload,
      signal,
    })

    return genericResponseHandler<Data>(response)
  } catch (err) {
    return genericResponseHandler<Data>(
      new Response(JSON.stringify({error: (err as Error).message, obfuscate: true}), {
        status: 400,
        statusText: 'Bad Request',
      }),
    )
  }
}
