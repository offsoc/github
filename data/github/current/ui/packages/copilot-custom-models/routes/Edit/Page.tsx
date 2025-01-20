import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RoutePayload} from './types'
import {Box} from '@primer/react'
import {Header} from '../../components/Header'
import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useNavigateWithFlashBanner} from '../../features/NavigateWithFlashBanner'
import {TrainingForm, useForm} from '../../features/TrainingForm'
import {RelayEnvironmentProvider} from 'react-relay'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {useOrgOnlyRepos} from '../../features/RepoPicker'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import type {PipelineRepo} from '../../types'

const queryClient = new QueryClient()
const relayEnv = relayEnvironmentWithMissingFieldHandlerForNode()

export function Edit() {
  return (
    <QueryClientProvider client={queryClient}>
      <RelayEnvironmentProvider environment={relayEnv}>
        <Component />
      </RelayEnvironmentProvider>
    </QueryClientProvider>
  )
}

function Component() {
  const {
    availableLanguages,
    canCollectPrivateTelemetry,
    createPath,
    languages: initialLanguages,
    organization: org,
    pipelineId,
    repoCount: initialRepoCount,
    repoListPath,
    showPath,
    wasPrivateTelemetryCollected,
  } = useRoutePayload<RoutePayload>()
  const {navigate} = useNavigateWithFlashBanner()
  const showPrivateTelemetryToggle = useFeatureFlag('copilot_private_telemetry_access')

  const {formErrors, handleSubmit, isSubmitting} = useForm({createPath, pipelineId})
  const repoPickerQueryFn = useOrgOnlyRepos({org, relayEnv})

  const handleCancel = () => navigate(showPath)

  const {
    data: initialSelectedRepos,
    isLoading: isLoadingSelected,
    refetch: fetchSelected,
  } = useQuery({
    enabled: false,
    queryKey: ['initial-selected-repos', repoListPath],
    queryFn: async () => {
      const path = `${repoListPath}?limit_by=0`
      const response: Response = await verifiedFetch(path, {method: 'GET'})
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)

      const selectedRepos = (await response.json()).data as PipelineRepo[]

      return selectedRepos
    },
  })

  const handleFetchSelected = (): void => {
    if (initialSelectedRepos) return
    fetchSelected()
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Header
        subtext="Update your custom model by including repositories and data that is reflective of your commonly used
          programming languages, internal frameworks, and libraries. Settings shown reflect the previous model settings."
        text="Retrain custom model"
      />

      <TrainingForm
        availableLanguages={availableLanguages}
        canCollectPrivateTelemetry={canCollectPrivateTelemetry}
        fetchSelected={handleFetchSelected}
        formErrors={formErrors}
        initialLanguages={initialLanguages}
        initialRepoCount={initialRepoCount}
        initialSelectedRepos={initialSelectedRepos}
        isEditing
        isLoadingSelected={isLoadingSelected}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        repoPickerQueryFn={repoPickerQueryFn}
        showPrivateTelemetryToggle={showPrivateTelemetryToggle}
        wasPrivateTelemetryCollected={wasPrivateTelemetryCollected}
      />
    </Box>
  )
}
