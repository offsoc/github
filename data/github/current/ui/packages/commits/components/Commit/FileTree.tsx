import {debounce} from '@github/mini-throttle'
import type {DiffDelta} from '@github-ui/diff-file-tree'
import {DiffFileTree} from '@github-ui/diff-file-tree'
import {type FileFilterBaseProps, FileFilterShared} from '@github-ui/diff-file-tree/file-filter'
import {getCurrentSize, ScreenSize} from '@github-ui/screen-size'
import {type ReactNode, useMemo, useRef, useState} from 'react'

import {useInlineComments} from '../../contexts/InlineCommentsContext'
import type {CommitFile} from '../../types/commit-types'
import {getFileExtension} from '../../utils/get-file-extension'

export const DIFF_FILE_TREE_ID = 'diff_file_tree'

export type PostSelectAction = 'close_tree'

export type FileTreeProps = {
  diffs: CommitFile[]
  onFileSelected: (file: DiffDelta, postSelectAction?: PostSelectAction) => void
  diffsHeader: ReactNode
} & Pick<FileFilterProps, 'onFileExtensionsChange' | 'unselectedFileExtensions'>

export function FileTree({
  diffs,
  onFileSelected,
  diffsHeader,
  unselectedFileExtensions,
  onFileExtensionsChange,
}: FileTreeProps) {
  const [filterText, setFilterText] = useState('')
  const {getCommentCountByPath} = useInlineComments()

  const narrowDiffHeader = useRef<HTMLDivElement>(null)

  const fileExtensions = useMemo(() => new Set(diffs.map(diff => getFileExtension(diff.path))), [diffs])

  let tempDiffs = diffs
  if (unselectedFileExtensions && unselectedFileExtensions.size > 0) {
    tempDiffs = tempDiffs.filter(diffEntry => !unselectedFileExtensions.has(getFileExtension(diffEntry.path)))
  }

  const filteredDiffs = (
    filterText ? tempDiffs.filter(diff => diff.path.toLowerCase().includes(filterText.toLowerCase())) : tempDiffs
  ).map(diff => {
    const commentCount = getCommentCountByPath(diff.path)

    return {
      ...diff,
      totalCommentsCount: commentCount ?? 0,
    }
  })

  const onSelect = (file: DiffDelta) => {
    // we can do this since the onselect is on the client
    const currentSize = getCurrentSize(window.innerWidth)
    const isNarrowBreakpoint = currentSize <= ScreenSize.medium
    const postSelectAction: PostSelectAction | undefined = isNarrowBreakpoint ? 'close_tree' : undefined
    onFileSelected(file, postSelectAction)
  }

  return (
    <div className="d-flex flex-column gap-2" id={DIFF_FILE_TREE_ID}>
      <h2 className="sr-only">File tree</h2>
      <div className="d-md-none" ref={narrowDiffHeader}>
        {diffsHeader}
      </div>
      <FileFilter
        filterText={filterText}
        onFilterTextChange={setFilterText}
        fileExtensions={fileExtensions}
        unselectedFileExtensions={unselectedFileExtensions}
        onFileExtensionsChange={onFileExtensionsChange}
      />
      <DiffFileTree diffs={filteredDiffs} onSelect={onSelect} />
    </div>
  )
}

type FileFilterProps = {
  onFilterTextChange(filterText: string): void
  onFileExtensionsChange(type: 'selectFileExtension' | 'unselectFileExtension', extension: string): void
} & Omit<FileFilterBaseProps, 'onFilterChange'>

function FileFilter({
  filterText,
  onFilterTextChange,
  fileExtensions,
  unselectedFileExtensions,
  onFileExtensionsChange,
}: FileFilterProps) {
  const debouncedOnSearch = useRef(debounce((newQuery: string) => onFilterTextChange(newQuery), 250))

  const onFilterChange = (
    type: 'selectFileExtension' | 'unselectFileExtension',
    payload: {
      extension: string
    },
  ) => {
    onFileExtensionsChange(type, payload.extension)
  }

  return (
    <FileFilterShared
      filterText={filterText}
      fileExtensions={fileExtensions}
      unselectedFileExtensions={unselectedFileExtensions}
      onFilterTextChange={text => debouncedOnSearch.current(text)}
      onFilterChange={onFilterChange}
    />
  )
}
