import {FileQueryContext} from '@github-ui/code-view-shared/contexts/FileQueryContext'
import {type FilesPageInfo, FilesPageInfoProvider} from '@github-ui/code-view-shared/contexts/FilesPageInfoContext'
import type {DirectoryItem, ReposFileTreeData} from '@github-ui/code-view-types'
import {CurrentRepositoryProvider, type Repository} from '@github-ui/current-repository'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import type {RefInfo} from '@github-ui/repos-types'
import type React from 'react'
import {type ComponentProps, createRef} from 'react'

import {ReposFileTreePane} from '../components/ReposFileTreePane'

export const sampleItems = {
  src: {
    name: 'src',
    contentType: 'directory',
    hasSimplifiedPath: false,
    path: 'src',
    totalCount: 1,
  } as DirectoryItem,

  readme: {
    name: 'readme',
    contentType: 'file',
    hasSimplifiedPath: false,
    path: 'readme',
  } as DirectoryItem,

  app: {
    name: 'app',
    contentType: 'file',
    hasSimplifiedPath: false,
    path: 'src/app',
    totalCount: 1,
  } as DirectoryItem,
}

const treeSampleData = {
  '': {
    items: [sampleItems.src, sampleItems.readme],
    totalCount: 2,
  },
  src: {
    items: [sampleItems.app],
    totalCount: 1,
  },
}
const treeSampleRootItems = [
  {items: [{items: [], data: sampleItems.app}], data: sampleItems.src},
  {items: [], data: sampleItems.readme},
]

export const sampleTreeProps = {
  data: treeSampleData,
  rootItems: treeSampleRootItems,
  setRootItems: () => undefined,
  loading: false,
  fetchError: false,
  processingTime: 10,
  isOverview: false,
  getItemUrl: () => 'any-url',
}

export function Wrap({children, path}: React.PropsWithChildren<{path: string}>) {
  const repo = {name: 'repo', ownerLogin: 'owner'} as Repository
  const refInfo = {name: 'main', currentOid: '2dead2be'} as RefInfo
  const infoProps = {refInfo, path, action: 'tree'} as FilesPageInfo
  return (
    <CurrentRepositoryProvider repository={repo}>
      <FilesPageInfoProvider {...infoProps}>{children}</FilesPageInfoProvider>
    </CurrentRepositoryProvider>
  )
}

export function buildTreeComponent(
  data: ReposFileTreeData,
  path = 'src/app',
  props: Partial<ComponentProps<typeof ReposFileTreePane>> = {},
) {
  return (
    <WrapPane path={path}>
      <ReposFileTreePane {...defaultPaneProps} fileTree={data} {...props} />
    </WrapPane>
  )
}

export function WrapPane({
  children,
  path,
  query,
  setQuery,
}: React.PropsWithChildren<{path: string; query?: string; setQuery?: (query: string) => void}>) {
  const repo = {name: 'repo', ownerLogin: 'owner'} as Repository
  const refInfo = {name: 'main', currentOid: '2dead2be'} as RefInfo
  const infoProps = {refInfo, path, action: 'tree'} as FilesPageInfo
  const noop = () => {}
  return (
    <AppPayloadContext.Provider value={{}}>
      <CurrentRepositoryProvider repository={repo}>
        <FileQueryContext.Provider value={{query: query || '', setQuery: setQuery || noop}}>
          <FilesPageInfoProvider {...infoProps}>{children}</FilesPageInfoProvider>
        </FileQueryContext.Provider>
      </CurrentRepositoryProvider>
    </AppPayloadContext.Provider>
  )
}

export const defaultPaneProps = {
  id: 'file-tree-pane',
  isFilePath: false,
  showTree: true,
  treeToggleElement: <></>,
  treeToggleRef: createRef<HTMLButtonElement>(),
  onItemSelected: () => undefined,
  foldersToFetch: [],
  processingTime: 1,
  path: 'a/b/c.txt',
  repo: createRepository({name: 'b', ownerLogin: 'a'}),
  refInfo: {
    name: 'main',
    canEdit: true,
    currentOid: '2dead2be',
    listCacheKey: '',
  },
  onFeedbackLinkClick: () => undefined,
  isOverview: false,
  showBranchInfobar: false,
  searchBoxRef: createRef<HTMLInputElement>(),
  query: '',
  setQuery: () => undefined,
  onFindFilesShortcut: () => undefined,
  collapseTree: () => undefined,
  textAreaId: 'text-area-id',
  findFileWorkerPath: 'mock',
}
