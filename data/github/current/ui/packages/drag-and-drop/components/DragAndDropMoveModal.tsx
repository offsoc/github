import {announce} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {AlertIcon, InfoIcon} from '@primer/octicons-react'
import {Button, Flash, Octicon, useOnOutsideClick} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {clsx} from 'clsx'
import type {FormEvent} from 'react'
import {useEffect, useMemo, useRef, useState} from 'react'

import {useDragAndDrop} from '../hooks/use-drag-and-drop'
import {successfulMoveAnnouncement} from '../utils/announcements'
import {DragAndDropMovingResources, DragAndDropResources} from '../utils/strings'
import {type DragAndDropItem, DragAndDropMoveOptions} from '../utils/types'
import styles from './DragAndDropMoveModal.module.css'
import {MoveModalForm} from './MoveModalForm'

interface DragAndDropMoveModalProps {
  /**
   * Callback to close the dialog
   */
  closeDialog: () => void
}

const errorMessage = (items: DragAndDropItem[], index?: number): string => {
  if (index === undefined) {
    return DragAndDropResources.entryIsRequired
  }
  if (index < 0) {
    return DragAndDropResources.entryLessThanOne
  }
  if (index > items.length) {
    return DragAndDropResources.entryGreaterThanList(items.length)
  }

  return DragAndDropResources.entryIsInvalid
}

const isInvalid = (items: DragAndDropItem[], index?: number) =>
  index === undefined || index < 0 || index >= items.length || isNaN(index)

/**
 * A modal that allows the user to move an item to a new position in the list.
 *
 * @param props DragAndDropMoveModalProps
 */
