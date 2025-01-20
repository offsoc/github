import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {useHovercardClickIntercept} from '@github-ui/use-link-interception/use-hovercard-click-intercept'
import {IssueViewer} from '@github-ui/issue-viewer/IssueViewer'
import {ISSUE_VIEWER_DEFAULT_CONFIG, type IssueViewerPreloadedQueries} from '@github-ui/issue-viewer/OptionConfig'

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {Box, IconButton} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import type React from 'react'
import {Suspense, useCallback, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {TEST_IDS} from '../../constants/test-ids'
import {EMPTY_VIEW} from '../../constants/view-constants'
import {useAppNavigate} from '../../hooks/use-app-navigate'
import {useRouteInfo} from '../../hooks/use-route-info'
import type {AppPayload} from '../../types/app-payload'
import {isUrlInRepoIssuesContext, timelineEventBaseUrl} from '../../utils/urls'
import type {IssueDetailCurrentViewFragment$key} from './__generated__/IssueDetailCurrentViewFragment.graphql'
import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {IssueSidePanel} from './IssueSidePanel'
import {ScreenFullIcon} from '@primer/octicons-react'
import {LABELS} from '../../constants/labels'
import type {SubIssueSidePanelItem} from '@github-ui/sub-issues/sub-issue-types'

type IssueDetailProps = {
  fetchedView: IssueDetailCurrentViewFragment$key
  preloadedQueries: IssueViewerPreloadedQueries
}

export const IssueDetail = ({fetchedView, preloadedQueries}: IssueDetailProps) => {
  const {itemIdentifier, viewId} = useRouteInfo()
  const {onIssueHrefLinkClick, navigateToRoot} = useAppNavigate()
  const {query: viewQuery} = useFragment(
    graphql`
      fragment IssueDetailCurrentViewFragment on Shortcutable {
        name
        query
      }
    `,
    fetchedView, // check for null above
  )

  const {graphql_subscriptions} = useFeatureFlags()
  const appPayload = useAppPayload<AppPayload>()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false
  const singleKeyShortcutsEnabled = appPayload?.current_user_settings?.use_single_key_shortcut || false
  const emojiSkinTonePreference = appPayload?.current_user_settings?.preferred_emoji_skin_tone
  const showRepositoryPill = !appPayload.scoped_repository
  const withLiveUpdates = graphql_subscriptions || false
  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText,
    useMonospaceFont,
    emojiSkinTonePreference,
  }

  const navigateBack = useCallback(() => {
    navigateToRoot(viewId ?? EMPTY_VIEW.id, viewQuery)
  }, [viewId, viewQuery, navigateToRoot])
  const {navigateToUrl} = useAppNavigate()
  const [sidePanelItemIdentifier, setSidePanelItemIdentifier] = useState<ItemIdentifier | null>(null)
  const [sidePanelItemUrl, setSidePanelItemUrl] = useState<string | undefined>(undefined)

  const onSubIssueClick = useCallback((subIssueItem: SubIssueSidePanelItem) => {
    const {owner, repo, number, url} = subIssueItem
    setSidePanelItemIdentifier({owner, repo, number, type: 'Issue'})
    setSidePanelItemUrl(url)
  }, [])
  const onCloseSidePanel = useCallback(() => {
    setSidePanelItemIdentifier(null)
  }, [])

  const onParentIssueActivate = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent, parentIdentifier: ItemIdentifier): boolean => {
      if (!itemIdentifier) return false

      // Only close the side panel if the parent is the same as the current issue
      if (
        parentIdentifier.owner !== itemIdentifier.owner ||
        parentIdentifier.repo !== itemIdentifier.repo ||
        parentIdentifier.number !== itemIdentifier.number
      ) {
        return false
      }

      e.preventDefault()
      onCloseSidePanel()
      return true
    },
    [itemIdentifier, onCloseSidePanel],
  )

  useHovercardClickIntercept((targetUrl, event) => {
    // Soft navigation works only for issues in the same repo
    if (isUrlInRepoIssuesContext(targetUrl, itemIdentifier?.owner || '', itemIdentifier?.repo || '')) {
      return
    }

    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    navigateToUrl(link)
  })

  return (
    <>
      <Box sx={{height: '100%'}} data-testid={TEST_IDS.issueViewerContainer}>
        <Suspense fallback={<span>Loading Issue...</span>}>
          {itemIdentifier && (
            <IssueViewer
              itemIdentifier={itemIdentifier}
              optionConfig={{
                withLiveUpdates,
                singleKeyShortcutsEnabled,
                showRepositoryPill,
                showIssueCreateButton: true,
                showReloadInOldExperience: appPayload?.current_user?.is_staff,
                onLinkClick: onIssueHrefLinkClick,
                navigateBack,
                navigate: navigateToUrl,
                preloadedQueries,
                commentBoxConfig,
                responsiveRightSidepanel: true,
                timelineEventBaseUrl: timelineEventBaseUrl(
                  appPayload?.scoped_repository?.name,
                  appPayload?.scoped_repository?.owner,
                ),
                titleAs: 'h1',
                scrollToTopOnClick: true,
                onSubIssueClick,
                useViewportQueries: true, // This is a full page view, so we want to use viewport queries
                /*
                 * Toggling between false and undefined allows us to distinguish if the side panel is open or not
                 * from the full page view without adding an additional prop
                 */
                insideSidePanel: sidePanelItemIdentifier ? false : undefined,
              }}
            />
          )}
        </Suspense>
      </Box>
      {sidePanelItemIdentifier && (
        <IssueSidePanel onClose={onCloseSidePanel}>
          <IssueViewer
            itemIdentifier={sidePanelItemIdentifier}
            optionConfig={Object.assign({}, ISSUE_VIEWER_DEFAULT_CONFIG, {
              responsiveRightSidepanel: false,
              shouldSkipSetDocumentTitle: true,
              onClose: onCloseSidePanel,
              insideSidePanel: true,
              singleKeyShortcutsEnabled,
              onSubIssueClick,
              onParentIssueActivate,
              additionalHeaderActions: (
                <Tooltip text={LABELS.sidePanelTooltip} sx={{position: 'absolute'}}>
                  {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                  <IconButton
                    unsafeDisableTooltip={true}
                    as="a"
                    role="link"
                    variant="invisible"
                    icon={ScreenFullIcon}
                    aria-label={LABELS.sidePanelTooltip}
                    href={sidePanelItemUrl}
                  />
                </Tooltip>
              ),
            })}
          />
        </IssueSidePanel>
      )}
    </>
  )
}
