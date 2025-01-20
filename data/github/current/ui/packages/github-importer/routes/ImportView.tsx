import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box} from '@primer/react'
import {useAlive} from '@github-ui/use-alive'
import {useEffect, useState, useCallback} from 'react'

import {ImportHeader} from '../components/ImportHeader'
import {ErrorView} from '../components/ErrorView'
import {ProgressView} from '../components/ProgressView'
import {Status} from '../enums/statuses'

// Update this type to reflect the data you place in payload in Rails
export interface ImportViewPayload {
  channel: string
  status: string
  failure_reason: string
  error_details: string[]
}

// This interface should match the data structure being sent to Alive via notify_entity_channel above
interface eventData {
  status: string
  timestamp: string
  failure_reason: string
  error_details: string[]
}

export function ImportView() {
  const payload = useRoutePayload<ImportViewPayload>()
  const aliveChannel = payload.channel
  const initialStatus = payload.status
  const initialFailureReason = payload.failure_reason
  const initialErrorDetails = payload.error_details

  const [migrationStatus, setMigrationStatus] = useState<Status>(Status.Pending)
  const [mostRecentMessageTimestamp, setMostRecentMessageTimestamp] = useState(new Date(0))
  const [migrationFailureReason, setMigrationFailureReason] = useState('')
  const [migrationFailed, setMigrationFailed] = useState(false)
  const [migrationErrorDetails, setMigrationErrorDetails] = useState<string[]>([])

  const updateStatus = (receivedStatus: string, failureReason: string, errorDetails: string[]) => {
    switch (receivedStatus) {
      case 'MIGRATION_STATE_PENDING':
        setMigrationStatus(Status.Pending)
        break
      case 'MIGRATION_STATE_IN_PROGRESS':
        setMigrationStatus(Status.InProgress)
        break
      case 'MIGRATION_STATE_SUCCEEDED':
        setMigrationStatus(Status.Succeeded)
        break
      case 'MIGRATION_STATE_FAILED':
        setMigrationStatus(Status.Failed)
        setMigrationFailureReason(failureReason)
        setMigrationErrorDetails(errorDetails)
        setMigrationFailed(true)
        break
      case 'MIGRATION_STATE_FAILED_VALIDATION':
        setMigrationStatus(Status.FailedValidation)
        setMigrationFailureReason(failureReason)
        setMigrationErrorDetails(errorDetails)
        setMigrationFailed(true)
        break
      default:
        setMigrationStatus(Status.Invalid)
        break
    }
  }

  // We want to update the state upon initial render using the payload's status
  // This will protect us against situations in which we could "miss" an initial Alive message
  useEffect(() => {
    if (initialStatus !== '') {
      updateStatus(initialStatus, initialFailureReason, initialErrorDetails)
    }
  }, [initialStatus, initialFailureReason, initialErrorDetails])

  const handleAliveEvent = useCallback(
    (event: eventData) => {
      const handleIncomingMessage = (
        receivedTimestamp: string,
        status: string,
        failureReason: string,
        errorDetails: string[],
      ) => {
        const aliveMessageTime = new Date(receivedTimestamp)
        if (aliveMessageTime >= mostRecentMessageTimestamp) {
          setMostRecentMessageTimestamp(aliveMessageTime)
          updateStatus(status, failureReason, errorDetails)
        }
      }

      handleIncomingMessage(event.timestamp, event.status, event.failure_reason, event.error_details)
    },
    [mostRecentMessageTimestamp],
  )

  useAlive(aliveChannel, handleAliveEvent)

  return (
    <Box
      sx={{
        my: 5,
        px: 3,
        pb: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: migrationFailed ? 'flex-start' : 'center',
        borderBottomStyle: 'solid',
        borderBottomColor: 'border.muted',
        borderBottomWidth: 1,
      }}
      className="container-md"
    >
      <ImportHeader migrationFailed={migrationFailed} />
      {!migrationFailed ? (
        <ProgressView migrationStatus={migrationStatus} />
      ) : (
        <ErrorView migrationFailureReason={migrationFailureReason} migrationErrorDetails={migrationErrorDetails} />
      )}
    </Box>
  )
}
