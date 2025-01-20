import {Box, Octicon, Spinner} from '@primer/react'
import {CheckIcon} from '@primer/octicons-react'

import {ImportStatusMessage} from '../components/ImportStatusMessage'
import {Status} from '../enums/statuses'

interface ProgressViewProps {
  migrationStatus: Status
}

export function ProgressView({migrationStatus}: ProgressViewProps) {
  const migrationSucceeded = migrationStatus === Status.Succeeded

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {!migrationSucceeded ? (
        <Spinner
          sx={{
            my: 5,
          }}
          size="large"
          data-testid="in-progress-spinner"
        />
      ) : (
        <Octicon icon={CheckIcon} className="anim-fade-in" size="large" sx={{color: 'success.emphasis', my: 5}} />
      )}
      <ImportStatusMessage status={migrationStatus} />
    </Box>
  )
}
