import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'
import {useMutation, type UseMutationResult} from '@tanstack/react-query'

export type CloseAlertsRequest = {
  alertNumbers: number[]
  resolution: string
  dismissalComment: string
}

export type CloseAlertsResponse = {
  message: string
}

export function useCloseAlertsMutation(
  path: string,
): UseMutationResult<CloseAlertsResponse, Error, CloseAlertsRequest> {
  return useMutation({
    mutationFn: request => {
      return fetchJson(path, {
        method: 'post',
        body: {
          alert_numbers: request.alertNumbers,
          resolution: request.resolution,
          dismissal_comment: request.dismissalComment,
        },
      })
    },
  })
}
