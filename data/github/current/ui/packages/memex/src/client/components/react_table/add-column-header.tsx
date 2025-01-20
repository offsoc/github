import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {forwardRef, memo, useCallback, useRef, useState} from 'react'

import type {ColumnModel} from '../../models/column-model'
import {FocusType} from '../../navigation/types'
import {useAddFieldModal} from '../../state-providers/modals/use-add-field-modal'
import {AddColumnMenu} from '../add-column-menu'
import {AddColumnModal} from './add-column-modal'
import {focusCell, isCellFocus, moveTableFocus, useStableTableNavigation} from './navigation'
import {useTableInstance} from './table-provider'

type AddColumnMenuWithTriggerProps = {
  showAddFieldModal: boolean
  columnMenuTriggerRef: React.RefObject<HTMLButtonElement>
}

const AddColumnMenuWithTrigger = forwardRef<HTMLButtonElement, AddColumnMenuWithTriggerProps>(
  ({showAddFieldModal, columnMenuTriggerRef}: AddColumnMenuWithTriggerProps, ref) => {
    const [openAddColumnMenu, setOpenAddColumnMenu] = useState<boolean>(false)
    const {stateRef, navigationDispatch} = useStableTableNavigation()

    const openColumnMenu = useCallback(() => {
      const focus = stateRef.current && stateRef.current.focus
      if (focus && isCellFocus(focus)) {
        // if focus is currently in table, ensure this is suspended so that the
        // Add Column flow can shift focus to the current row after completion,
        // instead of moving to the top row
        navigationDispatch(moveTableFocus({focusType: FocusType.Suspended}))
      }

      setOpenAddColumnMenu(true)
    }, [navigationDispatch, stateRef])

    return (
      <>
        <IconButton
          size="small"
          variant="invisible"
          icon={PlusIcon}
          aria-label="Add field"
          ref={ref}
          onClick={openColumnMenu}
          onKeyPress={openColumnMenu}
          disabled={showAddFieldModal || openAddColumnMenu}
          {...testIdProps('column-visibility-menu-trigger')}
          sx={{
            color: 'fg.muted',
            width: '100%',
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <AddColumnMenu open={openAddColumnMenu} setOpen={setOpenAddColumnMenu} anchorRef={columnMenuTriggerRef} />
      </>
    )
  },
)

AddColumnMenuWithTrigger.displayName = 'AddColumnMenu'

export const AddColumnHeader = memo(() => {
  const {setShowAddFieldModal, showAddFieldModal} = useAddFieldModal()
  const table = useTableInstance()

  const {stateRef, navigationDispatch} = useStableTableNavigation()

  const onColumnSave = useCallback(
    (newCol: ColumnModel) => {
      const focus = (stateRef.current && stateRef.current.focus) || undefined
      // If focused in a cell in some row, focus on the new column in that
      // row. Otherwise, focus on new column.
      if (focus && isCellFocus(focus)) {
        navigationDispatch(focusCell(focus.details.y, newCol.id.toString()))
      } else {
        const firstRow = table.flatRows.find(row => !row.isGrouped)
        if (firstRow) {
          navigationDispatch(focusCell(firstRow.id, newCol.id.toString()))
        }
      }
    },
    [navigationDispatch, stateRef, table.flatRows],
  )

  const columnMenuTriggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <AddColumnMenuWithTrigger
        showAddFieldModal={showAddFieldModal}
        columnMenuTriggerRef={columnMenuTriggerRef}
        ref={columnMenuTriggerRef}
      />

      <AddColumnModal
        isOpen={showAddFieldModal}
        setOpen={setShowAddFieldModal}
        anchorRef={columnMenuTriggerRef}
        onSave={onColumnSave}
      />
    </>
  )
})

AddColumnHeader.displayName = 'AddColumnHeader'
