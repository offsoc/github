import {useFilesPageInfo} from '../../../contexts/FilesPageInfoContext'
import type {DirectoryItem} from '@github-ui/code-view-types'
import {Link} from '@github-ui/react-core/link'
import type {Commit} from '@github-ui/repos-types'
import {ScreenReaderHeading} from '@github-ui/screen-reader-heading'
import {ScreenSize} from '@github-ui/screen-size'
import {FileDirectoryFillIcon} from '@primer/octicons-react'
import {Box, Link as PrimerLink, Octicon} from '@primer/react'
import React from 'react'

import {useFocusHintContext} from '@github-ui/focus-hint-context'
import {CommitAgeCell, CommitMessageCell, IconCell, NameCell} from './Cells'
import {Row} from './Table'

interface DirectoryRowProps {
  initialFocus: boolean
  commit?: Commit
  item: DirectoryItem
  onNavigate?: React.MouseEventHandler<HTMLAnchorElement>
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  getItemUrl: (item: DirectoryItem) => string
  navigate: (to: string) => void
  index: number
  className?: string
}

function WrappedDirectoryRow({
  initialFocus,
  item,
  commit,
  onNavigate,
  getItemUrl,
  navigate,
  index,
  className,
}: DirectoryRowProps) {
  const onClickHandler = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // on small screens, we want the whole row to be clickable
      // so if the screen is small, navigate away
      if (window.innerWidth < ScreenSize.small && !e.defaultPrevented) {
        if (item.contentType === 'submodule') {
          if (item.submoduleUrl) {
            navigate(item.submoduleUrl)
          }
        } else {
          navigate(getItemUrl(item))
        }
      }
    },
    [item, getItemUrl, navigate],
  )

  // We can render up to 1000 <DirectoryRows> on a page, and we get a significant perf improvement
  // by avoiding <Box> and using styles in CSS instead of JS. Please do not regress this.
  const RowContent = () => (
    <tr className={`react-directory-row ${className}`} onClick={onClickHandler} id={`folder-row-${index}`}>
      <td className="react-directory-row-name-cell-small-screen" colSpan={2}>
        <div className="react-directory-filename-column">
          <IconCell item={item} />
          <NameCell initialFocus={initialFocus} item={item} getItemUrl={getItemUrl} onNavigate={onNavigate} />
        </div>
      </td>
      <td className="react-directory-row-name-cell-large-screen" colSpan={1}>
        <div className="react-directory-filename-column">
          <IconCell item={item} />
          <NameCell initialFocus={initialFocus} item={item} getItemUrl={getItemUrl} onNavigate={onNavigate} />
        </div>
      </td>
      <td className="react-directory-row-commit-cell">
        <CommitMessageCell commit={commit} />
      </td>
      <td>
        <CommitAgeCell commit={commit} />
      </td>
    </tr>
  )

  // TODO: Make entire row clickable for small screens. In desktop the link will be in the name cell.
  return <RowContent />
}

export const DirectoryRow = React.memo(WrappedDirectoryRow)

export function GoDirectoryUpRow({
  initialFocus,
  linkTo,
  linkRef,
  navigate,
}: {
  initialFocus: boolean
  linkTo: string
  linkRef?: React.RefObject<HTMLAnchorElement>
  navigate: (to: string) => void
}) {
  const {setFocusHint} = useFocusHintContext()
  const {path} = useFilesPageInfo()

  const onClickHandler = React.useCallback(() => {
    // on small screens, we want the whole row to be clickable
    // so if the screen is small, navigate away
    const isSmallScreen = window.innerWidth < ScreenSize.medium
    if (isSmallScreen) {
      navigate(linkTo)
    }
  }, [linkTo, navigate])

  return (
    <Row onClick={onClickHandler} id={`folder-row-0`}>
      <td colSpan={3} className="f5 text-normal px-3">
        <ScreenReaderHeading as="h3" text="parent directory" />
        <PrimerLink
          aria-label="Parent directory"
          data-react-autofocus={initialFocus ? true : null}
          data-testid="up-tree"
          as={Link}
          muted={true}
          onClick={() => {
            setFocusHint(path)
          }}
          ref={linkRef}
          rel="nofollow"
          sx={{
            fontWeight: 'bold',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {textDecoration: 'none'},
            '&:focus:focus-visible div': {
              outline: '2px solid var(--focus-outlineColor, var(--color-accent-fg))',
              outlineOffset: '-2px',
            },
          }}
          to={linkTo}
        >
          <Box
            className="width-full"
            sx={{width: 16, textAlign: 'center', letterSpacing: '2px', display: 'flex', alignItems: 'center'}}
          >
            <Octicon
              icon={FileDirectoryFillIcon}
              size="small"
              sx={{color: 'var(--treeViewItem-leadingVisual-iconColor-rest, var(--color-icon-directory))', mr: '10px'}}
            />
            ..
          </Box>
        </PrimerLink>
      </td>
    </Row>
  )
}
