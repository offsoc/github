import {CommentIcon} from '@primer/octicons-react'
import React, {memo, useCallback, useEffect} from 'react'
import {TreeView} from '@primer/react'
import {PortalTooltip} from '@github-ui/portal-tooltip/portalled'
import type {DiffDelta, DirectoryNode, FileNode} from './diff-file-tree-helpers'
import {parseDiffHash} from '@github-ui/diff-lines/document-hash-helpers'
import {getFileTree} from './diff-file-tree-helpers'
import {FileStatusIcon} from './FileStatusIcon'
import {useFileTreeTooltip} from '@github-ui/use-file-tree-tooltip'
import {GlobalCommands} from '@github-ui/ui-commands'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

interface FileProps {
  file: FileNode<DiffDelta>
  depth: number
  onSelect?(file: DiffDelta): void
  hash: string
}

const File = memo(function File({file, depth, hash, onSelect}: FileProps) {
  const rowRef = React.useRef<HTMLElement>(null)
  const showTooltip = useFileTreeTooltip({focusRowRef: rowRef, mouseRowRef: rowRef})

  const totalCommentsCount = file.diff.totalCommentsCount ?? 0
  const totalAnnotationsCount = file.diff.totalAnnotationsCount ?? 0
  const totalCommentsAndAnnotationsCount = totalCommentsCount + totalAnnotationsCount

  const navigateWindowPanes = useCallback(() => {
    if (rowRef.current?.tabIndex === 0) {
      rowRef.current?.focus()
    }
  }, [rowRef])

  return (
    <>
      <GlobalCommands commands={{'pull-requests-diff-file-tree:focus-file-tree': navigateWindowPanes}} />
      <TreeView.Item
        defaultExpanded
        aria-level={depth}
        current={file.diff.pathDigest === hash}
        id={file.diff.path}
        onSelect={() => onSelect?.(file.diff)}
        ref={rowRef}
      >
        <TreeView.LeadingVisual>
          <FileStatusIcon status={file.diff.changeType} />
        </TreeView.LeadingVisual>
        {file.fileName}
        {showTooltip && (
          <PortalTooltip
            data-testid={`${file.fileName}-item-tooltip`}
            id={`${file.fileName}-item-tooltip`}
            contentRef={rowRef}
            aria-label={file.fileName}
            open={true}
            direction="ne"
          />
        )}
        {!!totalCommentsAndAnnotationsCount && (
          <span className="sr-only">
            has {totalCommentsAndAnnotationsCount < 10 ? totalCommentsAndAnnotationsCount : '9+'}{' '}
            {totalCommentsAndAnnotationsCount > 1 ? 'comments' : 'comment'}
          </span>
        )}
        {/* Don't show the unresolved comment and annotation count if it's 0 */}
        {!!totalCommentsAndAnnotationsCount && (
          <TreeView.TrailingVisual>
            <div className="d-flex flex-items-center flex-row">
              <CommentIcon />
              <div className="ml-1 text-bold fgColor-default f6">
                {totalCommentsAndAnnotationsCount < 10 ? totalCommentsAndAnnotationsCount : '9+'}
              </div>
            </div>
          </TreeView.TrailingVisual>
        )}
      </TreeView.Item>
    </>
  )
})

interface DirectoryProps extends Pick<FileProps, 'onSelect'> {
  directory: DirectoryNode<DiffDelta>
  depth?: number
  leadingPath?: string
}

function Directory({directory, depth = 0, leadingPath = '', ...fileProps}: DirectoryProps): JSX.Element {
  const pathPrefix = leadingPath ? `${leadingPath}/` : ''
  const [hash, setHash] = React.useState<string>('')
  const rowRef = React.useRef<HTMLElement | null>(null)

  const onHashChange = useCallback(() => {
    const windowHash = parseDiffHash(ssrSafeLocation.hash ?? '') ?? ''
    const hashWithoutPrefix = windowHash.replace('diff-', '')
    setHash(hashWithoutPrefix)
  }, [setHash])

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [onHashChange])

  // Using listItemRef to fix a bug where two tooltips will stay rendered at the same time
  const listItemRef = React.useRef<HTMLElement>(null)
  const showTooltip = useFileTreeTooltip({focusRowRef: listItemRef, mouseRowRef: rowRef})

  const navigateWindowPanes = useCallback(() => {
    /** Primer uses useRovingTabIndex to manage tabIndex for keyboard navigation
     *  Because of this, we can use tabIndex === 0 to determine which TreeView.Item to move focus back to.
     */
    if (listItemRef.current?.tabIndex === 0) {
      listItemRef.current?.focus()
    }
  }, [listItemRef])

  // collapse this directory if it has no files and only one child directory
  if (!directory.files.length && directory.directories.length === 1) {
    return (
      <>
        {directory.directories.map(subDirectory => (
          <Directory
            key={subDirectory.path}
            /* Set depth to one for top-level directories that are collapsed so that tree styling is applied correctly */
            depth={depth === 0 ? 1 : depth}
            directory={subDirectory}
            leadingPath={`${pathPrefix}${directory.name}`}
            {...fileProps}
          />
        ))}
      </>
    )
  }

  function renderDirectoryContents() {
    return (
      <>
        {directory.files.map(file => {
          return <File key={file.filePath} depth={depth + 1} file={file} hash={hash} {...fileProps} />
        })}
        {directory.directories.map(dir => {
          return <Directory key={dir.path} depth={depth + 1} directory={dir} {...fileProps} />
        })}
      </>
    )
  }

  if (depth === 0) {
    return renderDirectoryContents()
  }

  return (
    <>
      <GlobalCommands commands={{'pull-requests-diff-file-tree:focus-file-tree': navigateWindowPanes}} />
      <TreeView.Item ref={listItemRef} key={directory.path} defaultExpanded id={directory.path}>
        <TreeView.LeadingVisual>
          <TreeView.DirectoryIcon />
        </TreeView.LeadingVisual>
        <span ref={rowRef}>{`${pathPrefix}${directory.name}`}</span>
        {showTooltip && (
          <PortalTooltip
            data-testid={`${directory.name}-directory-item-tooltip`}
            id={`${directory.name}-directory-item-tooltip`}
            contentRef={listItemRef}
            aria-label={`${pathPrefix}${directory.name}`}
            open={true}
            direction="ne"
          />
        )}
        <TreeView.SubTree>{renderDirectoryContents()}</TreeView.SubTree>
      </TreeView.Item>
    </>
  )
}

export interface DiffFileTreeProps extends Pick<FileProps, 'onSelect'> {
  diffs: Readonly<Array<Readonly<DiffDelta>>>
}

export const DiffFileTree = memo(function FileTree({diffs, ...fileProps}: DiffFileTreeProps) {
  const fileTree = getFileTree<DiffDelta>(diffs)

  return (
    <TreeView aria-label="File Tree">
      <Directory directory={fileTree} {...fileProps} />
    </TreeView>
  )
})
