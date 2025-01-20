import FileResultsList from '@github-ui/code-view-shared/components/files-search/FileResultsList'
import {AllShortcutsEnabledProvider} from '@github-ui/code-view-shared/contexts/AllShortcutsEnabledContext'
import {useFileQueryContext} from '@github-ui/code-view-shared/contexts/FileQueryContext'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {type TreePane, useFileTreeControlContext} from '@github-ui/repos-file-tree-view'
import {PlusIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Heading, IconButton} from '@primer/react'
import {memo, useCallback} from 'react'
import {Link} from 'react-router-dom'

import {type CopilotTaskBasePayload, FileFilter} from '../utilities/copilot-task-types'
import {fileUrl, newFileUrl} from '../utilities/urls'
import styles from './FileTreeHeader.module.css'

type FileTreeHeaderProps = {
  additionalSearchableFiles: string[]
  currentFilter: FileFilter
  onAddFileClick: () => void
  onSetCurrentFilter: (filter: FileFilter) => void
} & Pick<TreePane, 'isTreeExpanded' | 'treeToggleElement'>

export const FileTreeHeader = memo(function FileTreeHeader({
  additionalSearchableFiles,
  currentFilter,
  isTreeExpanded,
  onAddFileClick,
  onSetCurrentFilter,
  treeToggleElement,
}: FileTreeHeaderProps) {
  const {findFileWorkerPath, pullRequest} = useRoutePayload<CopilotTaskBasePayload>()
  const repo = useCurrentRepository()
  const {setExpandAllFolders, setRefreshTree, setShouldFetchFolders} = useFileTreeControlContext()
  const {setQuery} = useFileQueryContext()

  const getItemUrl = useCallback(
    (path: string) => {
      return fileUrl({
        owner: repo.ownerLogin,
        repo: repo.name,
        path,
        pullNumber: pullRequest.number,
      })
    },
    [pullRequest.number, repo.name, repo.ownerLogin],
  )

  return (
    <div className="d-flex flex-column width-full">
      <div className="d-flex flex-row flex-justify-between flex-items-center width-full border-bottom py-2 pl-3 pr-2">
        <Heading as="h2" className="f5">
          Files
        </Heading>
        {isTreeExpanded && treeToggleElement}
      </div>
      <div className="d-flex flex-row width-full px-3 pt-3 gap-2">
        <ActionMenu>
          <ActionMenu.Button className={styles.fileTreeModeButton}>{currentFilter}</ActionMenu.Button>
          <ActionMenu.Overlay width="medium">
            <ActionList>
              <ActionList.Item
                onSelect={() => {
                  onSetCurrentFilter(FileFilter.PR)
                  setRefreshTree?.(true)
                  setShouldFetchFolders?.(false)
                  setExpandAllFolders?.(true)
                }}
              >
                {FileFilter.PR}
              </ActionList.Item>
              <ActionList.Item
                onSelect={() => {
                  onSetCurrentFilter(FileFilter.All)
                  setRefreshTree?.(true)
                  setShouldFetchFolders?.(true)
                  setExpandAllFolders?.(false)
                }}
              >
                {FileFilter.All}
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        <IconButton
          as={Link}
          aria-label="Add a new file"
          className="ml-auto"
          icon={PlusIcon}
          to={newFileUrl({owner: repo.ownerLogin, repo: repo.name, pullNumber: pullRequest.number, location})}
          onClick={onAddFileClick}
        />
      </div>
      {/* Disable file search shortcut for the time being */}
      <AllShortcutsEnabledProvider allShortcutsEnabled={false}>
        <FileResultsList
          actionListSx={{p: 2, pr: 2, pt: 2, mt: 1}}
          additionalResults={additionalSearchableFiles}
          commitOid={pullRequest.headSHA}
          config={{excludeDirectories: true, excludeSeeAllResults: true, useOverlay: true}}
          getItemUrl={getItemUrl}
          findFileWorkerPath={findFileWorkerPath}
          sx={{ml: 3, mr: 3, mt: 2}}
          onItemSelected={() => {
            setQuery('')
          }}
        />
      </AllShortcutsEnabledProvider>
    </div>
  )
})
