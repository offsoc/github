import type {DirectoryItem, ReposFileTreeData} from '@github-ui/code-view-types'

type DirectoryItemEntry = {items: DirectoryItem[]; totalCount: number}

/**
 * Compare two strings with case-first ordering. ZZZ.txt will come before aaa.txt with this strategy.
 */
function caseFirstCompare(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Given a path, return every directory path and the file name. For example, given 'a/b/c.txt', this function will
 * return {directories: ['a', 'a/b'], name: 'c.txt'}.
 */
function getFileInfo(path: string): {directories: string[]; fileName: string} {
  const pathComponents = path.split('/')
  const fileName = pathComponents.pop()!
  const directories: string[] = []

  let currentPath = pathComponents[0]
  if (currentPath) {
    directories.push(currentPath)
    for (let i = 1; i < pathComponents.length; i++) {
      const pathComponent = pathComponents[i]
      if (pathComponent) {
        currentPath += `/${pathComponents[i]}`
        directories.push(currentPath)
      }
    }
  }

  return {directories, fileName}
}

function addItemToDirectory(currentEntry: DirectoryItemEntry, directoryItem: DirectoryItem): DirectoryItemEntry {
  // noop if the item already exists in the tree
  if (currentEntry.items.some(item => item.path === directoryItem.path)) return currentEntry

  const items = [...currentEntry.items, directoryItem].sort(compareDirectoryItems)
  const totalCount = currentEntry.totalCount + 1
  return {items, totalCount}
}

/**
 * Compare two DirectoryItems by their name with the following strategy:
 * - Directories come before files
 * - Case-sensitive compare with case-first ordering
 */
export function compareDirectoryItems(a: DirectoryItem, b: DirectoryItem): number {
  if (a.contentType === 'directory' && b.contentType === 'file') return -1
  if (a.contentType === 'file' && b.contentType === 'directory') return 1
  return caseFirstCompare(a.name, b.name)
}

/**
 * Add a file to the file tree data. This function will mutate the file tree data in place.
 *
 * @param fileTreeData Existing file tree data
 * @param path Path of the file to insert into the file tree
 * @param insertFullPath If true, the full file will be inserted into the file tree. If false, insert the file if it
 * exists at a directory path that already exists. Otherwise, insert the first directory that doesn't exist so the user
 * can expand it.
 * @returns void - the file tree data is mutated in place
 */
export function addPathToTree(fileTreeData: ReposFileTreeData, path: string, insertFullPath = false) {
  const {directories, fileName} = getFileInfo(path)
  directories.unshift('') // add root directory
  const filePath = directories[directories.length - 1]!

  const fileItem: DirectoryItem = {
    contentType: 'file',
    name: fileName,
    path,
  }

  // work backwards to find the first existing directory we can add the new file to
  let existingDirectory: {items: DirectoryItem[]; totalCount: number} | undefined
  let existingDirectoryPath: string | undefined
  for (let i = directories.length - 1; i >= 0; i--) {
    const directory = directories[i]!
    if (fileTreeData[directory]) {
      existingDirectory = fileTreeData[directory]
      existingDirectoryPath = directory
      break
    }
  }

  if (!existingDirectory || existingDirectoryPath === undefined) return

  if (existingDirectoryPath === filePath) {
    // Just add the file to the existing directory
    fileTreeData[existingDirectoryPath] = addItemToDirectory(existingDirectory, fileItem)
  } else if (insertFullPath) {
    // Create a new directory and add the file to it
    const newDirectoryPath = filePath
    const newDirectoryName = newDirectoryPath.substring(existingDirectoryPath ? existingDirectoryPath.length + 1 : 0)
    const directoryItem: DirectoryItem = {
      contentType: 'directory',
      name: newDirectoryName,
      path: newDirectoryPath,
      // let the file tree handle breaking the path into individual directories
      hasSimplifiedPath: newDirectoryName.includes('/'),
    }

    fileTreeData[existingDirectoryPath] = addItemToDirectory(existingDirectory, directoryItem)
    fileTreeData[newDirectoryPath] = {items: [fileItem], totalCount: 1}
  } else {
    // Create a new empty directory that can be expanded by the user
    const existingItems = fileTreeData[existingDirectoryPath]!.items
    const relativePath = existingDirectoryPath ? filePath.slice(existingDirectoryPath.length + 1) : filePath
    const nextDirectoryIndex = relativePath.indexOf('/')
    const newName = nextDirectoryIndex > 0 ? relativePath.slice(0, nextDirectoryIndex) : relativePath
    const newPath = existingDirectoryPath ? `${existingDirectoryPath}/${newName}` : newName
    if (existingItems && existingItems.some(item => item.path === path)) {
      return
    }

    const directoryItem: DirectoryItem = {
      contentType: path === filePath ? 'file' : 'directory',
      name: newName,
      path: newPath,
      isClientOnly: true,
    }

    fileTreeData[existingDirectoryPath] = addItemToDirectory(existingDirectory, directoryItem)
  }
}

/**
 * Remove a file from the file tree data. This function will mutate the file tree data in place.
 *
 * @param fileTreeData Existing file tree data
 * @param path Path of the file to remove from the file tree
 */
export function removePathFromTree(fileTreeData: ReposFileTreeData, path: string): void {
  for (const key of Object.keys(fileTreeData)) {
    const entry = fileTreeData[key]!

    const items = entry.items.filter(item => item.path !== path)
    fileTreeData[key] = {items, totalCount: entry.totalCount - 1}
  }
}
