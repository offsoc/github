import type {DirectoryItem} from '@github-ui/code-view-types'
import {createContext, useContext} from 'react'

import type {TreeItem} from '../types/tree-item'

type FileTreeContextType = {
  knownFolders: Map<string, TreeItem<DirectoryItem>>
  dispatchKnownFolders: dispatchKnownFoldersFunction
}

const FileTreeContext = createContext<FileTreeContextType>({
  knownFolders: new Map<string, TreeItem<DirectoryItem>>(),

  dispatchKnownFolders: () => {},
})

export default FileTreeContext

export function useFileTreeContext() {
  return useContext(FileTreeContext)
}

export type dispatchKnownFoldersFunction = React.Dispatch<{
  type: string
  folders: Map<string, TreeItem<DirectoryItem>>
  processingTime: number
}>
