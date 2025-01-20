import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

export interface CSRFTokens {
  csrf_tokens?: {
    [path: string]:
      | {
          [method: string]: string | undefined
        }
      | undefined
  }
}

export function useCSRFToken(path: string, method: string): string | undefined {
  const {csrf_tokens} = useRoutePayload<CSRFTokens>()
  return csrf_tokens?.[path]?.[method]
}
