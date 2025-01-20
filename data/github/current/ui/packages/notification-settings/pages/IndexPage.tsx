import {useState} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading} from '@primer/react'
import type {SettingsPayload} from '../types/settings-types'
import WatchingSettings from '../components/WatchingSettings'
import SystemSettings from '../components/SystemSettings'
import NotificationsSettings from '../components/NotificationsSettings'
import State, {Sections, SavingStatus} from '../components/State'
import {updateSettings} from '../services/api'

export function IndexPage() {
  const payload = useRoutePayload<SettingsPayload>()
  const {
    subscribedSettings,
    participatingSettings,
    autoSubscribeRepositories,
    autoSubscribeTeams,
    continuousIntegrationEmail,
    continuousIntegrationFailuresOnly,
    continuousIntegrationWeb,
    vulnerabilityCli,
    vulnerabilityEmail,
    vulnerabilityWeb,
    vulnerabilitySubscription,
    notifiableEmails,
    orgDeployKeySettings,
    pullRequestReview,
    pullRequestPush,
    ownViaEmail,
    commentEmail,
    emails: {
      global: {address, readonly},
    },
    watchingUrl,
    actionsUrl,
    dependabotHelpUrl,
  } = payload

  const [savingStatus, setSavingStatus] = useState<SavingStatus>(SavingStatus.IDLE)
  const [savingSection, setSavingSection] = useState<string>(Sections.Notifications)

  const saveData = async (section: Sections, formData: FormData) => {
    setSavingSection(section)
    setSavingStatus(SavingStatus.LOADING)
    const response = await updateSettings(formData)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (response.ok) {
      setSavingStatus(SavingStatus.SUCCESS)
    } else {
      setSavingStatus(SavingStatus.ERROR)
    }
  }

  const renderState = (section: Sections) => {
    const status = savingSection === section ? savingStatus : SavingStatus.IDLE
    return <State status={status} sx={{marginRight: 3, display: 'flex', alignItems: 'center'}} />
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderColor: 'border.default',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          justifyContent: 'space-between',
          pb: 2,
          mb: 3,
        }}
      >
        <Heading as="h2" sx={{fontSize: 4, fontWeight: 400}} data-hpc>
          Notifications
        </Heading>
        {renderState(Sections.Notifications)}
      </Box>
      <NotificationsSettings
        autoSubscribeRepositories={autoSubscribeRepositories}
        autoSubscribeTeams={autoSubscribeTeams}
        emails={notifiableEmails}
        defaultEmail={address}
        saveData={saveData}
        isEmailReadonly={readonly}
      />
      <WatchingSettings
        subscribedSettings={subscribedSettings}
        participatingSettings={participatingSettings}
        saveData={saveData}
        renderState={renderState}
        emailNotificationPreferences={{
          pullRequestReview,
          pullRequestPush,
          ownViaEmail,
          commentEmail,
        }}
        watchingUrl={watchingUrl}
      />
      <SystemSettings
        sx={{mt: 3}}
        continuousIntegration={{
          continuousIntegrationEmail,
          continuousIntegrationFailuresOnly,
          continuousIntegrationWeb,
        }}
        vulnerability={{
          vulnerabilityCli,
          vulnerabilityEmail,
          vulnerabilityWeb,
        }}
        vulnerabilitySubscription={vulnerabilitySubscription}
        deployKeyAlert={orgDeployKeySettings}
        saveData={saveData}
        renderState={renderState}
        actionsUrl={actionsUrl}
        dependabotHelpUrl={dependabotHelpUrl}
      />
    </>
  )
}
