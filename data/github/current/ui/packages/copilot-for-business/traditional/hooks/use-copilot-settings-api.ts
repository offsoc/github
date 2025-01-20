import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useState} from 'react'

type MethodsWithBody = 'POST' | 'PUT'
type ReqConfig<Req> = {method: 'GET' | 'DELETE'} | {method: MethodsWithBody; body: Req}

const BODIED_METHODS = ['POST', 'PUT']

const SERVER_ERROR_MSG = 'Something went wrong'

export const useCopilotSettingsApi = (org: string) => {
  const [error, setError] = useState<string>('')

  return {
    error,
    // TODO: refactor this https://github.com/github/heart-services/issues/2457
    callApi: useCallback(
      async function callApi<Res, Req = unknown>(endpoint: string, configs: ReqConfig<Req>) {
        let body: Req | undefined
        if (BODIED_METHODS.includes(configs.method) && 'body' in configs) {
          body = configs.body
        } else {
          body = undefined
        }

        const response = await verifiedFetchJSON(`/organizations/${org}/settings/copilot/${endpoint}`, {
          method: configs.method,
          body,
        })

        try {
          const json = await response.json()

          if (response.ok) {
            setError('')
            return json as Res
          }

          setError(json.error)
        } catch (e) {
          setError(SERVER_ERROR_MSG)
        }
      },
      [org, setError],
    ),
  }
}
