// eslint-disable-next-line filenames/match-regex
import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {PreloadedQuery, UseQueryLoaderLoadQueryOptions} from 'react-relay/hooks'

import {noop} from '@github-ui/noop'
import type {TitleProps} from '@primer/react/experimental'
import type {IssueViewerViewQuery} from './__generated__/IssueViewerViewQuery.graphql'
import type {SubIssueSidePanelItem} from '@github-ui/sub-issues/sub-issue-types'
import type {ItemIdentifier} from '../types/issue'

export type IssueViewerPreloadedQueries = {
  issueViewerViewQuery: PreloadedQuery<IssueViewerViewQuery>
}

export type OptionConfig = {
  /** function to (soft) navigate to a given url */
  navigate: (url: string) => void
  /** preloaded queries to use for the issue viewer - coming from the relay entrypoint */
  preloadedQueries?: IssueViewerPreloadedQueries
  /** function to be called when a link is clicked */
  onLinkClick?: (event: MouseEvent) => void
  /** function to be called when the close button in the actions toolbar is clicked */
  onClose?: () => void
  /** function to navigate back to the previous page */
  navigateBack?: () => void
  /** the graphQL id of the project to open in the sidebar */
  selectedProjectId?: string
  /** the owner of the projects to include in the sidebar */
  allowedProjectOwner?: string
  skipDocumentTitleUpdates?: boolean
  showRepositoryPill?: boolean
  showIssueCreateButton?: boolean
  showReloadInOldExperience?: boolean
  withLiveUpdates?: boolean
  singleKeyShortcutsEnabled?: boolean
  customEditMenuEntries?: JSX.Element[]
  commentBoxConfig?: CommentBoxConfig
  shouldSkipSetDocumentTitle?: boolean
  /** Fetching policies for the queries related to the issue number */
  issueQueriesFetchingPolicy?: UseQueryLoaderLoadQueryOptions
  /** callback when there was an update to the issue (except adding a comment) */
  onIssueUpdate?: () => void
  /** callback when a new comment was added to the issue */
  onNewIssueComment?: () => void
  timelineEventBaseUrl?: string
  /** callback when the issue was deleted */
  onIssueDelete?: () => void
  /** heading level for the title */
  titleAs?: TitleProps['as']
  /** optional style props for the inner content */
  innerSx?: BetterSystemStyleObject
  /** additional actions to render in the header menu */
  additionalHeaderActions?: React.ReactNode
  /**
   * Called when an edit for a comment is canceled (e.g., user cleared the comment textarea)
   * @param commentId A unique ID for the given comment edit - either a new comment or existing comment
   */
  onCommentEditCancel?: (commentId: string) => void
  /**
   * Called when an edit for a comment is started (e.g., user started typing in the comment box)
   * @param commentId A unique ID for the given comment edit - either a new comment or existing comment
   */
  onCommentEditStart?: (commentId: string) => void
  /**
   * Called whenever the issue edit state changes (e.g., start changing body, canceled editing body)
   * @param isEditing Whether or not the issue body is currently being edited
   */
  onIssueEditStateChange?: (isEditing: boolean) => void
  /** Whether or not to prefetch the interaction data (e.g., milestoness) */
  prefetchInteractionDataEnabled?: boolean
  /** Whether to render the right sidepanel in an overlay for smaller screen sizes */
  responsiveRightSidepanel?: boolean
  /** Whether clicking the issue title in the sticky header should scroll to the top of the page or navigate away */
  scrollToTopOnClick?: boolean
  /** Used to control the behavior of clicking on a sub-issue in the sub-issue list view i.e. open in side-panel */
  onSubIssueClick?: (subIssueItem: SubIssueSidePanelItem) => void
  /** Used to control the behavior of clicking on the parent issue in the issue header i.e. close the side-panel */
  onParentIssueActivate?: (e: React.MouseEvent | React.KeyboardEvent, parentItemIdentifier: ItemIdentifier) => boolean
  /**
   * If true, use CSS Viewport queries for responsive layout. If false, use JS width listener.
   * @note This assumes that the IssueViewer is mounted to the root of the app and not inside a container.
   */
  useViewportQueries?: boolean
  /**
   * If true, indicates that the issue-viewer is within the currently opened side-panel. This is done
   * so that we have a quick way to determine whether the component accessing this is inside
   * of the side-panel or not without the need to search the dom with something like `.contains()`.
   * If false, the issue-viewer is not inside the open side-panel.
   * If undefined, the side panel is not open.
   */
  insideSidePanel?: boolean
}

export const ISSUE_VIEWER_DEFAULT_CONFIG: OptionConfig = {
  navigate: noop,
  navigateBack: noop,
  onIssueUpdate: noop,
  onNewIssueComment: noop,
  preloadedQueries: undefined,
  onLinkClick: noop,
  onClose: noop,
  withLiveUpdates: false,
  singleKeyShortcutsEnabled: false,
  skipDocumentTitleUpdates: undefined,
  showRepositoryPill: undefined,
  showReloadInOldExperience: false,
  selectedProjectId: undefined,
  allowedProjectOwner: undefined,
  commentBoxConfig: {
    pasteUrlsAsPlainText: false,
    useMonospaceFont: false,
    emojiSkinTonePreference: undefined,
  },
  customEditMenuEntries: undefined,
  shouldSkipSetDocumentTitle: false,
  issueQueriesFetchingPolicy: undefined,
  timelineEventBaseUrl: undefined,
  titleAs: 'h1',
  innerSx: undefined,
  responsiveRightSidepanel: false,
  useViewportQueries: false,
}