export const DragAndDropMoveModal = ({closeDialog}: DragAndDropMoveModalProps) => {
  const {moveModalItem} = useDragAndDrop()
  const {title, index: currentIndex} = moveModalItem ?? {title: '', index: -1}
  const [index, setIndex] = useState<number | undefined>()
  const [moveAction, setMoveAction] = useState(DragAndDropMoveOptions.BEFORE)
  const [moveHelpText, setMoveHelpText] = useState(`${title} will be moved ...`)
  const [invalidPosition, setInvalidPosition] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const {moveToPosition, items} = useDragAndDrop()
  const [error, setError] = useState<string | undefined>()
  const formRef = useRef<HTMLInputElement | null>(null)

  const updateHelperText = useMemo(
    () => (idx?: number) => {
      let message = ''

      if (idx === undefined) {
        setInvalidPosition(false)
        message = `${title} will be moved ...`
      } else if (isInvalid(items, idx)) {
        setInvalidPosition(true)
        message = DragAndDropMovingResources.cannotBeMoved(title)
      } else {
        setInvalidPosition(false)
        if (idx === currentIndex && moveAction !== DragAndDropMoveOptions.AFTER) {
          message = DragAndDropMovingResources.itemWillNotBeMoved(title)
        } else if (idx === 0 && moveAction !== DragAndDropMoveOptions.AFTER) {
          message = DragAndDropMovingResources.movedToFirst(title)
        } else if (idx === items.length - 1 && moveAction !== DragAndDropMoveOptions.BEFORE) {
          message = DragAndDropMovingResources.movedToLast(title)
        } else {
          const itemBefore = items[idx - 1]?.title
          const itemAfter = items[idx + 1]?.title
          switch (moveAction) {
            case DragAndDropMoveOptions.BEFORE:
              message = DragAndDropMovingResources.movedBetween(title, itemBefore, items[idx]?.title)
              break
            case DragAndDropMoveOptions.AFTER:
              message = DragAndDropMovingResources.movedBetween(title, items[idx]?.title, itemAfter)
              break
            case DragAndDropMoveOptions.ROW:
              if (idx < currentIndex) {
                message = DragAndDropMovingResources.movedBetween(title, itemBefore, items[idx]?.title)
              } else {
                message = DragAndDropMovingResources.movedBetween(title, items[idx]?.title, itemAfter)
              }
              break
          }
        }
      }
      setMoveHelpText(message)
    },
    [title, items, moveAction, currentIndex],
  )
  const debouncedUpdateHelperText = useDebounce(updateHelperText, 100)

  useEffect(() => {
    if (moveAction !== DragAndDropMoveOptions.ROW) {
      setIndex(undefined)
      setError(undefined)
      debouncedUpdateHelperText()
    } else {
      setIndex(currentIndex)
      setError(undefined)
      debouncedUpdateHelperText(currentIndex)
    }
  }, [moveAction, debouncedUpdateHelperText, currentIndex])

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault() // prevent page reload
    if (index === undefined || isInvalid(items, index)) {
      setError(errorMessage(items, index))
      formRef.current?.focus()
      return
    }
    switch (moveAction) {
      case DragAndDropMoveOptions.ROW:
        if (index >= currentIndex) moveToPosition(currentIndex, index, false)
        else moveToPosition(currentIndex, index, true)
        break
      case DragAndDropMoveOptions.BEFORE:
        moveToPosition(currentIndex, index, true)
        break
      case DragAndDropMoveOptions.AFTER:
      default:
        moveToPosition(currentIndex, index, false)
        break
    }
    closeDialog()
    successfulMoveAnnouncement({
      newIndex: index,
      currentIndex,
      items,
      title,
    })
  }

  // Dialog doesn't use Overlay or call `useOnOutsideClick` under the hood. This means that
  // it doesn't get registered as an overlay in the stack, which means it doesn't intercept
  // and stop propagating clicks. This means that if there are any open `Overlay`s underneath
  // this `Dialog`, clicks in this dialog will register as clicks outside of those overlays,
  // causing them to try to close.
  // We can prevent this by registering a fake `useOnClickOutside` hook to make this look like
  // a regular `Overlay`. Clicks inside will no-op and the hook will prevent them from propagating
  // to other overlays; clicks outside need to have `preventDefault` called on them to stop them
  // from propagating.
  useOnOutsideClick({containerRef, onClickOutside: e => e.preventDefault()})

  return (
    <Dialog
      title={<span className={clsx(styles.title)}>Move selected item</span>}
      onClose={() => {
        closeDialog()
        announce(DragAndDropResources.cancelMove(title), {assertive: true})
      }}
      width="large"
      ref={containerRef}
      renderBody={() => (
        // By default there is no way to wrap the footer and body in one element, so we
        // have to custom-render the footer inside the body. Otherwise we can't use `submit`
        // button to submit the form
        <form
          onSubmit={onSubmit}
          {...testIdProps('move-modal-form')}
          // Stopping blur propagation fixes a bug where the table thinks the cell editor was
          // blurred when it was really an input inside this dialog.
          onBlur={e => e.stopPropagation()}
          className={clsx(styles.form)}
          noValidate
        >
          <Dialog.Body className={clsx(styles.dialogBody)}>
            <div className={clsx(styles.dialogTitle)}>
              <span className="text-bold">Item</span>
              <span>{title}</span>
            </div>
            <MoveModalForm
              options={items}
              onPositionChange={i => {
                setIndex(i)
                setError(undefined)
                debouncedUpdateHelperText(i)
              }}
              initialPosition={currentIndex + 1}
              moveAction={moveAction}
              onMoveActionChange={setMoveAction}
              error={error}
              ref={formRef}
            />
            <Flash
              aria-live="assertive"
              variant={invalidPosition ? 'warning' : 'default'}
              {...testIdProps('drag-and-drop-move-modal-flash')}
            >
              <Octicon icon={invalidPosition ? AlertIcon : InfoIcon} className="fgColor-accent" />
              {moveHelpText}
            </Flash>
          </Dialog.Body>

          <Dialog.Footer className="p-2">
            <Button type="submit" variant="primary" {...testIdProps('drag-and-drop-move-modal-move-item-button')}>
              Move item
            </Button>
          </Dialog.Footer>
        </form>
      )}
    />
  )
}
