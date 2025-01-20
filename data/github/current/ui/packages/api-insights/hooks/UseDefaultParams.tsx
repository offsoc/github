import {useCallback} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {getState, replaceState} from '@github-ui/browser-history-state'

type SetDefaultParamsFunction = () => void

export interface PageParamsPayload {
  page_params: {[key: string]: string}
}

export function useDefaultParams(): {
  setDefaultParams: SetDefaultParamsFunction
} {
  const payload = useRoutePayload<PageParamsPayload>()
  const page_params = payload.page_params
  return {
    setDefaultParams: useCallback(() => {
      if (!page_params) return
      const params = new URLSearchParams(page_params)
      replaceState(getState(), '', `?${params.toString()}`)
    }, [page_params]),
  }
}
