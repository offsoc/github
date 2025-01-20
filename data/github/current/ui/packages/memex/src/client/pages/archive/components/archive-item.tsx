import {HistoryIcon, KebabHorizontalIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Checkbox, IconButton, RelativeTime, Text} from '@primer/react'
import {memo, useCallback} from 'react'

import type {ColumnData} from '../../../api/columns/contracts/storage'
import {ItemType} from '../../../api/memex-items/item-type'
import {ArchivePageRowActionMenu} from '../../../api/stats/contracts'
import {MemexItemIcon} from '../../../components/common/memex-item-icon'
import {InteractiveItemTitle} from '../../../components/interactive-item-title'
import {isNumber, parseTitleNumber} from '../../../helpers/parsing'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {EmptyValue, withValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useArchiveStatus} from '../../../state-providers/workflows/use-archive-status'
import {useRemoveArchiveItems, useRestoreArchiveItems, useSelectArchiveItems} from '../archive-page-provider'

type ArchiveItemProps = {
  archivedItem: MemexItemModel
  columnData: ColumnData
  canRestore: boolean
  projectItemLimit: number
}

export const ArchiveItem = memo<ArchiveItemProps>(function ArchiveItem({
  archivedItem,
  columnData,
  canRestore,
  projectItemLimit,
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {restoreItemsRequest} = useRestoreArchiveItems()
  const {setArchiveStatus} = useArchiveStatus()
  const restore = useCallback(async () => {
    const items = [archivedItem]
    await restoreItemsRequest.perform(items, items)
    setArchiveStatus()
  }, [archivedItem, restoreItemsRequest, setArchiveStatus])

  const {selectItem, isSelected} = useSelectArchiveItems()

  const onCheck = useCallback(() => {
    selectItem(archivedItem.id)
  }, [archivedItem, selectItem])

  const {removeItems} = useRemoveArchiveItems()
  const remove = useCallback(() => {
    removeItems([archivedItem.id], ArchivePageRowActionMenu)
  }, [archivedItem.id, removeItems])

  const itemTitleId = `item-title-${archivedItem.id}`

  const titleValue = columnData.Title
  const titleColumnValue = titleValue ? withValue(titleValue) : EmptyValue
  const number = parseTitleNumber(titleValue)

  const isRedactedItem = archivedItem.contentType === ItemType.RedactedItem
  const isRedactedOrReadOnly = isRedactedItem || !hasWritePermissions

  return (
    <>
      <Box as="label" sx={{pl: 4, pt: 2}}>
        <Checkbox
          sx={{alignSelf: 'start'}}
          aria-labelledby={itemTitleId}
          checked={isRedactedOrReadOnly ? false : isSelected(archivedItem.id)}
          onChange={isRedactedOrReadOnly ? undefined : onCheck}
          disabled={isRedactedOrReadOnly}
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
          {/* Data should be strongly consistent in this component, so ignore the fact that archived might be null */}
          archived <RelativeTime datetime={archivedItem.archived?.archivedAt} />
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
        {isRedactedOrReadOnly ? null : (
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
                <ActionList.Item onSelect={restore} disabled={!canRestore}>
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
                <ActionList.Item onSelect={remove} variant="danger">
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
