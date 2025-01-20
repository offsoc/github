import {Box} from '@primer/react'
import {KeyboardKey} from '@github-ui/keyboard-key'
import {Fragment, useId} from 'react'
import type {ShortcutsGroup} from '../types'

interface ShortcutsGroupListProps {
  group: ShortcutsGroup
}

export function ShortcutsGroupList({
  group: {
    service: {name: serviceName},
    commands,
  },
}: ShortcutsGroupListProps) {
  const labelId = useId()

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.default',
        overflow: 'hidden',
      }}
    >
      <Box as="h3" id={labelId} sx={{bg: 'canvas.subtle', fontWeight: 'bold', py: 2, px: 3, fontSize: 1}}>
        {serviceName}
      </Box>

      <Box as="ul" role="list" aria-labelledby={labelId} sx={{listStyleType: 'none'}}>
        {commands.map(({id, name, keybinding}) => (
          <Box
            as="li"
            key={id}
            sx={{
              borderTop: '1px solid',
              borderColor: 'border.default',
              py: 2,
              px: 3,
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>{name}</div>
            <Box sx={{textAlign: 'right'}}>
              {(Array.isArray(keybinding) ? keybinding : [keybinding]).map((keys, i) => (
                <Fragment key={keys}>
                  {i > 0 && ' or '}
                  <KeyboardKey keys={keys} />
                </Fragment>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
