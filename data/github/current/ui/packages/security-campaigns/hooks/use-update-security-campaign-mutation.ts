import {useMutation, type UseMutationResult} from '@tanstack/react-query'
import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'

export type UpdateSecurityCampaignRequest = {
  campaignName: string
  campaignDescription: string
  campaignDueDate: string
  campaignManager: number
}

export type UpdateSecurityCampaignResponse = {
  message: string
}

export function useUpdateSecurityCampaignMutation(
  path: string,
): UseMutationResult<UpdateSecurityCampaignResponse, Error, UpdateSecurityCampaignRequest> {
  return useMutation({
    mutationFn: request => {
      return fetchJson(path, {
        method: 'put',
        body: {
          campaign_name: request.campaignName,
          campaign_description: request.campaignDescription,
          campaign_due_date: request.campaignDueDate,
          campaign_manager: request.campaignManager,
        },
      })
    },
  })
}
