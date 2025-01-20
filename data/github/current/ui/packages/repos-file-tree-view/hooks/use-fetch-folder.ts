import type {DirectoryItem} from '@github-ui/code-view-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useSafeTimeout} from '@primer/react'
import React from 'react'

import type {dispatchKnownFoldersFunction} from '../contexts/FileTreeContext'
import type {TreeItem} from '../types/tree-item'

type FetchFolderResult = [
  (clientOnlyFilePaths?: string[]) => Promise<void>,
  (folderItems?: Array<TreeItem<DirectoryItem>>, newTotalCount?: number) => void,
  Array<TreeItem<DirectoryItem>>,
  boolean,
  boolean,
  () => void,
  number,
]

/**
 * Given a list of file paths that only exist on the client, returns a list of TreeItem<DirectoryItem> objects that represent
 * the client-only files and directories.
 */
function getClientItemsToInsert(
  currentPath: string,
  clientOnlyFilePaths: string[],
  existingItems?: DirectoryItem[],
): Array<TreeItem<DirectoryItem>> {
  const clientOnlyItemsToInsert: Array<TreeItem<DirectoryItem>> = []
  for (const filePath of clientOnlyFilePaths) {
    if (filePath.startsWith(currentPath)) {
      const relativePath = filePath.slice(currentPath.length + 1)
      const nextDirectoryIndex = relativePath.indexOf('/')
      const name = nextDirectoryIndex > 0 ? relativePath.slice(0, nextDirectoryIndex) : relativePath
      const path = `${currentPath}/${name}`
      if (existingItems && existingItems.some(item => item.path === path)) {
        continue
      }

      const clientOnlyItem: TreeItem<DirectoryItem> = {
        items: [],
        data: {
          contentType: path === filePath ? 'file' : 'directory',
          name,
          path,
          isClientOnly: true,
        },
      }

      clientOnlyItemsToInsert.push(clientOnlyItem)
    }
  }

  return clientOnlyItemsToInsert
}

export default function useFetchFolder(
  directory: TreeItem<DirectoryItem>,
  dispatchKnownFolders: dispatchKnownFoldersFunction,
  getItemUrl: (item: DirectoryItem) => string,
): FetchFolderResult {
  const [items, setItems] = React.useState<Array<TreeItem<DirectoryItem>>>(directory.items)
  const [totalCount, setTotalCount] = React.useState<number>(directory.data.totalCount || 0)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<boolean>(false)
  const {safeSetTimeout} = useSafeTimeout()

  React.useEffect(() => {
    setItems(directory.items)
  }, [directory.items])

  React.useEffect(() => {
    directory.data.totalCount !== undefined && setTotalCount(directory.data.totalCount)
  }, [directory.data.totalCount])

  const clearError = React.useCallback(() => {
    setError(false)
  }, [])

  const incrementallyShowItems = React.useCallback(
    (folderItems?: Array<TreeItem<DirectoryItem>>, newTotalCount?: number) => {
      const newItems = folderItems || [...items]
      setItems(newItems.slice(0, 100))
      safeSetTimeout(() => {
        setItems(newItems)
        if (newTotalCount !== undefined) {
          setTotalCount(newTotalCount)
        }
      }, 1)
    },
    [items, safeSetTimeout],
  )

  const fetchFolder = React.useCallback(
    async (clientOnlyFilePaths?: string[]) => {
      const newKnownFolders = new Map()
      if (!directory.data.isClientOnly) {
        const contentUrl = getItemUrl(directory.data)
        setError(false)
        setLoading(true)
        const start = Date.now()
        const response = await verifiedFetchJSON(`${contentUrl}?noancestors=1`)
        try {
          if (response.ok) {
            const folderPayload = await response.json()
            const folderItems = folderPayload.payload.tree.items.map((payloadItem: DirectoryItem) => {
              const treeItem = {
                items: [],
                data: {...payloadItem},
                autoExpand: payloadItem.contentType === 'directory' && folderPayload.payload.tree.items.length === 1,
              }
              newKnownFolders.set(payloadItem.path, treeItem)
              if (payloadItem.hasSimplifiedPath) {
                const topTreeItem = splitSimplifiedTreeItem(treeItem, payloadItem, newKnownFolders)
                return topTreeItem
              }
              return treeItem
            })

            if (clientOnlyFilePaths) {
              const currentPath = directory.data.path
              const clientOnlyItemsToInsert = getClientItemsToInsert(
                currentPath,
                clientOnlyFilePaths,
                folderPayload.payload.tree.items,
              )

              folderItems.push(...clientOnlyItemsToInsert)

              for (const item of clientOnlyItemsToInsert) {
                newKnownFolders.set(item.data.path, item)
              }
            }

            dispatchKnownFolders({
              type: 'add',
              folders: newKnownFolders,
              processingTime: Date.now() - start,
            })
            directory.items = folderItems
            directory.data.totalCount = folderPayload.payload.tree.totalCount
            if (folderItems.length > 100) {
              incrementallyShowItems(folderItems, folderPayload.payload.tree.totalCount)
            } else {
              setItems(folderItems)
              setTotalCount(folderPayload.payload.tree.totalCount)
            }
          } else {
            setError(true)
          }
        } catch {
          setError(true)
        }
      } else if (clientOnlyFilePaths) {
        const currentPath = directory.data.path
        const clientOnlyItemsToInsert = getClientItemsToInsert(currentPath, clientOnlyFilePaths)
        for (const item of clientOnlyItemsToInsert) {
          newKnownFolders.set(item.data.path, item)
        }

        dispatchKnownFolders({
          type: 'add',
          folders: newKnownFolders,
          processingTime: 0,
        })

        if (clientOnlyItemsToInsert.length > 100) {
          incrementallyShowItems(clientOnlyItemsToInsert, clientOnlyItemsToInsert.length)
        } else {
          setItems(clientOnlyItemsToInsert)
          setTotalCount(clientOnlyItemsToInsert.length)
        }
      }

      setLoading(false)
    },
    [getItemUrl, directory, dispatchKnownFolders, incrementallyShowItems],
  )

  return [fetchFolder, incrementallyShowItems, items, loading, error, clearError, totalCount]
}

export function splitSimplifiedTreeItem(
  treeItem: TreeItem<DirectoryItem>,
  payloadItem: DirectoryItem,
  knownFolders: Map<string, TreeItem<DirectoryItem>>,
): TreeItem<DirectoryItem> {
  treeItem.data.name = treeItem.data.name.slice(treeItem.data.name.lastIndexOf('/') + 1, treeItem.data.name.length)
  const topItemName = payloadItem.name.slice(0, payloadItem.name.lastIndexOf('/'))
  const hasSimplifiedPath = topItemName.indexOf('/') > -1
  const topItem = {
    path: payloadItem.path.slice(0, payloadItem.path.lastIndexOf('/')),
    contentType: payloadItem.contentType,
    name: topItemName,
    hasSimplifiedPath,
  }
  const topTreeItem = {
    items: [treeItem],
    data: topItem,
  }
  knownFolders.set(topItem.path, topTreeItem)
  if (hasSimplifiedPath) {
    return splitSimplifiedTreeItem(topTreeItem, {...topItem}, knownFolders)
  } else {
    return topTreeItem
  }
}
