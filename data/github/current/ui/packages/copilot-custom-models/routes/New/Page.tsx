import {Box, Flash} from '@primer/react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RoutePayload} from './types'
import {Header} from '../../components/Header'
import {useOrgOnlyRepos} from '../../features/RepoPicker'
import {TrainingForm, useForm} from '../../features/TrainingForm'
import {RelayEnvironmentProvider} from 'react-relay'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

const relayEnv = relayEnvironmentWithMissingFieldHandlerForNode()

export function New() {
  return (
    <RelayEnvironmentProvider environment={relayEnv}>
      <Component />
    </RelayEnvironmentProvider>
  )
}

function Component() {
  const {
    adminEmail,
    availableLanguages,
    canCollectPrivateTelemetry,
    createPath,
    enoughDataToTrain,
    organization: org,
  } = useRoutePayload<RoutePayload>()
  const {formErrors, handleSubmit, isSubmitting} = useForm({createPath})
  const repoPickerQueryFn = useOrgOnlyRepos({org, relayEnv})
  const showPrivateTelemetryToggle = useFeatureFlag('copilot_private_telemetry_access')

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Header
        subtext={
          enoughDataToTrain
            ? 'Train your custom model by including repositories and data that is reflective of your commonly used programming languages, internal frameworks, and libraries.'
            : undefined
        }
        text="New custom model"
      />

      {enoughDataToTrain ? (
        <TrainingForm
          adminEmail={adminEmail}
          availableLanguages={availableLanguages}
          canCollectPrivateTelemetry={canCollectPrivateTelemetry}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          repoPickerQueryFn={repoPickerQueryFn}
          showPrivateTelemetryToggle={showPrivateTelemetryToggle}
        />
      ) : (
        <Flash>Sorry, you do not have enough repository data in your org to train a model.</Flash>
      )}
    </Box>
  )
}
