import {type RefObject, useState} from 'react'

import type {UserPresence} from '../api/alive/contracts'
import {useAliveChannel} from './use-alive-channel'

const isValidPresenceItemResponse = (data: unknown): data is Array<UserPresence> => {
  if (!Array.isArray(data)) return false
  return true
}

const defaultPresenceItems: ReadonlyArray<UserPresence> = []
export const useAlivePresenceItems = (ref: RefObject<HTMLElement>) => {
  const [presenceItems, setPresenceItems] = useState<ReadonlyArray<UserPresence>>(defaultPresenceItems)

  const [attrs] = useAliveChannel(ref, 'presence', detail => {
    if (isValidPresenceItemResponse(detail.data)) {
      setPresenceItems(detail.data)
    } else {
      setPresenceItems(defaultPresenceItems)
    }
  })

  return {presenceItems, attrs}
}
