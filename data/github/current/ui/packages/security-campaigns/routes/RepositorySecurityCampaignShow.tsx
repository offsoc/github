import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading, Label, Text} from '@primer/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/utils/query-client'
import type {SecurityCampaign} from '@github-ui/security-campaigns-shared/SecurityCampaign'
import {RepoProgressMetric} from '../components/RepoProgressMetric'
import {RepoAlertsList} from '../components/RepoAlertsList'
import {CampaignManagerText} from '../components/CampaignManagerText'
import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'
import {RelayEnvironmentProvider} from 'react-relay'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {RepoStatusMetric} from '../components/RepoStatusMetric'

export interface RepositorySecurityCampaignShowPayload {
  campaign: SecurityCampaign
  alertsPath: string
  repository: Repository
  createBranchPath: string | null
  closeAlertsPath: string
}
const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

export function RepositorySecurityCampaignShow() {
  const payload = useRoutePayload<RepositorySecurityCampaignShowPayload>()

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <QueryClientProvider client={queryClient}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
          <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'baseline'}}>
            <Heading data-hpc as="h2">
              {payload.campaign.name}
            </Heading>
            <CampaignManagerText manager={payload.campaign.manager} sx={{ml: 2}} />
          </Box>
          <Label variant="success">Beta</Label>
        </Box>
        <Text as="p" sx={{color: 'fg.muted'}}>
          {payload.campaign.description}
        </Text>
        <Box sx={{display: 'flex', gap: 2}}>
          <RepoProgressMetric
            alertsPath={payload.alertsPath}
            endsAt={new Date(payload.campaign.endsAt)}
            createdAt={new Date(payload.campaign.createdAt)}
          />
          <RepoStatusMetric endsAt={new Date(payload.campaign.endsAt)} alertsPath={payload.alertsPath} />
        </Box>
        <Box sx={{mt: 2}}>
          <RepoAlertsList
            alertsPath={payload.alertsPath}
            repository={payload.repository}
            createBranchPath={payload.createBranchPath ?? undefined}
            closeAlertsPath={payload.closeAlertsPath}
          />
        </Box>
      </QueryClientProvider>
    </RelayEnvironmentProvider>
  )
}
