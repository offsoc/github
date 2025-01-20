import {ReplyIcon} from '@primer/octicons-react'
import type {SelectPanelProps} from '@primer/react'
import {LinkButton, SelectPanel} from '@primer/react'
import type {KeyboardEventHandler, RefObject} from 'react'
import {createContext, useContext, useEffect, useImperativeHandle, useState} from 'react'
import {ToolbarButton} from './ToolbarButton'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

export type SavedReply = {
  name: string
  content: string
}

export type SavedRepliesHandle = {
  openMenu: () => void
}

type SavedRepliesContext = null | {
  onSelect: (savedReply: SavedReply) => void
  savedReplies: SavedReply[]
  /** Ref to the button for clicking via keyboard shortcut. */
  ref: RefObject<SavedRepliesHandle>
}

type Item = SelectPanelProps['items'][number]

// SavedRepliesContext is separate from MarkdownEditorContext because the saved replies array is practically guarunteed to change
// on every render. If it was provided in the MarkdownEditorContext, it would cause the whole editor to rerender on every render.
export const SavedRepliesContext = createContext<SavedRepliesContext>(null)

export const SavedRepliesButton = () => {
  const context = useContext(SavedRepliesContext)

  useImperativeHandle(context?.ref, () => ({
    openMenu: () => {
      setOpen(true)
    },
  }))

  const [open, setOpen] = useState(false)
  useEffect(() => setFilter(''), [open])

  const [filter, setFilter] = useState('')

  // there's not much point in memoizing this since the savedReplies array is likely to change on every render
  const items = context?.savedReplies
    .filter(({name}) => name.toLowerCase().includes(filter.toLowerCase()))
    .map(
      (reply, i): Item => ({
        text: reply.name,
        description: reply.content,
        descriptionVariant: 'block',
        trailingVisual: i < 9 ? `Ctrl + ${i + 1}` : undefined,
        sx: {
          // hide the leading visual container since we don't use the checkboxes
          '& [class*=BaseVisualContainer]:first-child': {display: 'none'},
          '& [class*=DescriptionContainer]': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          },
        },
      }),
    )

  const onSelectItem = (item: Item | undefined) => {
    setOpen(false)
    const reply = context?.savedReplies.find(({name}) => name === item?.text)
    if (reply) context?.onSelect(reply)
  }

  const onKeyDown: KeyboardEventHandler = event => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    const keyInt = parseInt(event.key, 10)
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (items && event.ctrlKey && !Number.isNaN(keyInt) && keyInt >= 1 && keyInt <= 9) {
      event.stopPropagation()
      event.preventDefault()
      onSelectItem(items[keyInt - 1])
    }
  }

  return items ? (
    <SelectPanel
      renderAnchor={props => (
        <ToolbarButton
          {...props}
          icon={ReplyIcon}
          aria-label="Add saved reply (Ctrl + .)"
          aria-labelledby={undefined}
        />
      )}
      open={open}
      onOpenChange={setOpen}
      items={items}
      filterValue={filter}
      onFilterChange={setFilter}
      placeholderText="Search saved replies"
      selected={undefined}
      onSelectedChange={(selection: Item | Item[] | undefined) => {
        onSelectItem(Array.isArray(selection) ? selection[0] : selection)
      }}
      overlayProps={{width: 'small', maxHeight: 'small', anchorSide: 'outside-right', onKeyDown}}
      footer={
        <LinkButton size="small" href={getSavedRepliesLink()} block>
          Create new
        </LinkButton>
      }
    />
  ) : (
    <></>
  )
}

function getSavedRepliesLink() {
  return `${ssrSafeLocation.origin}/settings/replies`
}
