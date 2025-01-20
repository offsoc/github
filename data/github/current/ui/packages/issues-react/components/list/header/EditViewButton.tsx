import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {
  CheckCircleIcon,
  DotFillIcon,
  DuplicateIcon,
  KebabHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, Octicon, Tooltip, useConfirm} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import {
  ASSIGNED_TO_ME_VIEW,
  SAVED_VIEW_GRAPHQL_ID_PREFIX,
  SHARED_VIEW_GRAPHQL_ID_PREFIX,
  VIEW_IDS,
} from '../../../constants/view-constants'
import {useAppNavigate} from '../../../hooks/use-app-navigate'
import {searchUrl} from '../../../utils/urls'
import type {EditViewButtonCurrentViewFragment$key} from './__generated__/EditViewButtonCurrentViewFragment.graphql'
import {LABELS} from '../../../constants/labels'
import {VALUES} from '../../../constants/values'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'
import {commitRemoveTeamViewMutation} from '../../../mutations/remove-team-view-mutation'
import {commitRemoveUserViewMutation} from '../../../mutations/remove-user-view-mutation'

type EditViewButtonProps = {
  currentView: EditViewButtonCurrentViewFragment$key
}

export const EditViewButton = ({currentView}: EditViewButtonProps) => {
  const {
    id: viewId,
    name: viewName,
    query: viewQuery,
    description: viewDescription,
    color: viewColor,
    icon: viewIcon,
  } = useFragment<EditViewButtonCurrentViewFragment$key>(
    graphql`
      fragment EditViewButtonCurrentViewFragment on Shortcutable {
        id
        name
        description
        icon
        color
        query
      }
    `,
    currentView,
  )
  const {isCustomView, setIsEditing, viewTeamId, canEditView, isQueryLoading} = useQueryContext()
  const {commitUserViewDuplicate, commitTeamViewDuplicate, commitUserViewEdit, commitTeamViewEdit, dirtySearchQuery} =
    useQueryEditContext()
  const relayEnvironment = useRelayEnvironment()
  const {navigateToUrl} = useAppNavigate()
  const store = relayEnvironment.getStore().getSource()
  const maxViewsReached =
    store
      .getRecordIDs()
      .filter(id => id.startsWith(viewTeamId ? SHARED_VIEW_GRAPHQL_ID_PREFIX : SAVED_VIEW_GRAPHQL_ID_PREFIX)).length >=
    VALUES.viewsPageSize

  const {addToast} = useToastContext()
  const {navigateToSharedView, navigateToSavedView, navigateToView} = useAppNavigate()
  const [queryEditActive, setQueryEditActive] = useState(false)
  const confirm = useConfirm()
  const {issues_react_dashboard_saved_views} = useFeatureFlags()

  useEffect(() => {
    const queryChanged = dirtySearchQuery !== viewQuery && !isQueryLoading
    setQueryEditActive(queryChanged && isCustomView(viewId))
  }, [dirtySearchQuery, isCustomView, isQueryLoading, viewId, viewQuery])

  useEffect(() => {
    setIsEditing(false)
  }, [setIsEditing])

  const saveQueryUpdate = useCallback(() => {
    const args = {
      viewId,
      onSuccess: () => {
        const url = searchUrl({viewId})
        navigateToUrl(url)
      },
      relayEnvironment,
    }

    viewTeamId ? commitTeamViewEdit(args) : commitUserViewEdit(args)
  }, [viewId, relayEnvironment, viewTeamId, commitTeamViewEdit, commitUserViewEdit, navigateToUrl])

  let sharedViewsConnectionId: string | undefined = undefined
  if (viewTeamId) {
    const teamObject = store.get(viewTeamId) as Record<string, Record<string, string>>

    const parentId = teamObject?.dashboard?.__ref
    if (parentId) {
      sharedViewsConnectionId = ConnectionHandler.getConnectionID(
        parentId, // passed as input to the mutation/subscription
        'TeamDashboard_shortcuts',
      )
    }
  }

  const duplicateView = useCallback(() => {
    const args = {
      viewName,
      viewIcon,
      viewColor,
      viewDescription,
      viewQuery,
      onError: () =>
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: LABELS.views.duplicateError,
        }),
      relayEnvironment,
    }
    if (viewTeamId && sharedViewsConnectionId) {
      // we have to find the connection id from the store

      commitTeamViewDuplicate({
        ...args,
        teamId: viewTeamId,
        sharedViewsConnectionId,
        onSuccess: ({createTeamDashboardSearchShortcut}) => {
          if (createTeamDashboardSearchShortcut?.shortcut) {
            navigateToSharedView(createTeamDashboardSearchShortcut.shortcut.id, viewTeamId, true)
          }
        },
      })
    } else {
      commitUserViewDuplicate({
        ...args,
        onSuccess: ({createDashboardSearchShortcut}) => {
          if (createDashboardSearchShortcut?.shortcut) {
            navigateToSavedView(createDashboardSearchShortcut.shortcut.id)
          }
        },
      })
    }
  }, [
    viewName,
    viewIcon,
    viewColor,
    viewDescription,
    viewQuery,
    relayEnvironment,
    viewTeamId,
    sharedViewsConnectionId,
    addToast,
    commitTeamViewDuplicate,
    navigateToSharedView,
    commitUserViewDuplicate,
    navigateToSavedView,
  ])

  const deleteView = useCallback(async () => {
    if (!viewId) return

    const performDelete = await confirm({
      title: LABELS.views.deleteTitle,
      content: LABELS.views.deleteContent(viewName),
      confirmButtonContent: LABELS.views.deleteConfirmationButton,
      confirmButtonType: 'danger',
    })

    if (!performDelete) return

    const payload = {
      environment: relayEnvironment,
      input: {shortcutId: viewId},
      onError: () =>
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: LABELS.views.deleteError,
        }),
      onCompleted: () => {
        navigateToView({viewId: ASSIGNED_TO_ME_VIEW.id, canEditView: true})
      },
    }

    if (viewTeamId) {
      commitRemoveTeamViewMutation(payload)
    } else {
      commitRemoveUserViewMutation(payload)
    }
  }, [addToast, confirm, navigateToView, relayEnvironment, viewId, viewName, viewTeamId])

  const duplicateLabel = maxViewsReached ? (
    <Tooltip aria-label={LABELS.views.maxViewsReached}>{LABELS.views.duplicate}</Tooltip>
  ) : (
    LABELS.views.duplicate
  )
  const canDuplicateView =
    viewId !== VIEW_IDS.repository &&
    (canEditView || !isCustomView) &&
    ((viewTeamId && sharedViewsConnectionId) || !viewTeamId)

  const canModifyCustomView = isCustomView(viewId) && canEditView

  if ((!canModifyCustomView && !canDuplicateView) || !issues_react_dashboard_saved_views) return null

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          icon={KebabHorizontalIcon}
          aria-label={LABELS.views.editButtonAriaLabel}
          sx={
            queryEditActive
              ? {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: 8,
                    height: 8,
                    border: '2px solid',
                    borderRadius: 100,
                    borderColor: 'canvas.subtle',
                    backgroundColor: 'attention.fg',
                    transform: 'translate(4px, -4px)',
                  },
                  position: 'relative',
                }
              : undefined
          }
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="small">
        <ActionList>
          {canModifyCustomView && (
            <>
              <ActionList.Item onSelect={() => setIsEditing(true)}>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                {LABELS.views.edit}
              </ActionList.Item>
              {queryEditActive && (
                <ActionList.Item onSelect={saveQueryUpdate}>
                  <ActionList.LeadingVisual>
                    <CheckCircleIcon />
                  </ActionList.LeadingVisual>
                  {LABELS.views.saveChangesToView}
                  <ActionList.TrailingVisual>
                    <Octicon icon={DotFillIcon} sx={{color: 'attention.fg'}} />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              )}
            </>
          )}
          {canDuplicateView && (
            <ActionList.Item onSelect={duplicateView} disabled={maxViewsReached}>
              <ActionList.LeadingVisual>
                <DuplicateIcon />
              </ActionList.LeadingVisual>
              {duplicateLabel}
            </ActionList.Item>
          )}
          {canModifyCustomView && (
            <ActionList.Item variant="danger" onSelect={deleteView}>
              <ActionList.LeadingVisual>
                <TrashIcon />
              </ActionList.LeadingVisual>
              {LABELS.views.delete}
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
