import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, NavList, Octicon, Tooltip, TreeView, useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {Link} from 'react-router-dom'

import {LABELS} from '../../constants/labels'
import {useQueryContext, useQueryEditContext} from '../../contexts/QueryContext'
import {useNavigationContext} from '../../contexts/NavigationContext'
import {searchUrl} from '../../utils/urls'
import {VIEW_COLOR_FOREGROUND_MAP} from './ColorHelper'
import {iconToPrimerIcon} from './IconHelper'

type Props = {
  id?: string
  icon: string
  color: string
  tooltip?: string
  title: string
  description?: string
  query: string
  position: number
  isTree: boolean
}

export function SavedViewItem({id, icon, color, tooltip, title, position, isTree}: Props) {
  const {setViewPosition, setViewTeamId, setCanEditView, isNewView, setIsNewView} = useQueryContext()
  const {dirtyDescription, dirtySearchQuery, dirtyTitle, setDirtyDescription} = useQueryEditContext()
  const {closeNavigation} = useNavigationContext()

  const {pathname} = ssrSafeLocation
  const navigate = useNavigate()
  const confirm = useConfirm()
  const isCurrent = pathname.endsWith(id ?? '')
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

    setIsNewView(false)
    navigate(url)
    setDirtyDescription('')
    setViewPosition(position)
    setViewTeamId(undefined)
    setCanEditView(true)
    closeNavigation()
  }, [
    isNewView,
    dirtyTitle,
    dirtySearchQuery,
    dirtyDescription,
    setIsNewView,
    navigate,
    url,
    setDirtyDescription,
    setViewPosition,
    position,
    setViewTeamId,
    setCanEditView,
    closeNavigation,
    confirm,
  ])

  const onSelect = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent<HTMLElement>) => {
      submitQuery()
      event.preventDefault()
      event.stopPropagation()
    },
    [submitQuery],
  )
  // Slot cause problems with SSR since the component is rendered in a second pass
  // https://github.com/github/primer/issues/1224
  const itemText = (
    <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
      <Octicon icon={iconToPrimerIcon(icon)!} sx={{color: VIEW_COLOR_FOREGROUND_MAP[color]}} />
      {tooltip ? <Tooltip aria-label={tooltip}>{title}</Tooltip> : title}
    </Box>
  )

  return isTree ? (
    <TreeView.Item onSelect={onSelect} current={isCurrent} id={`${id}-shared-view-item`} data-testid="shared-view-item">
      {itemText}
    </TreeView.Item>
  ) : (
    <NavList.Item to={url} as={Link} aria-current={isCurrent ? 'page' : undefined} onClick={onSelect}>
      {itemText}
    </NavList.Item>
  )
}
