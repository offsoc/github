import {Link, useSafeTimeout} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useRef} from 'react'

import type {TitleValueWithContentType} from '../api/columns/contracts/storage'
import {ItemType} from '../api/memex-items/item-type'
import {assertNever} from '../helpers/assert-never'
import {parseTitleDefaultHtml} from '../helpers/parsing'
import type {OpenSidePanelFn} from '../hooks/use-side-panel'
import {type ColumnValue, hasValue} from '../models/column-value'
import {type MemexItemModel, RedactedItemModel} from '../models/memex-item-model'
import {SanitizedHtml} from './dom/sanitized-html'
import {TextCell} from './react_table/cells/text-cell'

type Props = Readonly<{
  currentValue: ColumnValue<TitleValueWithContentType>
  model: MemexItemModel
  isDisabled?: boolean
  /**
   * Temporarily optional to disable the side panel opening interaction,
   * from places like the archive, where it might not be ready to handle interactions
   * yet
   */
  openPane?: OpenSidePanelFn
  onHover?: () => void
}>

const linkStyle: BetterSystemStyleObject = {
  color: 'fg.default',
  overflow: 'hidden',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  textOverflow: 'ellipsis',
  '&.is-disabled': {
    color: 'fg.muted',
  },
  '&:hover': {
    color: 'accent.fg',
  },
  '&:focus, &:focus-visible': {
    // This would normally be an accessibility violation, but in this case we render the link inside a table cell that
    // does have focus styling - so focus state is still indicated visually and this prevents a nested double-outline
    outline: 'none',
  },
}

export function InteractiveItemTitle({model, currentValue, isDisabled, openPane, onHover}: Props) {
  const {safeClearTimeout} = useSafeTimeout()
  const timeoutId = useRef<undefined | number>(undefined)

  const onOpenIssueEditor = useCallback(
    (e: React.MouseEvent) => {
      if (!openPane) return

      if (!(model instanceof RedactedItemModel)) {
        // We use currentTarget here instead of target, because the event handler is
        // on the anchor, but the target of the event is a span inside of the anchor.
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.currentTarget instanceof Element && e.currentTarget.tagName === 'A' && (e.metaKey || e.ctrlKey)) {
          // For meta+click on URLs in the draft issue title follow the url instead of opening the pane
          return
        }

        openPane(model)
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [model, openPane],
  )

  const title = hasValue(currentValue) ? parseTitleDefaultHtml(currentValue.value) : ''
  const onMouseEnter = useCallback(() => {
    if (onHover) {
      onHover()
    }
  }, [onHover])

  switch (model.contentType) {
    case ItemType.RedactedItem:
      return <TextCell isDisabled={isDisabled}>{title}</TextCell>
    case ItemType.DraftIssue: {
      return (
        <TextCell
          sx={{
            '&:hover': {
              color: 'accent.fg',
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
          dangerousHtml={title}
          onClick={onOpenIssueEditor}
          isDisabled={isDisabled}
        />
      )
    }
    case ItemType.PullRequest:
    case ItemType.Issue: {
      return (
        <Link
          sx={linkStyle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={() => timeoutId.current && safeClearTimeout(timeoutId.current)}
          target="_blank"
          rel="noreferrer"
          href={model.content.url}
          className={isDisabled ? 'is-disabled' : undefined}
          onClick={model.contentType === ItemType.Issue ? onOpenIssueEditor : undefined}
          tabIndex={-1}
        >
          <SanitizedHtml>{title}</SanitizedHtml>
        </Link>
      )
    }
    default:
      assertNever(model)
  }
}
