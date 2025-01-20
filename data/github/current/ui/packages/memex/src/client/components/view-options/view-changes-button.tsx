import {testIdProps} from '@github-ui/test-id-props'
import {ActionList} from '@primer/react'
import {useCallback} from 'react'

import {ViewOptionsMenuUI} from '../../api/stats/contracts'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import type {BaseViewState, ViewIsDirtyStates} from '../../hooks/use-view-state-reducer/types'
import {useViews} from '../../hooks/use-views'
import {Resources} from '../../strings'

export function ViewChangeButtons({
  view,
  setOpen,
}: {
  view: BaseViewState & ViewIsDirtyStates
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {saveCurrentViewState, resetViewState} = useViews()

  const handleSaveView = useCallback(async () => {
    await saveCurrentViewState(view.number, {
      ui: ViewOptionsMenuUI,
    })
    setOpen(false)
  }, [saveCurrentViewState, setOpen, view.number])

  const handleResetChanges = useCallback(async () => {
    resetViewState(view.number, {
      ui: ViewOptionsMenuUI,
    })

    setOpen(false)
  }, [resetViewState, setOpen, view.number])

  return (
    <>
      {hasWritePermissions && !view.isDeleted ? (
        <ActionList.Item
          onSelect={handleSaveView}
          disabled={!view.isViewStateDirty}
          {...testIdProps('view-options-menu-save-changes-button')}
          sx={{
            flex: 'auto',
            color: 'accent.fg',
            borderRight: '1px solid',
            borderColor: 'border.default',
            borderRadius: 0,
            my: -2,
            mx: 0,
            py: 3,
            textAlign: 'center',
            fontWeight: 'normal',
            '&:hover': {
              bg: 'canvas.inset',
            },
          }}
        >
          {Resources.saveChanges}
        </ActionList.Item>
      ) : null}
      <ActionList.Item
        onSelect={handleResetChanges}
        {...testIdProps('view-options-menu-reset-changes-button')}
        sx={{
          flex: 'auto',
          color: 'fg.muted',
          borderRadius: 0,
          my: -2,
          mx: 0,
          py: 3,
          textAlign: 'center',
          fontWeight: 'normal',
          '&:hover': {
            bg: 'canvas.inset',
          },
        }}
      >
        {Resources.discardChanges}
      </ActionList.Item>
    </>
  )
}
