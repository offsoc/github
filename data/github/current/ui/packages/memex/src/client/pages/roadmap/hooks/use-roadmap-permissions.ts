import {useCallback, useMemo} from 'react'

import {ItemType} from '../../../api/memex-items/item-type'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import type {MemexItemModel} from '../../../models/memex-item-model'

type UseRoadmapPermissions = {
  /** Whether dates/iterations can be added/updated in the roadmap in general */
  canUpdate: boolean
  /** Whether dates can be added/updated in the roadmap for a given item */
  canUpdateItem: (item: MemexItemModel) => boolean
}

export function useRoadmapPermissions(): UseRoadmapPermissions {
  const {hasWritePermissions} = ViewerPrivileges()

  const canUpdateItem = useCallback(
    (item: MemexItemModel) => {
      return hasWritePermissions && item.contentType !== ItemType.RedactedItem
    },
    [hasWritePermissions],
  )

  return useMemo(
    () => ({
      canUpdate: hasWritePermissions,
      canUpdateItem,
    }),
    [canUpdateItem, hasWritePermissions],
  )
}
