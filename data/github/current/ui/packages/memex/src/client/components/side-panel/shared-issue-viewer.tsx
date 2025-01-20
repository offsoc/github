import {AnalyticsProvider} from '@github-ui/analytics-provider'
import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {IssueViewer} from '@github-ui/issue-viewer/IssueViewer'
import {IssueViewerContextProvider} from '@github-ui/issue-viewer/IssueViewerContextProvider'
import type {OptionConfig} from '@github-ui/issue-viewer/OptionConfig'
import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {noop} from '@github-ui/noop'
import {FeatureFlagProvider} from '@github-ui/react-core/feature-flag-provider'
import type {SubIssueSidePanelItem as SubIssueItem} from '@github-ui/sub-issues/sub-issue-types'
import {ArchiveIcon, LinkExternalIcon, ProjectSymlinkIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, Box} from '@primer/react'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useState} from 'react'

import {SubIssueSidePanelItem} from '../../api/memex-items/hierarchy'
import {SidePanelUI} from '../../api/stats/contracts'
import {getEnabledFeatures} from '../../helpers/feature-flags'
import {getInitialState} from '../../helpers/initial-state'
import {getIssueItemIdentifier} from '../../helpers/issue-url'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useArchiveMemexItemsWithConfirmation} from '../../hooks/use-archive-memex-items-with-confirmation'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useRemoveMemexItemWithConfirmation} from '../../hooks/use-remove-memex-items-with-id'
import {useSidePanel} from '../../hooks/use-side-panel'
import {useSidePanelDirtyState} from '../../hooks/use-side-panel-dirty-state'
import {removeMemexItemsFromQueryClient} from '../../state-providers/memex-items/query-client-api/memex-items'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'
import {IssueViewerResources} from '../../strings'
import {SidePanelToolbar} from './header'

type SharedIssueViewerProps = {owner: string; repo: string; number: number; url: string; itemId: number}

