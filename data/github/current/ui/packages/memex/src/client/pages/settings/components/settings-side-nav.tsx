import {testIdProps} from '@github-ui/test-id-props'
import {GearIcon, PeopleIcon} from '@primer/octicons-react'
import {NavList} from '@primer/react'
import {memo, type MouseEvent, useCallback, useRef, useState} from 'react'

import {apiUpdateColumn} from '../../../api/columns/api-update-column'
import type {MemexColumn, MemexProjectColumnId} from '../../../api/columns/contracts/memex-column'
import {
  SettingsFieldReorder,
  SettingsFieldReorderSettingsUI,
  SettingsOpen,
  SettingsOpenField,
  SettingsOpenSidebarUI,
} from '../../../api/stats/contracts'
import {AddColumnModal} from '../../../components/react_table/add-column-modal'
import {NavLinkActionListItem} from '../../../components/react-router/action-list-nav-link-item'
import useToasts from '../../../components/toasts/use-toasts'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import type {ColumnModel} from '../../../models/column-model'
import {useNavigate} from '../../../router'
import {useProjectRouteParams} from '../../../router/use-project-route-params'
import {PROJECT_SETTINGS_ACCESS_ROUTE, PROJECT_SETTINGS_FIELD_ROUTE, PROJECT_SETTINGS_ROUTE} from '../../../routes'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {ReorderableColumnListNav, type ReorderColumnCommitState} from './column-list-nav'

// Note: this code will replace SettingsSideNav once the reordering is validated on production
export const ReorderableSettingsSideNav = memo(function ReorderableSettingsSideNav() {
  const {addToast} = useToasts()
  const {allColumns, setAllColumns} = useAllColumns()

  const {hasAdminPermissions} = ViewerPrivileges()
  const {postStats} = usePostStats()

  const [show, setShow] = useState(false)
  const [reorderColumnCommitState, setReorderColumnCommitState] = useState<ReorderColumnCommitState>('idle')

  const anchorRef = useRef<HTMLLIElement>(null)
  const navigate = useNavigate()

  const onNewField = useCallback(() => setShow(open => !open), [])

  const onReorderColumnCallback = useCallback(
    async (repositionedColumnId: number, previousColumnId: number | null) => {
      setReorderColumnCommitState('saving')
      try {
        await apiUpdateColumn({
          memexProjectColumnId: repositionedColumnId,
          previousMemexProjectColumnId: previousColumnId,
        })
      } catch (_) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: "Reorder couldn't be saved", type: 'error'})
        setReorderColumnCommitState('error')
        return
      }

      setReorderColumnCommitState('success')

      // removing reordered column
      const repositionedColumnIndex = allColumns.findIndex(({databaseId}) => databaseId === repositionedColumnId)
      const repositionedColumn = allColumns[repositionedColumnIndex]
      if (!repositionedColumn) return

      const notMovedColumns = [
        ...allColumns.slice(0, repositionedColumnIndex),
        ...allColumns.slice(repositionedColumnIndex + 1),
      ]

      // reinserting reordered column into its new position
      let previousColumnIndex = notMovedColumns.findIndex(({databaseId}) => databaseId === previousColumnId)
      previousColumnIndex = previousColumnIndex > -1 ? previousColumnIndex : notMovedColumns.length - 1
      const reorderedColumns: Array<ColumnModel> = [
        ...notMovedColumns.slice(0, previousColumnIndex + 1),
        repositionedColumn,
        ...notMovedColumns.slice(previousColumnIndex + 1),
      ]

      // updating client-side position
      let position = 1
      for (const column of reorderedColumns) {
        ;(column as MemexColumn).position = position
        position += 1
      }

      setAllColumns(reorderedColumns)

      postStats({
        name: SettingsFieldReorder,
        ui: SettingsFieldReorderSettingsUI,
        memexProjectColumnId: repositionedColumnId,
        context: `previousColumnId: ${previousColumnId}`,
      })
    },
    [allColumns, setAllColumns, postStats, addToast, setReorderColumnCommitState],
  )

  const onFieldNavCallback = useCallback(
    (memexProjectColumnId: MemexProjectColumnId, e: MouseEvent) => {
      postStats({
        name: SettingsOpenField,
        ui: SettingsOpenSidebarUI,
        memexProjectColumnId,
        context: `${e.type}: ${e.currentTarget.tagName}`,
      })
    },
    [postStats],
  )

  const projectRouteParams = useProjectRouteParams()
  return (
    <>
      <NavList {...testIdProps('settings-side-nav')} aria-label="Settings">
        <NavLinkActionListItem
          end
          to={PROJECT_SETTINGS_ROUTE.generatePath(projectRouteParams)}
          {...testIdProps('general-settings-item')}
          onClick={(e: React.MouseEvent) => {
            postStats({
              name: SettingsOpen,
              ui: SettingsOpenSidebarUI,
              context: `${e.type}: ${e.currentTarget.tagName}`,
            })
          }}
        >
          {/* eslint-disable-next-line primer-react/direct-slot-children */}
          <NavList.LeadingVisual>
            <GearIcon />
          </NavList.LeadingVisual>
          Project settings
        </NavLinkActionListItem>
        {hasAdminPermissions && (
          <NavLinkActionListItem
            to={PROJECT_SETTINGS_ACCESS_ROUTE.generatePath(projectRouteParams)}
            {...testIdProps('manage-access-item')}
          >
            {/* eslint-disable-next-line primer-react/direct-slot-children */}
            <NavList.LeadingVisual>
              <PeopleIcon />
            </NavList.LeadingVisual>
            Manage access
          </NavLinkActionListItem>
        )}

        <ReorderableColumnListNav
          columns={allColumns}
          reorderCommitState={reorderColumnCommitState}
          addNewAnchorRef={anchorRef}
          onNewField={onNewField}
          onReorderColumnCallback={onReorderColumnCallback}
          onFieldNavCallback={onFieldNavCallback}
        />
      </NavList>

      <AddColumnModal
        key={allColumns.length}
        isOpen={show}
        setOpen={setShow}
        anchorRef={anchorRef}
        onSave={useCallback(
          (field: ColumnModel): void => {
            navigate(PROJECT_SETTINGS_FIELD_ROUTE.generatePath({...projectRouteParams, fieldId: field.id}))
          },
          [navigate, projectRouteParams],
        )}
      />
    </>
  )
})
