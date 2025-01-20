import {ArchiveIcon, LockIcon, type OcticonProps, RepoForkedIcon, RepoIcon} from '@primer/octicons-react'
import {Octicon, type SxProp} from '@primer/react'

import type {ExtendedRepository} from '../../../api/common-contracts'

interface RepositoryIconProps extends SxProp, Omit<OcticonProps, 'icon' | 'aria-label'> {
  repository: ExtendedRepository
}

export const RepositoryIcon: React.FC<RepositoryIconProps> = ({repository, ...props}) =>
  repository.isArchived ? (
    <Octicon icon={ArchiveIcon} aria-label="Archived repository" {...props} />
  ) : repository.isForked ? (
    <Octicon icon={RepoForkedIcon} aria-label="Forked repository" {...props} />
  ) : repository.isPublic ? (
    <Octicon icon={RepoIcon} aria-label="Public repository" {...props} />
  ) : (
    <Octicon icon={LockIcon} aria-label="Private repository" {...props} />
  )
