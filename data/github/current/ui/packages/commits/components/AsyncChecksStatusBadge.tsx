import {ChecksStatusBadge, useCommitChecksStatusDetails} from '@github-ui/commit-checks-status'
import type {RepositoryNWO} from '@github-ui/current-repository'

interface Props {
  oid: string
  status: string | undefined
  repo: RepositoryNWO
  descriptionString?: string
  badgeProps?: Omit<
    React.ComponentProps<typeof ChecksStatusBadge>,
    'statusRollup' | 'combinedStatus' | 'onWillOpenPopup' | 'disablePopover'
  >
}

export function AsyncChecksStatusBadge({status, oid, repo, badgeProps = {}, descriptionString = ''}: Props) {
  const [details, fetchDetails] = useCommitChecksStatusDetails(oid, repo)

  return status ? (
    <ChecksStatusBadge
      disablePopover={false}
      size={'small'}
      statusRollup={status}
      buttonSx={{height: '18px', color: 'fg.muted', p: '2px'}}
      combinedStatus={details}
      descriptionText={descriptionString}
      onWillOpenPopup={fetchDetails}
      {...badgeProps}
    />
  ) : null
}
