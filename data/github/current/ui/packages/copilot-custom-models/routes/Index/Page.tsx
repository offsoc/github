import {Box} from '@primer/react'
import {Header} from '../../components/Header'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RoutePayload} from './types'
import {PipelineList} from './features/PipelineList'
import {PipelineCard} from '../../features/PipelineCard'
import {BlankState} from './components/BlankState'
import {PipelineBanner} from '../../features/PipelineBanner'
import {PipelineDetailsProvider} from '../../features/PipelineDetails'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {PropsWithChildren} from 'react'

const queryClient = new QueryClient()

export function Index() {
  const {deployedPipeline, latestPipeline, newPath, organization, pipelines} = useRoutePayload<RoutePayload>()

  const focusedPipeline = deployedPipeline ?? latestPipeline

  const showBanner = pipelines.length === 1
  const showList = pipelines.length > 1
  const headerText = focusedPipeline ? `${organization} model` : 'Custom models'
  const headerSubtext = focusedPipeline
    ? undefined
    : "Custom Copilot models personalized to your team's private coding practices, standards, security, and languages."

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Header subtext={headerSubtext} text={headerText} />
        <Provider>
          {focusedPipeline ? (
            <>
              {showBanner && <PipelineBanner />}
              <PipelineCard />
            </>
          ) : (
            <BlankState newPath={newPath} />
          )}

          {showList && <PipelineList deployedPipeline={deployedPipeline} org={organization} pipelines={pipelines} />}
        </Provider>
      </Box>
    </QueryClientProvider>
  )
}

function Provider({children}: PropsWithChildren) {
  const {adminEmail, deployedPipeline, hasAnyDeployed, latestPipeline, organization, withinRateLimit} =
    useRoutePayload<RoutePayload>()

  if (!latestPipeline) return <>{children}</>

  return (
    <PipelineDetailsProvider
      adminEmail={adminEmail}
      hasAnyDeployed={hasAnyDeployed}
      org={organization}
      pipelineForBanner={latestPipeline}
      pipelineForCard={deployedPipeline ?? latestPipeline}
      withinRateLimit={withinRateLimit}
    >
      {children}
    </PipelineDetailsProvider>
  )
}
