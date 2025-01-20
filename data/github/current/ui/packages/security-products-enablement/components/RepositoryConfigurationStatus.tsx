import type React from 'react'
import {AlertIcon, ClockIcon, ShieldIcon, type Icon} from '@primer/octicons-react'
import {Button, Octicon, Text} from '@primer/react'
import {SecurityConfigurationStatus, type Repository} from '../security-products-enablement-types'
import {useRepositoryContext} from '../contexts/RepositoryContext'
import {ENABLEMENT_FAILURES_MAP} from '../utils/helpers'
import {useState} from 'react'
import FailureReasonDialog from './FailureReasonDialog'

interface RepositoryConfigurationStatusProps {
  repository: Repository
}

const leadingIconWithLabelMap: {
  [status in Exclude<SecurityConfigurationStatus, 'attached'>]: {
    icon: Icon
    label: string
  }
} = {
  attaching: {icon: ClockIcon, label: 'Applying'},
  removed: {icon: AlertIcon, label: 'Removed'},
  removed_by_enterprise: {icon: AlertIcon, label: 'Enterprise removed'},
  failed: {icon: AlertIcon, label: 'Failed'},
  updating: {icon: ClockIcon, label: 'Updating'},
  enforced: {icon: ShieldIcon, label: 'Enforced'},
}

const leadingIconWithLabel = (status: SecurityConfigurationStatus) => {
  if (status === SecurityConfigurationStatus.Attached) return null

  const {icon, label} = leadingIconWithLabelMap[status]

  return (
    <>
      <Octicon icon={icon} className="pr-1" /> {label}
    </>
  )
}

const failureText = (failureReason: string) => {
  const reason: {frontend_label?: string} | undefined = ENABLEMENT_FAILURES_MAP.get(failureReason)

  return reason && reason['frontend_label'] ? `(${reason['frontend_label']})` : '(Unknown)'
}

const RepositoryConfigurationStatus: React.FC<RepositoryConfigurationStatusProps> = ({repository}) => {
  const {repositories} = useRepositoryContext()
  const repositoryConfig = repositories.find(repo => repo.id === repository.id)?.security_configuration
  const name = repositoryConfig?.name
  const status = repositoryConfig?.status
  const failureReason = repositoryConfig?.failure_reason
  const [showFailureReasonDialog, setShowFailureReasonDialog] = useState(false)
  const failureLabel = failureReason ? failureText(failureReason) : '(Unknown)'

  if (name && status) {
    if (status === SecurityConfigurationStatus.Failed) {
      return (
        <>
          {showFailureReasonDialog && failureReason && (
            <FailureReasonDialog
              reason={failureReason}
              repositoryName={repository.name}
              configurationName={repository.security_configuration?.name || 'This configuration'}
              setShowFailureReasonDialog={setShowFailureReasonDialog}
            />
          )}
          <Button variant="invisible" onClick={() => setShowFailureReasonDialog(true)}>
            <Text sx={{color: 'danger.fg'}}>
              {leadingIconWithLabel(status)} {failureLabel} {name}
            </Text>
          </Button>
        </>
      )
    }

    return (
      <>
        {leadingIconWithLabel(status)} {name}
      </>
    )
  } else if (repository.security_features_enabled) {
    return <>No configuration</>
  } else {
    return <>No security features enabled</>
  }
}

export default RepositoryConfigurationStatus
