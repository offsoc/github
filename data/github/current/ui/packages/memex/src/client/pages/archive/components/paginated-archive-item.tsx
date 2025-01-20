import {HistoryIcon, KebabHorizontalIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Checkbox, IconButton, RelativeTime, Text} from '@primer/react'
import {memo, useCallback, useMemo} from 'react'

import type {ColumnData} from '../../../api/columns/contracts/storage'
import type {RemoveMemexItemRequest, UnarchiveMemexItemRequest} from '../../../api/memex-items/contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {MemexItemIcon} from '../../../components/common/memex-item-icon'
import {InteractiveItemTitle} from '../../../components/interactive-item-title'
import {isNumber, parseTitleNumber} from '../../../helpers/parsing'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {EmptyValue, withValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'

type PaginatedArchiveItemProps = {
  archivedItem: MemexItemModel
  columnData: ColumnData
  canRestore: boolean
  projectItemLimit: number
  isSelected: boolean
  onToggleSelection: () => void
  onRestoreItems: (request: UnarchiveMemexItemRequest) => void
  onRemoveItems: (request: RemoveMemexItemRequest) => void
  mutationLoading: boolean
}

export const PaginatedArchiveItem = memo<PaginatedArchiveItemProps>(function PaginatedArchiveItem({
  archivedItem,
  columnData,
  canRestore,
  projectItemLimit,
  isSelected,
  onToggleSelection,
  onRestoreItems,
  onRemoveItems,
  mutationLoading,
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const archivedAt = archivedItem.archived?.archivedAt
  const wasRecentlyRestored = !archivedAt
  const isRedactedItem = archivedItem.contentType === ItemType.RedactedItem
  const isReadonly = isRedactedItem || wasRecentlyRestored || !hasWritePermissions

  const itemTitleId = `item-title-${archivedItem.id}`

  const titleValue = columnData.Title
  const titleColumnValue = titleValue ? withValue(titleValue) : EmptyValue
  const number = parseTitleNumber(titleValue)

  // For archived items, this is the true time at which the item was most recently archived.
  //
  // For items that are not archived (i.e. recently restored), this is a fake timestamp that we display as part of an
  // optimistic update. Ultimately, we expect a live update to remove these items entirely, but we display this as a
  // "restored at" timestamp in the meantime. It is set to 1 second before the archived at timestamp was cleared (so
  // that it appears in the UI as having been *just* restored), and we intentionally do not update that time on
  // subsequent renders so that it appears stable to end users.
  const lastModifiedAt = useMemo(() => archivedAt || new Date(new Date().getTime() - 1000).toISOString(), [archivedAt])

  const onRestore = useCallback(() => {
    onRestoreItems({memexProjectItemIds: [archivedItem.id]})
  }, [onRestoreItems, archivedItem.id])
  const onRemove = useCallback(() => {
    onRemoveItems({memexProjectItemIds: [archivedItem.id]})
  }, [onRemoveItems, archivedItem.id])

  return (
    <>
      <Box as="label" sx={{pl: 4, pt: 2}}>
        <Checkbox
          sx={{alignSelf: 'start'}}
          aria-labelledby={itemTitleId}
          checked={isReadonly ? false : isSelected}
          onChange={isReadonly ? undefined : onToggleSelection}
          disabled={isReadonly || mutationLoading}
        />
      </Box>
      <Box sx={{pt: 2, pl: 3}}>
        <MemexItemIcon titleColumn={titleColumnValue} />
      </Box>
      <Box sx={{p: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
        <Box
          id={itemTitleId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <InteractiveItemTitle model={archivedItem} currentValue={titleColumnValue} />
          {isNumber(number) && (
            <Box sx={{flexShrink: 0, ml: 2, display: 'flex'}}>
              <Text sx={{color: 'fg.muted'}}> #{number}</Text>
            </Box>
          )}
        </Box>

        <Box sx={{color: 'fg.muted', fontSize: 0}}>
          {archivedItem.archived ? 'archived' : 'restored'} <RelativeTime datetime={lastModifiedAt} />
          {!isRedactedItem && archivedItem.archived?.archivedBy ? (
            <>
              {' by '}
              <Text as="span" sx={{color: 'fg.default'}}>
                {archivedItem.archived.archivedBy.login}
              </Text>
            </>
          ) : null}
        </Box>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', mr: 3}}>
        {isReadonly || mutationLoading ? null : (
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                icon={KebabHorizontalIcon}
                variant="invisible"
                aria-label="Open item actions"
                sx={{color: 'fg.default'}}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={onRestore} disabled={!canRestore}>
                  <ActionList.LeadingVisual>
                    <HistoryIcon />
                  </ActionList.LeadingVisual>
                  {canRestore ? (
                    'Restore'
                  ) : (
                    <>
                      Restore unavailable
                      <ActionList.Description variant="block">
                        This will exceed the {projectItemLimit} project item limit
                      </ActionList.Description>
                    </>
                  )}
                </ActionList.Item>
                <ActionList.Item onSelect={onRemove} variant="danger">
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  Delete from project
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </Box>
    </>
  )
})
