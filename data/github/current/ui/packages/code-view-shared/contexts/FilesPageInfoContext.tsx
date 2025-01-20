import type {PageError} from '@github-ui/react-core/app-routing-types'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {RefInfo} from '@github-ui/repos-types'
import React from 'react'

export interface FilesPageInfo {
  refInfo: RefInfo
  path: string
  action: FilesPageAction
  error?: PageError
  copilotAccessAllowed: boolean
}

export type FilesPageAction = 'tree' | 'blob' | 'edit' | 'new' | 'blame'

const FilesPageInfoContext = React.createContext({} as FilesPageInfo)

export function FilesPageInfoProvider({children, ...props}: React.PropsWithChildren<FilesPageInfo>) {
  return <FilesPageInfoContext.Provider value={props}>{children}</FilesPageInfoContext.Provider>
}

export function useFilesPageInfo() {
  return React.useContext(FilesPageInfoContext)
}

interface ReposAppPayload {
  helpUrl: string
  findFileWorkerPath: string
  findInFileWorkerPath: string
  githubDevUrl: string
}

export function useReposAppPayload() {
  return useAppPayload<ReposAppPayload>()
}
