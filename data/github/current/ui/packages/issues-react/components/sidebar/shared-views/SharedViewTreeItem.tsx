import {Box, Octicon, TreeView, useConfirm} from '@primer/react'
import {useCallback, useTransition} from 'react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'

import {searchUrl} from '../../../utils/urls'
import {VIEW_COLOR_FOREGROUND_MAP} from '../ColorHelper'
import {customViewIconToPrimerIcon} from '../IconHelper'
import type {SharedViewTreeItem$key} from './__generated__/SharedViewTreeItem.graphql'
import {useNavigationContext} from '../../../contexts/NavigationContext'
import {useAppNavigate} from '../../../hooks/use-app-navigate'
import {useRouteInfo} from '../../../hooks/use-route-info'

type SharedViewTreeItemProps = {
  treeItem: SharedViewTreeItem$key
  teamId: string
  canEditView: boolean
}

export const SharedViewTreeItem = ({treeItem, teamId, canEditView}: SharedViewTreeItemProps) => {
  const item = useFragment(
    graphql`
      fragment SharedViewTreeItem on TeamSearchShortcut {
        id
        icon
        name
        query
        color
      }
    `,
    treeItem,
  )

  const {viewId} = useRouteInfo()

  const {icon, id, name, color, query} = item
  const iconcompo = customViewIconToPrimerIcon(icon)!
  const isCurrent = id === viewId

  const {setViewTeamId, setCanEditView, isNewView, setIsNewView, setIsQueryLoading, executeQuery} = useQueryContext()
  const {dirtyDescription, dirtySearchQuery, dirtyTitle, setDirtyDescription} = useQueryEditContext()
  const {closeNavigation} = useNavigationContext()
  const {navigateToUrl} = useAppNavigate()
  const confirm = useConfirm()
  const [, startTransition] = useTransition()

  const url = searchUrl({viewId: id})

  const submitQuery = useCallback(async () => {
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

    if (query !== '' && executeQuery !== undefined) {
      setIsQueryLoading(true)
      startTransition(() => {
        executeQuery(query)
      })
    }

    setIsNewView(false)
    // this is required because the TreeView.LinkItem does not work like the NavList.Item
    navigateToUrl(url)
    setDirtyDescription('')
    setViewTeamId(teamId)
    setCanEditView(canEditView)
    // TODO: figure out keyboard navigation
    // setViewPosition(position)
    closeNavigation()
  }, [
    isNewView,
    dirtyTitle,
    dirtySearchQuery,
    dirtyDescription,
    query,
    setIsNewView,
    navigateToUrl,
    url,
    setDirtyDescription,
    setViewTeamId,
    teamId,
    setCanEditView,
    canEditView,
    closeNavigation,
    confirm,
    setIsQueryLoading,
    executeQuery,
  ])

  return (
    <TreeView.Item
      onSelect={event => {
        submitQuery()
        event.preventDefault()
        event.stopPropagation()
      }}
      current={isCurrent}
      id={`${id}-shared-view-item`}
    >
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
        <Octicon icon={iconcompo} sx={{color: VIEW_COLOR_FOREGROUND_MAP[color]}} />
        {name}
      </Box>
    </TreeView.Item>
  )
}
