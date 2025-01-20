import {noop} from '@github-ui/noop'
import {PlusIcon} from '@primer/octicons-react'
import {Box, Octicon, TreeView, useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'
import {useAppNavigate} from '../../../hooks/use-app-navigate'
import {commitRemoveUserViewMutation} from '../../../mutations/remove-user-view-mutation'
import {commitRemoveTeamViewMutation} from '../../../mutations/remove-team-view-mutation'

type Props = {
  teamId: string
  sharedViewsConnectionId: string
}

export function CreateSharedView({teamId, sharedViewsConnectionId}: Props) {
  const {commitTeamViewCreate, dirtyDescription, dirtySearchQuery, dirtyTitle} = useQueryEditContext()
  const {isNewView, dirtyViewId, setDirtyViewId, dirtyViewType, setDirtyViewType} = useQueryContext()
  const relayEnvironment = useRelayEnvironment()
  const confirm = useConfirm()

  const {navigateToSharedView} = useAppNavigate()

  const deleteDirtyView = useCallback(() => {
    if (dirtyViewId === undefined) {
      return
    }

    const payload = {
      environment: relayEnvironment,
      input: {shortcutId: dirtyViewId},
      onError: noop,
      onCompleted: noop,
    }

    dirtyViewType === 'team' ? commitRemoveTeamViewMutation(payload) : commitRemoveUserViewMutation(payload)
  }, [dirtyViewId, dirtyViewType, relayEnvironment])

  const createNewSharedView = useCallback(async () => {
    if (isNewView && (dirtyTitle !== LABELS.views.defaultName || dirtySearchQuery !== '' || dirtyDescription !== '')) {
      const discardChanges = await confirm({
        title: LABELS.views.unsavedChangesTitle,
        content: LABELS.views.unsavedChangesContent,
        confirmButtonType: 'danger',
      })
      if (!discardChanges) {
        return
      }
    }

    deleteDirtyView()
    commitTeamViewCreate({
      teamId,
      sharedViewsConnectionId,
      onSuccess: ({createTeamDashboardSearchShortcut}) => {
        if (createTeamDashboardSearchShortcut?.shortcut) {
          setDirtyViewId(createTeamDashboardSearchShortcut.shortcut.id)
          setDirtyViewType('team')
          navigateToSharedView(createTeamDashboardSearchShortcut.shortcut.id, teamId, true, true)
        }
      },
      relayEnvironment,
    })
  }, [
    commitTeamViewCreate,
    confirm,
    deleteDirtyView,
    dirtyDescription,
    dirtySearchQuery,
    dirtyTitle,
    isNewView,
    navigateToSharedView,
    relayEnvironment,
    setDirtyViewId,
    setDirtyViewType,
    sharedViewsConnectionId,
    teamId,
  ])

  return (
    <TreeView.Item
      onSelect={event => {
        createNewSharedView()
        event.preventDefault()
        event.stopPropagation()
      }}
      id="create-shared-view-item"
    >
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
        <Octicon icon={PlusIcon} />
        {LABELS.views.createLink}
      </Box>
    </TreeView.Item>
  )
}
