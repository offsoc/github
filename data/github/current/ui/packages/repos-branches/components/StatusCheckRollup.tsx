import {Box} from '@primer/react'
import {useCurrentRepository} from '@github-ui/current-repository'
import {ChecksStatusBadge, useCommitChecksStatusDetails} from '@github-ui/commit-checks-status'

export interface StatusCheckRollupProps {
  oid: string
  statusCheckRollup: {
    state: string
    shortText?: string
  }
}

export default function StatusCheckRollup({oid, statusCheckRollup: {state, shortText}}: StatusCheckRollupProps) {
  const repo = useCurrentRepository()
  const [details, fetchDetails] = useCommitChecksStatusDetails(oid, repo)

  let checkStatusCount = ''
  try {
    checkStatusCount = shortText?.split('checks')[0]?.trim() || ''
  } catch {
    //noop
  }

  return (
    <Box sx={{ml: -2}}>
      <ChecksStatusBadge
        statusRollup={state}
        buttonSx={{fontSize: '12px'}}
        combinedStatus={details}
        descriptionText={checkStatusCount}
        onWillOpenPopup={fetchDetails}
      />
    </Box>
  )
}
