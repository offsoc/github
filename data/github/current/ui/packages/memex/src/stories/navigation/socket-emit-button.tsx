import {PlugIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {useEffect} from 'react'

import {MemexRefreshEvents} from '../../mocks/data/memex-refresh-events'

function emitRefresh() {
  window.__memexInMemoryServer.liveUpdate.sendSocketMessage({
    type: MemexRefreshEvents.MemexProjectEvent,
  })
}

function handleKeydown(event: KeyboardEvent) {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (event.code === 'Space' && event.ctrlKey && event.altKey && event.shiftKey) {
    if (event.defaultPrevented) return
    emitRefresh()
  }
}

export function SocketEmitButton() {
  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  return (
    <IconButton
      size="small"
      onClick={() => emitRefresh()}
      icon={PlugIcon}
      aria-label="Emit project data refresh websocket message"
    />
  )
}