export function SharedIssueViewer(props: SharedIssueViewerProps) {
  const {loggedInUser, themePreferences, relayIds, projectOwner} = getInitialState()
  const {graphql_subscriptions} = useEnabledFeatures()
  const memexFeatureFlags = getEnabledFeatures()

  const [currentProps, setCurrentProps] = useState<
    Omit<SharedIssueViewerProps, 'itemId'> & {itemId: number | undefined}
  >(props)

  useEffect(() => {
    setCurrentProps(props)
  }, [props])

  const {hasWritePermissions} = ViewerPrivileges()
  const {items} = useMemexItems()
  const queryClient = useQueryClient()
  const {openProjectItemInPane, reloadPaneItem} = useSidePanel()

  const findMemexItemByIdentifier = useCallback(
    (itemIdentifier: ItemIdentifier) => {
      return items.find(item => {
        const comparisonIdentifier = item.getItemIdentifier()
        if (!comparisonIdentifier) return false
        return (
          comparisonIdentifier.owner === itemIdentifier.owner &&
          comparisonIdentifier.repo === itemIdentifier.repo &&
          comparisonIdentifier.number === itemIdentifier.number
        )
      })
    },
    [items],
  )

  // Handles opening a 'potential' memex item. Items found
  // within the current project will be opened in the sidepanel,
  // while items not found will be opened in a new tab.
  const openMemexItem = useCallback(
    (itemIdentifier: ItemIdentifier | undefined, url: string) => {
      const memexItem = itemIdentifier && findMemexItemByIdentifier(itemIdentifier)

      if (!memexItem || !itemIdentifier) {
        // Link is not to an issue in the project, open in new tab
        window.open(url, '_blank')
        return
      }

      openProjectItemInPane(memexItem)
      setCurrentProps({
        owner: itemIdentifier.owner,
        repo: itemIdentifier.repo,
        number: itemIdentifier.number,
        url,
        itemId: memexItem.id,
      })
    },
    [findMemexItemByIdentifier, openProjectItemInPane],
  )

  const onLinkClick = useCallback(
    (event: MouseEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.metaKey || event.shiftKey || event.button === 1 || !event.target) return
      if (!(event.target instanceof HTMLElement)) return

      const linkUrl = event.target.closest('a')?.href
      if (!linkUrl) return

      event.preventDefault()

      const itemIdentifier = getIssueItemIdentifier(linkUrl)

      openMemexItem(itemIdentifier, linkUrl)
    },
    [openMemexItem],
  )

  const onSubIssueClick = useCallback(
    (subIssueItem: SubIssueItem) => {
      const {id, owner, repo, number, url} = subIssueItem
      const memexItem = findMemexItemByIdentifier({owner, repo, number, type: 'Issue'})
      const sidePanelItem = new SubIssueSidePanelItem(subIssueItem)
      // If the sub-issue is an item in this project, update the side panel's references
      // Otherwise, only update the issue-viewer's content in place.
      if (memexItem) {
        openProjectItemInPane(memexItem)
      } else {
        openProjectItemInPane(sidePanelItem)
      }

      setCurrentProps({
        owner,
        repo,
        number,
        url,
        itemId: id,
      })
    },
    [findMemexItemByIdentifier, openProjectItemInPane],
  )

  const {closePane} = useSidePanel()

  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText: loggedInUser?.paste_url_link_as_plain_text ?? false,
    useMonospaceFont: themePreferences.markdown_fixed_width_font,
    emojiSkinTonePreference: themePreferences?.preferred_emoji_skin_tone,
  }

  const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation(undefined, undefined, undefined, () =>
    closePane({force: true}),
  )

  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(undefined, undefined, undefined, () =>
    closePane({force: true}),
  )

  const onOpenInNewTab = useCallback(() => {
    window.open(currentProps.url)
  }, [currentProps.url])

  const onCopyLinkInProject = useCallback(() => {
    navigator.clipboard.writeText(window.location.toString())
  }, [])

  const onArchiveInProject = useCallback(() => {
    if (currentProps.itemId) {
      openArchiveConfirmationDialog([currentProps.itemId], SidePanelUI)
    }
  }, [currentProps.itemId, openArchiveConfirmationDialog])

  const onDeleteFromProject = useCallback(() => {
    if (currentProps.itemId) {
      openRemoveConfirmationDialog([currentProps.itemId], SidePanelUI)
    }
  }, [currentProps.itemId, openRemoveConfirmationDialog])

  const customEditMenuEntries = [
    <ActionList.Item key="open-in-new-tab" onSelect={onOpenInNewTab}>
      <ActionList.LeadingVisual>
        <LinkExternalIcon />
      </ActionList.LeadingVisual>
      {IssueViewerResources.openInNewTab}
    </ActionList.Item>,
  ].concat(
    // Currently, non-memex items shown in the sidepanel cannot be navigated to directly.
    // In those cases, hide the menu option for copying the project link.
    currentProps.itemId
      ? [
          <ActionList.Item key="copy-link-in-project" onSelect={onCopyLinkInProject}>
            <ActionList.LeadingVisual>
              <ProjectSymlinkIcon />
            </ActionList.LeadingVisual>
            {IssueViewerResources.copyLinkInProject}
          </ActionList.Item>,
        ]
      : [],
    currentProps.itemId && hasWritePermissions
      ? [
          <ActionList.Item key="archive-in-project" onSelect={onArchiveInProject}>
            <ActionList.LeadingVisual>
              <ArchiveIcon />
            </ActionList.LeadingVisual>
            {IssueViewerResources.archiveInProject}
          </ActionList.Item>,
          <ActionList.Item variant="danger" key="delete-from-project" onSelect={onDeleteFromProject}>
            <ActionList.LeadingVisual>
              <TrashIcon />
            </ActionList.LeadingVisual>
            {IssueViewerResources.deleteFromProject}
          </ActionList.Item>,
        ]
      : [],
  )

  const onIssueUpdate = useCallback(() => {
    reloadPaneItem()
  }, [reloadPaneItem])

  const onIssueDelete = useCallback(async () => {
    if (currentProps.itemId) {
      removeMemexItemsFromQueryClient(queryClient, [currentProps.itemId])
    }
    closePane({force: true})
  }, [closePane, currentProps.itemId, queryClient])

  const onClose = useCallback(() => {
    closePane({force: true})
    reloadPaneItem()
  }, [closePane, reloadPaneItem])

  const [activeCommentEdits, setActiveCommentEdits] = useState<Readonly<Record<string, boolean>>>({})
  const [, setCommentsDirty] = useSidePanelDirtyState()
  const [, setBodyDirty] = useSidePanelDirtyState()

  useEffect(() => {
    // Whenever the active comment edit state changes, update the dirty state to sync
    // so that if there is any comment being edited, the state is dirty
    setCommentsDirty(Object.values(activeCommentEdits).some(s => s))
  }, [activeCommentEdits, setCommentsDirty])

  const {owner, repo, number} = currentProps

  const optionConfig: OptionConfig = {
    withLiveUpdates: graphql_subscriptions,
    commentBoxConfig,
    onLinkClick,
    selectedProjectId: relayIds?.memexProject,
    allowedProjectOwner: projectOwner?.login,
    customEditMenuEntries,
    issueQueriesFetchingPolicy: {
      fetchPolicy: 'store-and-network',
    },
    onIssueUpdate,
    timelineEventBaseUrl: `/${owner}/${repo}/issues`,
    onIssueDelete,
    onClose,
    showRepositoryPill: true,
    navigateBack: onClose,
    navigate: noop,
    titleAs: 'h2',
    innerSx: {
      pl: 3,
      pr: 3,
    },
    additionalHeaderActions: <SidePanelToolbar showCloseButton={false} />,
    onCommentEditStart(commentId) {
      setActiveCommentEdits(previousCommentEditStates => {
        if (previousCommentEditStates[commentId]) return previousCommentEditStates
        return {
          ...previousCommentEditStates,
          [commentId]: true,
        }
      })
    },
    onCommentEditCancel(commentId) {
      setActiveCommentEdits(previousCommentEditStates => {
        if (!previousCommentEditStates[commentId]) return previousCommentEditStates
        return {
          ...previousCommentEditStates,
          [commentId]: false,
        }
      })
    },
    onIssueEditStateChange: setBodyDirty,
    useViewportQueries: false, // We don't want to use viewport queries, because we mount in the side panel
    onSubIssueClick,
    insideSidePanel: true,
    singleKeyShortcutsEnabled: loggedInUser?.use_single_key_shortcut ?? false,
  }

  return (
    <Box sx={{position: 'relative', height: '100%'}}>
      <Box sx={{m: 0, height: '100%'}}>
        <IssueViewerContextProvider>
          <FeatureFlagProvider features={memexFeatureFlags}>
            <AnalyticsProvider appName="memex" category="Memex Project" metadata={{}}>
              <IssueViewer
                itemIdentifier={{
                  owner,
                  repo,
                  number,
                  type: 'Issue',
                }}
                optionConfig={optionConfig}
              />
            </AnalyticsProvider>
          </FeatureFlagProvider>
        </IssueViewerContextProvider>
      </Box>
    </Box>
  )
}
