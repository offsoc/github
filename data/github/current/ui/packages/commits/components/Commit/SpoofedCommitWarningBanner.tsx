import {AlertIcon} from '@primer/octicons-react'
import {Flash, Octicon} from '@primer/react'

export function SpoofedCommitWarningBanner() {
  return (
    <Flash variant="warning" className="mb-4">
      <Octicon icon={AlertIcon} className="mr-2" />
      <span className="overflow-hidden">
        This commit does not belong to any branch on this repository, and may belong to a fork outside of the
        repository.
      </span>
    </Flash>
  )
}
