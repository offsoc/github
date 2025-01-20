import {testIdProps} from '@github-ui/test-id-props'
import {PencilIcon, TrashIcon, VersionsIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {memo} from 'react'

import type {BaseViewState, ViewIsDirtyStates} from '../../hooks/use-view-state-reducer/types'
import {Resources} from '../../strings'

export const ViewActionItems = memo(function ViewActionItems({
  view,
  handleRenameViewClick,
  handleDuplicateView,
  handleDestroyView,
  viewsLength,
}: {
  view: BaseViewState & ViewIsDirtyStates
  handleRenameViewClick: () => void
  handleDuplicateView: () => Promise<void>
  handleDestroyView: () => Promise<void>
  viewsLength: number
}) {
  return (
    <>
      {view.isDeleted ? null : (
        <ActionList.Item {...testIdProps('view-options-menu-item-rename-view')} onSelect={handleRenameViewClick}>
          <ActionList.LeadingVisual>
            <PencilIcon />
          </ActionList.LeadingVisual>
          Rename view
        </ActionList.Item>
      )}
      <ActionList.Item {...testIdProps('view-options-menu-item-duplicate-view')} onSelect={handleDuplicateView}>
        <ActionList.LeadingVisual>
          <VersionsIcon />
        </ActionList.LeadingVisual>
        {Resources.duplicateView({isDirty: view.isViewStateDirty})}
      </ActionList.Item>
      <ActionList.Item
        {...testIdProps('view-options-menu-item-delete-view')}
        onSelect={handleDestroyView}
        disabled={viewsLength <= 1}
        variant="danger"
      >
        <ActionList.LeadingVisual>
          <TrashIcon />
        </ActionList.LeadingVisual>
        {view.isDeleted ? 'Remove deleted view' : 'Delete view'}
      </ActionList.Item>
    </>
  )
})
