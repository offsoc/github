import {Box, ThemeProvider} from '@primer/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {TrainingHeader} from './components/TrainingHeader'
import {TrainingSteps} from './features/TrainingSteps'
import {PipelineCard} from '../../features/PipelineCard'
import {CancelDialogProvider} from '../../components/CancelDialogProvider'
import {PipelineBanner} from '../../features/PipelineBanner'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RoutePayload} from './types'
import {PipelineDetailsProvider} from '../../features/PipelineDetails'

const queryClient = new QueryClient()

export function Show() {
  return (
    <QueryClientProvider client={queryClient}>
      <CancelDialogProvider>
        <Component />
      </CancelDialogProvider>
    </QueryClientProvider>
  )
}

function Component() {
  const {adminEmail, hasAnyDeployed, isStale, organization, pipelineDetails, withinRateLimit} =
    useRoutePayload<RoutePayload>()

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <PipelineDetailsProvider
        adminEmail={adminEmail}
        hasAnyDeployed={hasAnyDeployed}
        isStale={isStale}
        isViewingDetails
        org={organization.slug}
        pipelineForBanner={pipelineDetails}
        pipelineForCard={pipelineDetails}
        withinRateLimit={withinRateLimit}
      >
        <TrainingHeader />
        <PipelineBanner />
        <PipelineCard />
        <ThemeProvider colorMode="dark">
          <TrainingSteps />
        </ThemeProvider>
      </PipelineDetailsProvider>
    </Box>
  )
}
