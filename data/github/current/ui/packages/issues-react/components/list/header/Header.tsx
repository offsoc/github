import {setTitle} from '@github-ui/document-metadata'
import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {CreateIssueButton} from '@github-ui/issue-create/CreateIssueButton'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {useNavigate} from '@github-ui/use-navigate'
import {ArrowLeftIcon, SidebarExpandIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button, Truncate} from '@primer/react'
import {useCallback, useEffect} from 'react'
import {graphql, useFragment} from 'react-relay'
import {useLocation} from 'react-router-dom'

import {useAppNavigate} from '../../../hooks/use-app-navigate'
import type {AppPayload} from '../../../types/app-payload'
import {getCurrentRepoIssuesUrl, isNewIssuePath} from '../../../utils/urls'
import type {EditViewButtonCurrentViewFragment$key} from './__generated__/EditViewButtonCurrentViewFragment.graphql'
import type {HeaderContentCurrentViewFragment$key} from './__generated__/HeaderContentCurrentViewFragment.graphql'
import type {HeaderCurrentViewFragment$key} from './__generated__/HeaderCurrentViewFragment.graphql'
import type {IconAndColorPickerViewFragment$key} from './__generated__/IconAndColorPickerViewFragment.graphql'
import {EditViewButton} from './EditViewButton'
import {HeaderContent} from './HeaderContent'
import {TEST_IDS} from '../../../constants/test-ids'
import {BUTTON_LABELS} from '../../../constants/buttons'
import {LABELS} from '../../../constants/labels'
import {VIEW_IDS} from '../../../constants/view-constants'
import {useNavigationContext} from '../../../contexts/NavigationContext'
import {useQueryContext} from '../../../contexts/QueryContext'
import {noop} from '@github-ui/noop'

type HeaderProps = {
  setSafeDocumentTitle?: boolean
  onCollapse?: () => void
  currentView: HeaderCurrentViewFragment$key &
    EditViewButtonCurrentViewFragment$key &
    HeaderContentCurrentViewFragment$key &
    IconAndColorPickerViewFragment$key
}

export function Header({currentView, onCollapse, setSafeDocumentTitle}: HeaderProps) {
  const {pathname} = useLocation()
  const isIssueCreatePage = isNewIssuePath(pathname)
  const {navigateToRoot, navigateToUrl} = useAppNavigate()
  const {isEditing, setIsEditing, canEditView, isNewView} = useQueryContext()

  const {
    id: viewId,
    name: viewName,
    query: viewQuery,
  } = useFragment<HeaderCurrentViewFragment$key>(
    graphql`
      fragment HeaderCurrentViewFragment on Shortcutable {
        id
        name
        query
      }
    `,
    currentView,
  )
  const {openNavigation} = useNavigationContext()
  const {scoped_repository, current_user_settings, paste_url_link_as_plain_text} = useAppPayload<AppPayload>()
  const {activeSearchQuery} = useQueryContext()

  const backFunction = useCallback(() => {
    if (viewId === VIEW_IDS.repository && activeSearchQuery !== viewQuery) {
      const url = getCurrentRepoIssuesUrl({query: activeSearchQuery})
      navigateToUrl(url)
    } else {
      navigateToRoot(viewId, viewQuery)
    }
  }, [activeSearchQuery, navigateToRoot, navigateToUrl, viewId, viewQuery])

  // Reset edit state on unmount, when changing views
  useEffect(() => setIsEditing(isNewView), [isNewView, setIsEditing, viewId])
  let title = LABELS.documentTitleForView()
  if (scoped_repository) {
    title = LABELS.documentTitleForRepository(scoped_repository.owner, scoped_repository.name)
  } else if (viewName) {
    title = LABELS.documentTitleForView(viewName)
  }
  if (ssrSafeDocument && title !== ssrSafeDocument.title) {
    setSafeDocumentTitle ? setTitle(ssrSafeDocument.title) : setTitle(title)
  }

  const navigate = useNavigate()

  return (
    <Box sx={{mb: 2}} data-testid={TEST_IDS.listHeader}>
      {isIssueCreatePage ? (
        <Box
          sx={{
            display: ['none', 'none', 'none', 'flex'],
            justifyContent: 'space-between',
            gap: 1,
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              flex: 1,
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* we are using an expand icon as primer's `SidebarCollapseIcon` expects the sidebar to be on the right */}
            {onCollapse && (
              <IconButtonWithTooltip
                variant="invisible"
                icon={SidebarExpandIcon}
                onClick={onCollapse}
                label="Collapse"
                shortcut="Mod+B"
                tooltipDirection="e"
              />
            )}
            <Button
              variant="invisible"
              onClick={backFunction}
              leadingVisual={ArrowLeftIcon}
              size="small"
              title={BUTTON_LABELS.returnToList}
              sx={{
                color: 'fg.default',
                px: 2,
                '> [data-component="text"]': {
                  overflow: 'hidden',
                }, // needed to truncate button text
              }}
            >
              <Truncate id="view-title" title={viewName} sx={{fontSize: 2, maxWidth: 250}}>
                {viewName}
              </Truncate>
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: [0, 0, 0, 2],
          }}
        >
          {!scoped_repository && (
            <Box sx={{display: ['block', 'block', 'block', 'none'], width: '100%'}}>
              <Button
                variant="invisible"
                size="small"
                onClick={openNavigation}
                trailingVisual={TriangleDownIcon}
                sx={{
                  color: 'fg.muted',
                  fontWeight: 'normal',
                  px: 2,
                  ml: -2,
                  justifyContent: 'flex-start',
                  '> span': {
                    mr: 0,
                    ml: 0,
                  },
                }}
              >
                {LABELS.allViews}
              </Button>
            </Box>
          )}
          <HeaderContent readOnly={!canEditView} currentView={currentView} />
          {!isEditing && (
            <Box sx={{display: 'flex', gap: 2}}>
              {!scoped_repository && (
                <CreateIssueButton
                  label={BUTTON_LABELS.newIssue}
                  navigate={navigate}
                  optionConfig={{
                    scopedRepository: scoped_repository,
                    useMonospaceFont: current_user_settings?.use_monospace_font || false,
                    singleKeyShortcutsEnabled: current_user_settings?.use_single_key_shortcut || false,
                    emojiSkinTonePreference: current_user_settings?.preferred_emoji_skin_tone,
                    pasteUrlsAsPlainText: paste_url_link_as_plain_text,
                    // Only navigate if we're in the Repo#Index (ie, have a scoped repository)
                    navigateToFullScreenOnTemplateChoice: navigate !== noop && scoped_repository !== null,
                    showFullScreenButton: true,
                  }}
                />
              )}
              <EditViewButton currentView={currentView} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
