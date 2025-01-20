import {useMutation, type UseMutationResult} from '@tanstack/react-query'
import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'

export type CloseSecurityCampaignResponse = {
  redirect: string
}

export function useCloseSecurityCampaignMutation(
  path: string,
): UseMutationResult<CloseSecurityCampaignResponse, Error, void> {
  return useMutation({
    mutationFn: () => {
      return fetchJson(path, {
        method: 'post',
        defaultErrorMessage: 'Error closing security campaign',
      })
    },
  })
}
