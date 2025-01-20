import {useMutation, type UseMutationResult} from '@tanstack/react-query'
import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'

export type CreateSecurityCampaignRequest = {
  campaignName: string
  campaignDescription: string
  campaignDueDate: string
  campaignManager: number
  query: string
}

export type CreateSecurityCampaignResponse = {
  message: string
  campaignPath: string
}

export function useCreateSecurityCampaignMutation(
  path: string,
): UseMutationResult<CreateSecurityCampaignResponse, Error, CreateSecurityCampaignRequest> {
  return useMutation({
    mutationFn: request => {
      return fetchJson(path, {
        method: 'post',
        body: {
          campaign_name: request.campaignName,
          campaign_description: request.campaignDescription,
          campaign_due_date: request.campaignDueDate,
          campaign_manager: request.campaignManager,
          query: request.query,
        },
      })
    },
  })
}
