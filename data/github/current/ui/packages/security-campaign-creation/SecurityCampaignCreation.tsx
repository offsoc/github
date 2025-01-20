import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/utils/query-client'
import {
  SecurityCampaignCreateButton,
  type SecurityCampaignCreateButtonProps,
} from './components/SecurityCampaignCreateButton'

export function SecurityCampaignCreation(props: SecurityCampaignCreateButtonProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityCampaignCreateButton {...props} />
    </QueryClientProvider>
  )
}
