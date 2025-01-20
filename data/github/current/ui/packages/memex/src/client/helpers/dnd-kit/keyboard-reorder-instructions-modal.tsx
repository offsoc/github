import {KeyboardKey} from '@github-ui/keyboard-key'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {Box, Button, Checkbox, FormControl} from '@primer/react'
import type {DialogProps} from '@primer/react/experimental'
import {Dialog} from '@primer/react/experimental'

import {DragAndDropResources} from '../../strings'

type KeyboardReorderInstructionsModalProps = {
  isOpen: boolean
  onClose: () => void
}

const instructionContainerSx = {
  display: 'flex',
  flexDirection: 'column',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.default',
  borderRadius: '5px',
}

const instructionSx = {
  display: 'flex',
  padding: '16px',
  justifyContent: 'space-between',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border.default',
}

export const HideKeyboardReorderInstructionsModalKey = 'hideReorderKeyboardInstructions'

/* Modal component that displays keyboard instructions to perform drag and drop actions.
 * using the Primer Dialog component.
 */
export const KeyboardReorderInstructionsModal = ({isOpen, onClose}: KeyboardReorderInstructionsModalProps) => {
  if (!isOpen) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key === 'Escape') {
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
          <Dialog.Footer sx={{display: 'flex'}}>
            <KeyboardReorderInstructionsFooter onClose={onClose} />
          </Dialog.Footer>
        )}
      >
        <Box sx={instructionContainerSx}>
          <Box sx={instructionSx}>
            <span>{DragAndDropResources.cancelDrag}</span>
            <KeyboardKey keys="esc" />
          </Box>
          <Box sx={instructionSx}>
            <span>{DragAndDropResources.moveDown}</span>
            <KeyboardKey keys="down" />
          </Box>
          <Box sx={instructionSx}>
            <span>{DragAndDropResources.moveUp}</span>
            <KeyboardKey keys="up" />
          </Box>
          <Box sx={{...instructionSx, borderBottom: 'none'}}>
            <span>{DragAndDropResources.endDrag}</span>
            <div>
              <KeyboardKey keys="enter" />
              <span> or </span>
              <KeyboardKey keys="space" />
            </div>
          </Box>
        </Box>
      </Dialog>
    </div>
  )
}

type KeyboardReorderInstructionsFooterProps = {
  onClose: () => void
} & DialogProps

export const KeyboardReorderInstructionsFooter = ({onClose}: KeyboardReorderInstructionsFooterProps) => {
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(HideKeyboardReorderInstructionsModalKey, false)
  return (
    <Box sx={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
      <FormControl sx={{display: 'flex', alignItems: 'center', '> :first-child': {display: 'contents'}}}>
        <Checkbox checked={doNotShowAgain} onChange={() => setDoNotShowAgain(!doNotShowAgain)} />
        <FormControl.Label>{`Don't show this again`}</FormControl.Label>
      </FormControl>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  )
}
