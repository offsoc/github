import {RepositoryTypeIcon} from './RepositoryTypeIcon'

export type RepositoryLabelProps = {
  // We only need the name and typeIcon properties, so we shouldn't depend on a specific Repository type
  name: string
  typeIcon?: 'repo' | 'lock' | 'repo-forked' | 'mirror' | string
}

export const RepositoryLabel = ({name, typeIcon}: RepositoryLabelProps) => {
  return (
    <>
      <RepositoryTypeIcon typeIcon={typeIcon} size={16} /> &nbsp; {name}
    </>
  )
}
