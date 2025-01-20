import {FilesPageInfoProvider} from '@github-ui/code-view-shared/contexts/FilesPageInfoContext'
import {CurrentRepositoryProvider, type Repository} from '@github-ui/current-repository'
import {FileTreeControlProvider} from '@github-ui/repos-file-tree-view'
import type {ComponentProps, PropsWithChildren} from 'react'

import {FilesContextProvider} from '../contexts/FilesContext'
import {getCopilotTaskRoutePayload} from './mock-data'

export function TestComponentWrapper({
  children,
  refInfo,
  repo,
}: PropsWithChildren<{
  refInfo?: ComponentProps<typeof FilesPageInfoProvider>['refInfo']
  repo?: Repository
}>) {
  repo = repo ?? ({name: 'repo', ownerLogin: 'owner'} as Repository)
  refInfo = refInfo ?? getCopilotTaskRoutePayload().refInfo
  return (
    <FileTreeControlProvider>
      <FilesContextProvider>
        <FilesPageInfoProvider refInfo={refInfo} path="path/to/file" action="blob" copilotAccessAllowed={true}>
          <CurrentRepositoryProvider repository={repo}>{children}</CurrentRepositoryProvider>
        </FilesPageInfoProvider>
      </FilesContextProvider>
    </FileTreeControlProvider>
  )
}
