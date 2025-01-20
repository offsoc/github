import {
  ArchiveIcon,
  EyeClosedIcon,
  KebabHorizontalIcon,
  NumberIcon,
  PencilIcon,
  TrashIcon,
} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps, ActionMenu, IconButton} from '@primer/react'
import {useCallback, useMemo} from 'react'

import {ItemType} from '../../api/memex-items/item-type'
import {BoardColumnActionMenuUI} from '../../api/stats/contracts'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useArchiveMemexItemsWithConfirmation} from '../../hooks/use-archive-memex-items-with-confirmation'
import {useRemoveMemexItemWithConfirmation} from '../../hooks/use-remove-memex-items-with-id'
import type {MemexItemModel} from '../../models/memex-item-model'
import {Resources} from '../../strings'

interface GroupMenuProps {
  name: string
  isColumn?: boolean
  onRename?: () => void
  onEditDetails?: () => void
  onEditLimit?: () => void
  onHide?: () => void
  onDelete?: () => void
  /** The list of items belonging to this column */
  items: ReadonlyArray<MemexItemModel>
}

const contextTriggerSx = {position: 'sticky', right: 0, mr: 1}

export const GroupMenu = ({
  name,
  isColumn = false,
  onRename,
  onEditLimit,
  onEditDetails,
  onHide,
  onDelete,
  items,
}: GroupMenuProps) => {
  const {hasWritePermissions} = ViewerPrivileges()
  const nonRedactedItems = useMemo(() => items.filter(item => item.contentType !== ItemType.RedactedItem), [items])

  const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation()
  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation()

  const onArchiveAll = useCallback(() => {
    if (items.length === 0) return
    const itemIds = items.map(item => item.id)
    openArchiveConfirmationDialog(
      itemIds,
      BoardColumnActionMenuUI,
      Resources.archiveGroupItemsConfirmationTitle,
      Resources.archiveGroupItemsConfirmationMessage(items.length),
    )
  }, [openArchiveConfirmationDialog, items])

  const onDeleteAll = useCallback(() => {
    if (items.length === 0) return
    const itemIds = items.map(item => item.id)
    openRemoveConfirmationDialog(itemIds, BoardColumnActionMenuUI, {
      title: Resources.deleteGroupItemsConfirmationTitle,
      content: Resources.deleteGroupItemsConfirmationMessage(items.length),
    })
  }, [openRemoveConfirmationDialog, items])

  const groupActions = []

  if (onRename && hasWritePermissions) {
    groupActions.push(<RenameGroupAction onSelect={onRename} key="rename" />)
  }
  if (onEditLimit && hasWritePermissions) {
    groupActions.push(<EditGroupLimitAction onSelect={onEditLimit} key="editLimit" />)
  }
  if (onEditDetails && hasWritePermissions) {
    groupActions.push(<EditGroupDetailsAction onSelect={onEditDetails} key="editDetails" />)
  }
  if (onHide) {
    groupActions.push(<HideGroupAction onSelect={onHide} key="hide" />)
  }
  if (onDelete && hasWritePermissions) {
    groupActions.push(<DeleteGroupAction onSelect={onDelete} key="delete" />)
  }

  const itemActions = []

  if (hasWritePermissions) {
    itemActions.push(
      <ArchiveItemsAction disabled={nonRedactedItems.length === 0} onSelect={onArchiveAll} key="archiveItems" />,
    )
    itemActions.push(
      <DeleteItemsAction disabled={nonRedactedItems.length === 0} onSelect={onDeleteAll} key="deleteItems" />,
    )
  }

  if (itemActions.length === 0 && groupActions.length === 0) return null

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton
          aria-label={Resources.groupHeaderMenu(name, isColumn)}
          variant="invisible"
          icon={KebabHorizontalIcon}
          size="small"
          sx={contextTriggerSx}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay align="end">
        <ActionList>
          {itemActions.length > 0 && (
            <ActionList.Group>
              <ActionList.GroupHeading>Items</ActionList.GroupHeading>
              {itemActions}
            </ActionList.Group>
          )}
          {groupActions.length > 0 && (
            <>
              {itemActions.length > 0 && <ActionList.Divider />}
              <ActionList.Group>
                <ActionList.GroupHeading>{isColumn ? 'Column' : 'Group'}</ActionList.GroupHeading>
                {groupActions}
              </ActionList.Group>
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const RenameGroupAction = (props: ActionListItemProps) => (
  <ActionList.Item {...props}>
    <ActionList.LeadingVisual>
      <PencilIcon />
    </ActionList.LeadingVisual>
    Rename
  </ActionList.Item>
)

const EditGroupLimitAction = (props: ActionListItemProps) => (
  <ActionList.Item {...props}>
    <ActionList.LeadingVisual>
      <NumberIcon />
    </ActionList.LeadingVisual>
    Set limit
  </ActionList.Item>
)

const EditGroupDetailsAction = (props: ActionListItemProps) => (
  <ActionList.Item {...props}>
    <ActionList.LeadingVisual>
      <PencilIcon />
    </ActionList.LeadingVisual>
    Edit details
  </ActionList.Item>
)

const HideGroupAction = (props: ActionListItemProps) => (
  <ActionList.Item {...props}>
    <ActionList.LeadingVisual>
      <EyeClosedIcon />
    </ActionList.LeadingVisual>
    Hide from view
  </ActionList.Item>
)

const DeleteGroupAction = (props: ActionListItemProps) => (
  <ActionList.Item variant="danger" {...props}>
    <ActionList.LeadingVisual>
      <TrashIcon />
    </ActionList.LeadingVisual>
    Delete
  </ActionList.Item>
)

const ArchiveItemsAction = (props: ActionListItemProps) => (
  <ActionList.Item {...props}>
    <ActionList.LeadingVisual>
      <ArchiveIcon />
    </ActionList.LeadingVisual>
    Archive all
  </ActionList.Item>
)

const DeleteItemsAction = (props: ActionListItemProps) => (
  <ActionList.Item variant="danger" {...props}>
    <ActionList.LeadingVisual>
      <TrashIcon />
    </ActionList.LeadingVisual>
    Delete all
  </ActionList.Item>
)
