import {noop} from '@github-ui/noop'
import {PlusIcon} from '@primer/octicons-react'
import {Box, Octicon, TreeView, useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {LABELS} from '../../constants/labels'
import {useQueryEditContext, useQueryContext} from '../../contexts/QueryContext'
import {useAppNavigate} from '../../hooks/use-app-navigate'
import {commitRemoveTeamViewMutation} from '../../mutations/remove-team-view-mutation'
import {commitRemoveUserViewMutation} from '../../mutations/remove-user-view-mutation'

export function CreateSavedView() {
  const {commitUserViewCreate, dirtyDescription, dirtySearchQuery, dirtyTitle} = useQueryEditContext()
  const {dirtyViewId, setDirtyViewId, dirtyViewType, setDirtyViewType, isNewView} = useQueryContext()
  const relayEnvironment = useRelayEnvironment()
  const confirm = useConfirm()

  const {navigateToSavedView} = useAppNavigate()

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

  const createNewView = useCallback(async () => {
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
    commitUserViewCreate({
      onSuccess: ({createDashboardSearchShortcut}) => {
        if (createDashboardSearchShortcut?.shortcut) {
          setDirtyViewId(createDashboardSearchShortcut.shortcut.id)
          setDirtyViewType('user')
          navigateToSavedView(createDashboardSearchShortcut.shortcut.id, true)
        }
      },
      relayEnvironment,
    })
  }, [
    commitUserViewCreate,
    confirm,
    deleteDirtyView,
    dirtyDescription,
    dirtySearchQuery,
    dirtyTitle,
    isNewView,
    navigateToSavedView,
    relayEnvironment,
    setDirtyViewId,
    setDirtyViewType,
  ])

  return (
    <TreeView.Item
      id="create-saved-view"
      onSelect={event => {
        createNewView()
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
        <Octicon icon={PlusIcon} />
        {LABELS.views.createLink}
      </Box>
    </TreeView.Item>
  )
}
