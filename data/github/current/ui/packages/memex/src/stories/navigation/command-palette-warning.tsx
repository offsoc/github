import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, Text} from '@primer/react'
import {useEffect, useState} from 'react'

const shortcutFromEvent = (e: KeyboardEvent | React.KeyboardEvent) => {
  let str = ''

  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (e.ctrlKey) str += 'Ctrl+'
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (e.metaKey) str += 'Meta+'
  if (e.shiftKey) str += 'Shift+'

  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  str += e.key

  return str
}

function isMacOS() {
  return /^mac/i.test(window.navigator.platform)
}

const platformMeta = isMacOS() ? 'Meta' : 'Ctrl'

export function CommandPaletteWarning() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      const shortcut = shortcutFromEvent(ev)
      if (shortcut === `${platformMeta}+k`) {
        setIsOpen(true)
      }
    }

    addEventListener('keydown', listener)

    return () => {
      removeEventListener('keydown', listener)
    }
  }, [])

  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} aria-labelledby="label">
      <Dialog.Header>
        <div>
          <AlertIcon />{' '}
          <Text {...testIdProps('command_palette_warning_title')} sx={{pl: 2}}>
            Command palette not available in staging
          </Text>
        </div>
      </Dialog.Header>
      <Box sx={{p: 3}}>
        <Text id="label" sx={{fontFamily: 'sans-serif'}}>
          The command palette implementation now lives in <code>github/github</code>, so tests that try to access the
          command palette in staging are now a no-op.
        </Text>
        <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
          <Button variant="primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
