import {useCallback, useRef} from 'react'

import {useSidePanel} from './use-side-panel'

/**
 * Tracks the dirty state for any item in the side panel. Each time this is called represents a unique item. For example,
 * setting name dirty will not affect description below. If either one is dirty, the panel will confirm before closing
 * or navigating away.
 *
 * @example
 * const [nameDirty, setNameDirty] = useSidePanelDirtyState()
 * const [descriptionDirty, setDescriptionDirty] = useSidePanelDirtyState()
 */
export const useSidePanelDirtyState = (): [boolean, (dirty: boolean) => void] => {
  const {dirtyItems, setDirtyItems} = useSidePanel()

  const itemKey = useRef(Symbol()).current

  const setDirty = useCallback(
    (isDirty = true) =>
      setDirtyItems(prev => {
        // avoid returning the copy if the set is unchanged
        const copy = new Set(prev)
        if (isDirty) {
          return prev.has(itemKey) ? prev : copy.add(itemKey)
        } else {
          const wasDeleted = copy.delete(itemKey)
          return wasDeleted ? copy : prev
        }
      }),
    [itemKey, setDirtyItems],
  )

  return [dirtyItems.has(itemKey), setDirty]
}
