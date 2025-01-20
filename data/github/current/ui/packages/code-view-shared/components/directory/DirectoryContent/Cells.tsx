import {SkeletonText} from '../../Skeleton'
import type {DirectoryItem} from '@github-ui/code-view-types'
import {Link} from '@github-ui/react-core/link'
import type {Commit} from '@github-ui/repos-types'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import {FileDirectoryFillIcon, FileIcon, FileSubmoduleIcon} from '@primer/octicons-react'
import {Link as PrimerLink, RelativeTime} from '@primer/react'
import type React from 'react'

interface ItemCellProps {
  item: DirectoryItem
}

interface NameItemCellProps extends ItemCellProps {
  getItemUrl: (item: DirectoryItem) => string
  onNavigate?: React.MouseEventHandler<HTMLAnchorElement>
  initialFocus: boolean
}

const contentTypeLabels: Record<string, string> = {
  directory: 'Directory',
  submodule: 'Submodule',
  ['symlink_directory']: 'Symlink to directory',
  ['symlink_file']: 'Symlink to file',
}

function getContentTypeLabel({contentType}: DirectoryItem) {
  return `(${contentTypeLabels[contentType] || 'File'})`
}

export function IconCell({item}: ItemCellProps) {
  // We can render up to 1000 <IconCell> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  switch (item.contentType) {
    case 'directory':
      return <FileDirectoryFillIcon className="icon-directory" />
    case 'submodule':
      return <FileSubmoduleIcon className="icon-directory" />
    case 'symlink_directory':
    case 'symlink_file':
      return <FileSubmoduleIcon className="icon-directory" />
    default:
      return <FileIcon className="color-fg-muted" />
  }
}

export function NameCell({initialFocus, item, getItemUrl, onNavigate}: NameItemCellProps) {
  let itemUrl = getItemUrl(item)
  const tooltipText = item.hasSimplifiedPath ? 'This path skips through empty directories' : item.name
  if (item.contentType === 'submodule') {
    itemUrl = item.submoduleUrl ?? itemUrl
    onNavigate = e => {
      // doing a react nav into a different repo doesn't work great
      e.preventDefault()
      if (item.submoduleUrl) {
        window.location.href = item.submoduleUrl
      }
    }
  }

  // We can render up to 1000 <NameCell> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  return (
    <div className="overflow-hidden">
      <div className="react-directory-filename-cell">
        <div className="react-directory-truncate">
          <Link
            title={tooltipText}
            aria-label={`${item.name}, ${getContentTypeLabel(item)}`}
            className={
              item.contentType !== 'symlink_directory' && item.contentType !== 'symlink_file'
                ? 'Link--primary'
                : undefined
            }
            data-react-autofocus={initialFocus ? true : null}
            onClick={onNavigate}
            to={itemUrl}
          >
            <ItemPathName item={item} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ItemPathName({item}: {item: DirectoryItem}) {
  // We can render up to 1000 <ItemPathName> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  if (item.hasSimplifiedPath) {
    return (
      <>
        {item.name.split('/').map((dirName, index, array) => {
          const isLastItem = index === array.length - 1
          return (
            //should be a classname to get us fg.muted color
            <span
              key={index}
              className={isLastItem ? '' : 'react-directory-default-color'}
              data-testid="path-name-segment"
            >
              {`${dirName}${isLastItem ? '' : '/'}`}
            </span>
          )
        })}
      </>
    )
  }

  return item.submoduleDisplayName ? (
    <span style={{color: 'var(--fgColor-accent, var(--color-accent-fg))'}}>{item.submoduleDisplayName}</span>
  ) : (
    <>{item.name}</>
  )
}

interface CommitCellProps {
  commit?: Commit
}

export function CommitMessageCell({commit}: CommitCellProps) {
  if (!commit) {
    return <SkeletonText />
  }

  // We can render up to 1000 <CommitMessageCell> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  return commit.shortMessageHtmlLink ? (
    <div>
      <SafeHTMLDiv className="react-directory-commit-message" html={commit.shortMessageHtmlLink} />
    </div>
  ) : (
    <PrimerLink className="Link--secondary" href={commit.url}>
      No commit message
    </PrimerLink>
  )
}

export function CommitAgeCell({commit}: CommitCellProps) {
  // TODO: align how Ago labels are "1 year ago" vs "12 month age" etc.
  // We can render up to 1000 <CommitAgeCell> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  return commit?.date ? (
    <div className="react-directory-commit-age">
      {!Number.isNaN(Date.parse(commit.date)) ? <RelativeTime datetime={commit.date} tense="past" /> : 'Invalid date'}
    </div>
  ) : (
    <SkeletonText />
  )
}
