import {FileAddedIcon, FileIcon, FileMovedIcon, FileRemovedIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'

import type {PatchStatus} from '@github-ui/diff-file-helpers'

export function FileStatusIcon({status}: {status: PatchStatus}): JSX.Element {
  switch (status) {
    case 'ADDED':
    case 'COPIED':
      return <Octicon size={16} icon={FileAddedIcon} className="fgColor-success" />
    case 'DELETED':
    case 'REMOVED':
      return <Octicon size={16} icon={FileRemovedIcon} className="fgColor-danger" />
    case 'RENAMED':
      return <Octicon size={16} icon={FileMovedIcon} className="fgColor-attention" />
    default:
      return <Octicon size={16} icon={FileIcon} className="fgColor-muted" />
  }
}
