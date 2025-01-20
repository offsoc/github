import {type PropsWithChildren, useCallback, useState} from 'react'
import {ActionList, IconButton} from '@primer/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileDirectoryFillIcon,
  FileDirectoryOpenFillIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@primer/octicons-react'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {Link} from '@github-ui/react-core/link'
import {useBasePath} from '../contexts/BasePathContext'
import {useRecursiveGroupContext} from '../contexts/RecursiveGroupContext'
import {DangerConfirmationDialog} from './DangerConfirmationDialog'

export function TreeListItem({
  id,
  group_path,
  depth,
  total_count,
  children,
}: PropsWithChildren<{
  id: number
  group_path: string
  depth: number
  total_count: number
}>) {
  const {collapse, hideGroupActions, onRemoveGroup} = useRecursiveGroupContext()
  const [collapsed, setCollapsed] = useState<boolean>(collapse ?? depth !== 0)
  return (
    <>
      <ListItem
        key={id}
        sx={{
          paddingLeft: 2,
          borderLeft: '1px solid var(--borderColor-default)',
          borderRight: '1px solid var(--borderColor-default)',
          '&:last-child': {
            borderBottom: '1px solid var(--borderColor-default)',
          },
        }}
        title={<ListItemTitle value={group_path} />}
        secondaryActions={!hideGroupActions ? <SecondaryActions id={id} onRemoveGroup={onRemoveGroup} /> : undefined}
      >
        <ListItemLeadingContent
          sx={{
            paddingLeft: `calc(var(--base-size-16) * ${depth})`,
          }}
        >
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? ChevronRightIcon : ChevronDownIcon}
            className="flex-self-center"
            aria-label={`${collapsed ? 'expand' : 'collapse'} subgroups`}
            variant="invisible"
            unsafeDisableTooltip={true}
          />
          <ListItemLeadingVisual
            color="var(--treeViewItem-leadingVisual-iconColor-rest, var(--color-icon-directory))"
            icon={collapsed ? FileDirectoryFillIcon : FileDirectoryOpenFillIcon}
          />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>{total_count} repositories</ListItemDescription>
        </ListItemMainContent>
      </ListItem>
      {!collapsed ? (
        <li>
          <ul className="list-style-none">{children}</ul>
        </li>
      ) : null}
    </>
  )
}

type SecondaryActionsProps = {
  id: number
  onRemoveGroup?: (id: number) => void
}

function SecondaryActions({id, onRemoveGroup}: SecondaryActionsProps) {
  const basePath = useBasePath()
  const [isDangerDialogOpen, setIsDangerDialogOpen] = useState(false)

  const showDeleteDialog = useCallback(() => {
    setIsDangerDialogOpen(true)
  }, [setIsDangerDialogOpen])

  const hideDeleteDialog = useCallback(() => {
    setIsDangerDialogOpen(false)
  }, [setIsDangerDialogOpen])

  const removeGroup = useCallback(() => {
    onRemoveGroup?.(id)
    hideDeleteDialog()
  }, [id, onRemoveGroup, hideDeleteDialog])

  return (
    <>
      <ListItemActionBar
        label="group actions"
        staticMenuActions={[
          {
            key: 'new-sub-group',
            render: () => (
              <ActionList.LinkItem as={Link} to={`./new?parentId=${id}`}>
                <ActionList.LeadingVisual>
                  <PlusIcon />
                </ActionList.LeadingVisual>
                New sub-group
              </ActionList.LinkItem>
            ),
          },
          {
            key: 'edit-group',
            render: () => (
              <ActionList.LinkItem as={Link} to={`${basePath}/${id ?? 'new?root=true'}`}>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                Edit group
              </ActionList.LinkItem>
            ),
          },
          {
            key: 'delete-group',
            render: () => (
              <ActionList.Item variant="danger" onSelect={showDeleteDialog}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete group
              </ActionList.Item>
            ),
          },
        ]}
      />
      <DangerConfirmationDialog
        isOpen={isDangerDialogOpen}
        title="Delete group?"
        text="Are you sure you want to delete this group? This action cannot be undone."
        buttonText="Delete"
        onDismiss={hideDeleteDialog}
        onConfirm={removeGroup}
      />
    </>
  )
}
