import type {KeyboardCodes} from '@dnd-kit/core'
import {KeyboardKey} from '@github-ui/keyboard-key'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {Button, Checkbox, FormControl} from '@primer/react'
import type {DialogProps} from '@primer/react/experimental'
import {Dialog} from '@primer/react/experimental'
import {clsx} from 'clsx'
import {Fragment} from 'react'

import {defaultKeyboardCodes} from '../utils/dnd-utils'
import {DragAndDropResources} from '../utils/strings'
import type {DragAndDropDirection} from '../utils/types'
import styles from './KeyboardSpecificInstructionsModal.module.css'

type KeyboardSpecificInstructionsModalProps = {
  /**
   * Whether the modal is open
   */
  isOpen: boolean
  /**
   * Callback called when the modal is closed
   */
  onClose: () => void
  /**
   * The direction of the list
   */
  direction: DragAndDropDirection
  /**
   * Optional. Custom keyboard codes to use for drag and drop
   */
  keyboardCodes?: KeyboardCodes
}

type KeyboardSpecificInstructionsFooterProps = Pick<KeyboardSpecificInstructionsModalProps, 'onClose'> & DialogProps

/*
 * Key used to store the user preference to stop showing the keyboard instructions modal
 */
export const HideKeyboardSpecificInstructionsModalKey = 'hideKeyboardSpecificInstructions'

const KeyboardSpecificInstructionsFooter = ({onClose}: KeyboardSpecificInstructionsFooterProps) => {
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(HideKeyboardSpecificInstructionsModalKey, false)
  return (
    <div className={clsx(styles.footerContainer)}>
      <div className={clsx(styles.footerForm)}>
        <FormControl>
          <Checkbox checked={doNotShowAgain} onChange={() => setDoNotShowAgain(!doNotShowAgain)} />
          <FormControl.Label>{`Don't show this again`}</FormControl.Label>
        </FormControl>
      </div>
      <div className={clsx(styles.footerButton)}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}

/* Modal component that displays keyboard instructions to perform drag and drop actions.
 * Using the Primer Dialog component.
 *
 * @param props KeyboardSpecificInstructionsModalProps
 */
export const KeyboardSpecificInstructionsModal = ({
  isOpen,
  onClose,
  direction,
  keyboardCodes = defaultKeyboardCodes,
}: KeyboardSpecificInstructionsModalProps) => {
  if (!isOpen) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.code === 'Escape') {
      onClose()
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onKeyDown={onKeyDown}>
      <Dialog
        title="How to move objects via keyboard"
        subtitle="This navigation is only available when move mode is activated."
        onClose={onClose}
        renderFooter={() => (
          <Dialog.Footer className="d-flex">
            <KeyboardSpecificInstructionsFooter onClose={onClose} />
          </Dialog.Footer>
        )}
      >
        <table className={clsx(styles.instructionContainer)}>
          <thead className="sr-only">
            <tr>
              <th className="text=bold">Action</th>
              <th className="text=bold">Keyboard Shortcut</th>
            </tr>
          </thead>
          <tbody>
            <tr className={clsx(styles.instruction)}>
              <td>{DragAndDropResources.cancelDrag}</td>
              <td>
                {keyboardCodes.cancel.map((key, index) => (
                  <Fragment key={key}>
                    {index > 0 && <span> / </span>}
                    <KeyboardKey keys={key} />
                  </Fragment>
                ))}
              </td>
            </tr>
            <tr className={clsx(styles.instruction)}>
              <td>{DragAndDropResources.movePosition}</td>
              <td>
                <KeyboardKey keys={direction === 'vertical' ? 'up' : 'left'} />
                <span> / </span>
                <KeyboardKey keys={direction === 'vertical' ? 'down' : 'right'} />
              </td>
            </tr>
            <tr className={clsx(styles.instruction, 'border-bottom-0')}>
              <td>{DragAndDropResources.endDrag}</td>
              <td>
                {keyboardCodes.end.map((key, index) => (
                  <Fragment key={key}>
                    {index > 0 && <span> / </span>}
                    <KeyboardKey keys={key} />
                  </Fragment>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    </div>
  )
}
