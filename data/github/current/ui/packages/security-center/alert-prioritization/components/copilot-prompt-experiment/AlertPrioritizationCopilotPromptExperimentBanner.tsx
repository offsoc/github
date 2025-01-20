import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {CopilotIcon} from '@primer/octicons-react'
import {Banner} from '@primer/react/drafts'
import {useState} from 'react'

import {usePaths} from '../../../common/contexts/Paths'
import {useClickLogging} from '../../../common/hooks/use-click-logging'
import {tryFetchJson} from '../../../common/utils/fetch-json'

interface AlertPrioritizationCopilotPromptExperimentBannerProps {
  isExperimentInProgress?: boolean
}

export default function AlertPrioritizationCopilotPromptExperimentBanner({
  isExperimentInProgress: initIsExperimentInProgress = false,
}: AlertPrioritizationCopilotPromptExperimentBannerProps): JSX.Element {
  const showAlertPrioritizationUi = useFeatureFlag('alert_prioritization_owner_csv_job_ui')
  const paths = usePaths()
  const {logClick} = useClickLogging({category: 'AlertPrioritizationCopilotPromptExperiment'})
  const [isExperimentInProgress, setIsExperimentInProgress] = useState(initIsExperimentInProgress)

  const description = isExperimentInProgress ? (
    <Banner.Description>
      Your experiment is in progress! You will receive an email with the results and instructions once it is complete.
    </Banner.Description>
  ) : (
    <Banner.Description>
      <p>Thank you for participating in this experiment!</p>
      <p>
        Clicking this button will begin a process in which Copilot will gather answers for 4 security-related questions
        about your repositories and email you the results. This process may take multiple hours to complete.
      </p>
      <p>Once you have received the results, please follow the instructions in the email.</p>
    </Banner.Description>
  )

  const onClickPrimaryAction = (): void => {
    logClick({action: 'start the alert prioritization copilot experiment'})
    setIsExperimentInProgress(true)

    tryFetchJson(paths.enqueueAlertPrioritizationCopilotPromptExperimentPath(), {method: 'POST'})
  }

  if (!showAlertPrioritizationUi) return <></>
  return (
    <Banner
      description={description}
      icon={<CopilotIcon />}
      primaryAction={
        !isExperimentInProgress && (
          <Banner.PrimaryAction onClick={onClickPrimaryAction}>Start experiment</Banner.PrimaryAction>
        )
      }
      title="Copilot Experiment"
      variant="upsell"
    />
  )
}
