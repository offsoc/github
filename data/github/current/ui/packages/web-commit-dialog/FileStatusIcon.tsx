import {DiffRenamedIcon, FileAddedIcon, FileDiffIcon, FileIcon, FileRemovedIcon} from '@primer/octicons-react'

export interface FileStatusIconProps {
  status?: string
}

export const FileStatusIcon = ({status}: FileStatusIconProps) => {
  switch (status) {
    case 'A':
      return <FileAddedIcon className="color-fg-success" />
    case 'D':
      return <FileRemovedIcon className="color-fg-danger" />
    case 'M':
      return <FileDiffIcon className="color-fg-attention" />
    case 'R':
      return <DiffRenamedIcon className="color-fg-muted" />
    default:
      return <FileIcon />
  }
}
