import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/utils/query-client'
import {OrgSecurityCampaign} from '../components/OrgSecurityCampaign'

export function OrgSecurityCampaignShow() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrgSecurityCampaign />
    </QueryClientProvider>
  )
}
