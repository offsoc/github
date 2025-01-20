import {testIdProps} from '@github-ui/test-id-props'
import {Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, memo, useCallback, useRef} from 'react'

import {ItemType} from '../../../api/memex-items/item-type'
import type {SidePanelItem} from '../../../api/memex-items/side-panel-item'
import {parseTitleDefaultHtml} from '../../../helpers/parsing'
import {useBoardSidePanel, useSidePanel} from '../../../hooks/use-side-panel'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {SanitizedHtml} from '../../dom/sanitized-html'

type TitleProps = {
  item: MemexItemModel
  disableFocus: boolean
}

const TITLE_TEXT_SIZE = 1

const baseTextStyles: BetterSystemStyleObject = {
  fontSize: TITLE_TEXT_SIZE,
}

const TitleFunc: React.FC<TitleProps> = ({item, disableFocus}) => {
  const columnData = item.columns

  const html = parseTitleDefaultHtml(columnData.Title)

  const textStyle = {
    '&:hover': {
      textDecoration: 'underline',
      color: 'accent.fg',
    },
  }

  switch (item.contentType) {
    case ItemType.RedactedItem:
      return <SanitizedHtml sx={baseTextStyles}>{html}</SanitizedHtml>
    case ItemType.DraftIssue: {
      return <SidePanelLink item={item} disableFocus={disableFocus} />
    }
    case ItemType.Issue: {
      return <SidePanelLink item={item} disableFocus={disableFocus} />
    }
    case ItemType.PullRequest:
      return html ? (
        <Link
          href={item.content.url}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          sx={{
            code: {fontFamily: 'fonts.mono', fontSize: 0},
            color: 'fg.default',
            textAlign: 'left',
            fontSize: TITLE_TEXT_SIZE,
            ...textStyle,
          }}
          tabIndex={disableFocus ? -1 : 0}
          {...testIdProps('card-title-external-link')}
        >
          <h3 className="d-inline f5 text-normal">
            <SanitizedHtml>{html}</SanitizedHtml>
          </h3>
        </Link>
      ) : null
  }
}

export const Title = memo(TitleFunc)

Title.displayName = 'Title'

const SidePanelLink = forwardRef<HTMLElement, {item: SidePanelItem; disableFocus: boolean}>(
  ({item, disableFocus}, ref) => {
    const html = item.getHtmlTitle()
    const {openProjectItemInPane} = useSidePanel()
    const {openPane} = useBoardSidePanel()
    let href = '#'
    if (item.contentType === ItemType.Issue) {
      href = item.getUrl()
    }
    const linkRef = useRef<HTMLAnchorElement | null>(null)
    const openSidePanel = useCallback(
      (e: React.MouseEvent) => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if ((e.metaKey || e.ctrlKey) && item.contentType !== ItemType.DraftIssue) {
          e.stopPropagation()
          return
        }
        // Return focus to the title link if it has keyboard focus, else return focus to the item card
        if (linkRef?.current === document.activeElement) {
          openProjectItemInPane(item, () => {
            if (linkRef?.current) {
              linkRef.current.focus()
            }
          })
        } else {
          openPane(item)
        }
        e.preventDefault()
      },
      [item, openPane, openProjectItemInPane],
    )
    return (
      <Link
        ref={linkRef}
        role="button"
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={openSidePanel}
        tabIndex={disableFocus ? -1 : 0}
        {...testIdProps('card-side-panel-trigger')}
      >
        <h3 className="d-inline f5 text-normal">
          <SanitizedHtml
            ref={ref}
            sx={{
              code: {
                fontFamily: 'fonts.mono',
                fontSize: 0,
              },
              color: 'fg.default',
              '&:hover': {
                cursor: 'pointer',
                color: 'accent.fg',
                textDecoration: 'underline',
              },
            }}
          >
            {html}
          </SanitizedHtml>
        </h3>
      </Link>
    )
  },
)

SidePanelLink.displayName = 'SidePanelLink'
