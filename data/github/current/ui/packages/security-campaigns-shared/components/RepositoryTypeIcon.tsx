import {LockIcon, MirrorIcon, RepoForkedIcon, RepoIcon} from '@primer/octicons-react'

export type RepositoryTypeIconProps = {
  typeIcon?: 'repo' | 'lock' | 'repo-forked' | 'mirror' | string
  size: number
}

export const RepositoryTypeIcon = ({typeIcon, size}: RepositoryTypeIconProps) => {
  switch (typeIcon) {
    case 'repo':
      return <RepoIcon size={size} />
    case 'lock':
      return <LockIcon size={size} />
    case 'repo-forked':
      return <RepoForkedIcon size={size} />
    case 'mirror':
      return <MirrorIcon size={size} />
    default:
      throw new Error(`Unsupported repository icon ${typeIcon}`)
  }
}
