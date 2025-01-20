import type React from 'react'

import {useAllShortcutsEnabled} from '../contexts/AllShortcutsEnabledContext'

export function AllShortcutsEnabled({children}: {children: React.ReactNode}) {
  const allShortcutsEnabled = useAllShortcutsEnabled()
  return allShortcutsEnabled ? <>{children}</> : null
}
