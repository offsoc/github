import {useSearchParams} from '@github-ui/use-navigate'
import {useCallback} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {PageParamsPayload} from './UseDefaultParams'

type ReplaceSearchParamsFunction = (queryParam: string, value: string) => void

export function useReplaceSearchParams(): {
  replaceSearchParams: ReplaceSearchParamsFunction
  searchParams: URLSearchParams
} {
  const [searchParams, setSearchParams] = useSearchParams()
  const payload = useRoutePayload<PageParamsPayload>()
  const page_params = payload?.page_params
  return {
    replaceSearchParams: useCallback(
      (queryParam: string, value: string) => {
        setSearchParams(
          oldParams => {
            const used_params = page_params || oldParams
            const params = new URLSearchParams(used_params)
            params.set(queryParam, value)
            return params
          },
          {
            preventAutofocus: true, // prevents scroll/focus reset to 0
          },
        )
      },
      [setSearchParams, page_params],
    ),
    searchParams: new URLSearchParams(page_params || searchParams),
  }
}
