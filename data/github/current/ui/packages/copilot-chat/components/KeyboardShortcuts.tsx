import {Box} from '@primer/react'
import {memo} from 'react'

export const KeyboardShortcuts = memo(function KeyboardShortcuts() {
  return (
    <Box
      as="p"
      className="copilot-keyboard-shortcuts"
      id="copilot-keyboard-shortcuts"
      sx={{
        color: 'var(--fgColor-muted, var(--color-fg-muted))',
        display: ['none', 'flex'],
        columnGap: 2,
        flexWrap: 'wrap',
        fontSize: 0,
        justifyContent: 'center',
        m: 0,
        opacity: 0.3,
        px: [1, 2],
        rowGap: 1,
        transition: 'opacity 0.2s ease-in 0.1s, visibility 0.1s ease-out 0.1s',
        visibility: 'hidden',
      }}
    >
      <Box as="span" sx={{display: 'flex', alignItems: 'baseline', gap: 1, whiteSpace: 'nowrap'}}>
        <kbd className="hx_kbd">⇧ ⏎</kbd>
        <span className="sr-only">:</span>
        <span>add a new line</span>
        <span className="sr-only">,</span>
      </Box>
    </Box>
  )
})

KeyboardShortcuts.displayName = 'KeyboardShortcuts'
