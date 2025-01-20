import type {PatchStatus} from '@github-ui/diff-file-helpers'

export type SummaryDelta = {
  readonly path: string
  readonly pathDigest: string
}

export type DiffDelta = SummaryDelta & {
  readonly changeType: PatchStatus
  readonly totalCommentsCount?: number
  readonly totalAnnotationsCount?: number
}

function compareDirectoryNames<T extends SummaryDelta>(a: DirectoryNode<T>, b: DirectoryNode<T>) {
  return a.name.localeCompare(b.name)
}

function compareFileNames<T extends SummaryDelta>(a: FileNode<T>, b: FileNode<T>) {
  return a.fileName!.localeCompare(b.fileName!)
}

function getFileDiff<T extends SummaryDelta>(file: FileNode<T>) {
  return file.diff
}

export class FileNode<T extends SummaryDelta> {
  filePath = this.diff.path
  #pathParts = this.filePath.split('/')
  fileName = this.#pathParts[this.#pathParts.length - 1]
  directoryParts = this.#pathParts.slice(0, this.#pathParts.length - 1)

  constructor(public diff: T) {}
}

export class DirectoryNode<T extends SummaryDelta> {
  directories: Array<DirectoryNode<T>> = []
  files: Array<FileNode<T>> = []

  #directoriesByName = new Map<string, DirectoryNode<T>>()

  constructor(
    public name: string,
    public path: string,
  ) {}

  getOrCreateDirectory(name: string) {
    let directory = this.#directoriesByName.get(name)

    if (!directory) {
      const pathPrefix = this.path ? `${this.path}/` : ''
      directory = new DirectoryNode(name, `${pathPrefix}${name}`)
      this.directories.push(directory)
      this.#directoriesByName.set(name, directory)
    }

    return directory
  }

  sort() {
    this.directories.sort(compareDirectoryNames)
    this.files.sort(compareFileNames)

    for (const subDirectory of this.directories) {
      subDirectory.sort()
    }
  }

  getOrderedDiffs() {
    const diffs = this.files.map(getFileDiff)

    for (const subDirectory of this.directories) {
      diffs.push(...subDirectory.getOrderedDiffs())
    }

    return diffs
  }
}

export function getFileTree<T extends SummaryDelta>(summaryDeltas: readonly T[]): DirectoryNode<T> {
  const baseNode = new DirectoryNode<T>('', '')
  const files = summaryDeltas.map(diff => new FileNode<T>(diff))

  for (const file of files) {
    let directory = baseNode
    for (const directoryPath of file.directoryParts) {
      directory = directory.getOrCreateDirectory(directoryPath)
    }
    directory.files.push(file)
  }

  baseNode.sort()
  return baseNode
}

export function sortDiffEntries<T extends SummaryDelta>(patches: Array<T | null | undefined>): T[] {
  const filteredPatches = patches.filter((patch): patch is T => !!patch)
  const fileTree = getFileTree(filteredPatches)
  return fileTree.getOrderedDiffs()
}
