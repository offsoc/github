import {ChecksStatusBadge, useCommitChecksStatusDetails} from '@github-ui/commit-checks-status'
import {useCurrentRepository} from '@github-ui/current-repository'

interface Props {
  oid: string
  status: string | undefined
}

export function ReposChecksStatusBadge({status, oid}: Props) {
  const repo = useCurrentRepository()
  const [details, fetchDetails] = useCommitChecksStatusDetails(oid, repo)

  return status ? (
    <ChecksStatusBadge statusRollup={status} combinedStatus={details} onWillOpenPopup={fetchDetails} size="small" />
  ) : null
}
