import {useContext} from 'react'

import {ArchiveStatusContext} from './archive-status-state-provider'

export const useArchiveStatus = () => {
  const context = useContext(ArchiveStatusContext)

  if (!context) {
    throw new Error('useArchiveStatus must be used within an ArchiveStatusProvider')
  }
  return context
}
