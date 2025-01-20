import {useItemPickersContext} from '@github-ui/item-picker/ItemPickersContext'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {Box, Heading, IconButton, Overlay} from '@primer/react'
import {Suspense, useEffect, useRef, useCallback, useState, useMemo} from 'react'
import {type PreloadedQuery, useQueryLoader, graphql, usePreloadedQuery} from 'react-relay'
import {useFragment} from 'react-relay/hooks'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import {noop} from '@github-ui/noop'
import type {MarkdownComposerRef} from '@github-ui/commenting/useMarkdownBody'
import {IssueCommentComposer} from '@github-ui/commenting/IssueCommentComposer'
import {useCommentEditsContext} from '@github-ui/commenting/CommentEditsContext'
import {VALUES} from '@github-ui/commenting/Values'
import {SubIssuesList} from '@github-ui/sub-issues/SubIssuesList'
import {useCanEditSubIssues} from '@github-ui/sub-issues/useCanEditSubIssues'
import {useHasSubIssues} from '@github-ui/sub-issues/useHasSubIssues'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

import {IssueBody} from '@github-ui/issue-body/IssueBody'

import {TEST_IDS} from '../constants/test-ids'
import {IDS} from '../constants/ids'
import {CLASS_NAMES} from '../constants/class-names'
import {useInputElementActiveContext} from '../contexts/InputElementActiveContext'
import type {ItemIdentifier} from '../types/issue'
import {Header} from './header/Header'
import {IssueTimeline} from './IssueTimeline'
import {renderIssueViewerErrors} from './shared/IssueViewerError'
import type {IssueViewerViewQuery} from './__generated__/IssueViewerViewQuery.graphql'
import {IssueViewerLoading} from './IssueViewerLoading'
import type {IssueViewerViewer$key} from './__generated__/IssueViewerViewer.graphql'
import type {IssueViewerIssue$key} from './__generated__/IssueViewerIssue.graphql'
import {ContentWrapper} from './ContentWrapper'
import {InfoIcon, XIcon} from '@primer/octicons-react'
import {ISSUE_VIEWER_DEFAULT_CONFIG, type OptionConfig} from './OptionConfig'
import {ISSUE_EVENTS} from '@github-ui/timeline-items/Events'
import {LABELS} from '@github-ui/timeline-items/Labels'
import {getHighlightedEventText} from '@github-ui/timeline-items/HighlightedEvent'
import {useBeforeUnload} from 'react-router-dom'
import {useHash} from '../hooks/use-hash'
import {IssueSidebar} from './IssueSidebar'
import {EmuContributionBlockedBanner} from './EmuContributionBlockedBanner'
import {IssueTimelineLoading} from './IssueTimelineLoading'
import {SubIssuesCreateDialog} from '@github-ui/sub-issues/SubIssuesCreateDialog'
import {useSubIssueState} from '@github-ui/sub-issues/SubIssueStateContext'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {IssueTimelineErrorFallback} from './IssueTimelineErrorFallback'
import type {IssueViewerSecondaryIssueData$data} from './__generated__/IssueViewerSecondaryIssueData.graphql'
import type {LazyContributorFooter$key} from '@github-ui/contributor-footer/LazyContributorFooter.graphql'
import {useSecondaryQuery} from './IssueViewerSecondaryView'
import type {IssueViewerSecondaryViewQueryRepoData$data} from './__generated__/IssueViewerSecondaryViewQueryRepoData.graphql'

export type IssueViewerQueries = {
  issueViewerViewQuery: IssueViewerViewQuery
}

type IssueViewerProps = {
  itemIdentifier: ItemIdentifier
  optionConfig?: OptionConfig
}

type IssueViewerSecondaryDataProps = {
  secondaryIssueData?: IssueViewerSecondaryIssueData$data
  secondaryRepoData?: IssueViewerSecondaryViewQueryRepoData$data
}

type IssueViewerInternalProps = {
  optionConfig: OptionConfig
  issueViewerViewRef: PreloadedQuery<IssueViewerViewQuery>
  containerRef: React.RefObject<HTMLDivElement>
} & IssueViewerSecondaryDataProps

type IssueViewerInternalFragmentProps = {
  optionConfig: OptionConfig
  viewerFragment: IssueViewerViewer$key | null
  issueFragment: IssueViewerIssue$key
  containerRef: React.RefObject<HTMLDivElement>
  isRepoOwnerEnterpriseManaged?: boolean | null
} & IssueViewerSecondaryDataProps

type IssueViewerWithSecondaryProps = IssueViewerInternalProps & {
  owner: string
  repo: string
  number: number
}

export const IssueViewerSecondaryIssueDataFragment = graphql`
  fragment IssueViewerSecondaryIssueData on Issue {
    ...HeaderSecondary
    ...HeaderParentTitle
    ...IssueCommentComposerSecondary
    ...IssueTimelineSecondary
    ...IssueSidebarLazySections
    ...IssueSidebarSecondary
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...TaskListStatusFragment
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...TrackedByFragment
    ...IssueBodyHeaderSecondaryFragment
    ...IssueBodySecondaryFragment
    # sub-issues
    ...SubIssuesList
    ...SubIssuesCreateDialog
    ...HeaderSubIssueSummary
  }
`

export const IssueViewerViewGraphqlQuery = graphql`
  query IssueViewerViewQuery($repo: String!, $owner: String!, $number: Int!, $allowedOwner: String) {
    repository(name: $repo, owner: $owner) {
      isOwnerEnterpriseManaged
      issue(number: $number) @required(action: THROW) {
        ...IssueViewerIssue @arguments(allowedOwner: $allowedOwner)
      }
    }
    safeViewer {
      ...IssueViewerViewer
    }
  }
`

const issueViewerViewFragment = graphql`
  fragment IssueViewerIssue on Issue @argumentDefinitions(allowedOwner: {type: "String", defaultValue: null}) {
    id
    # eslint-disable-next-line relay/unused-fields the updatedAt field is used for an experiment to count the different version of an issue
    updatedAt
    ...useHasSubIssues
    ...useCanEditSubIssues
    ...Header
    ...IssueBody
    ...IssueCommentComposer
    ...IssueSidebarPrimaryQuery @arguments(allowedOwner: $allowedOwner)
    ...IssueTimelinePaginated @arguments(numberOfTimelineItems: 15)
    ...HeaderSubIssueSummary
  }
`
export const issueViewerViewerFragment = graphql`
  fragment IssueViewerViewer on User {
    enterpriseManagedEnterpriseId
    login
    ...IssueCommentComposerViewer
    # this is intentional to have the current viewer preloaded for the item pickers
    # eslint-disable-next-line relay/must-colocate-fragment-spreads this is required by the item pickers
    ...AssigneePickerAssignee
    ...SubIssuesListViewViewer
  }
`

export function IssueViewer({itemIdentifier, optionConfig = ISSUE_VIEWER_DEFAULT_CONFIG}: IssueViewerProps) {
  const {repo, owner, number} = itemIdentifier

  const [issueViewerViewRef, loadIssueViewerView] = useQueryLoader<IssueViewerViewQuery>(
    IssueViewerViewGraphqlQuery,
    optionConfig.preloadedQueries?.issueViewerViewQuery,
  )
  const issueViewerContainerRef = useRef<HTMLDivElement>(null)

  const fetchPolicy = optionConfig.issueQueriesFetchingPolicy?.fetchPolicy
  const {sub_issues} = useFeatureFlags()
  useEffect(() => {
    if (!optionConfig.preloadedQueries?.issueViewerViewQuery) {
      loadIssueViewerView(
        {
          owner,
          repo,
          number,
          allowedOwner: optionConfig.allowedProjectOwner ?? null,
        },
        {fetchPolicy},
      )
    }
  }, [
    loadIssueViewerView,
    owner,
    repo,
    optionConfig.preloadedQueries?.issueViewerViewQuery,
    optionConfig.allowedProjectOwner,
    fetchPolicy,
    number,
    sub_issues,
  ])

  if (!issueViewerViewRef) return <IssueViewerLoading optionConfig={optionConfig} />

  return (
    <PreloadedQueryBoundary
      key={`${owner}-${repo}-${number}`}
      onRetry={() =>
        loadIssueViewerView(
          {
            owner,
            repo,
            number,
            allowedOwner: optionConfig.allowedProjectOwner ?? null,
          },
          {fetchPolicy: 'network-only'},
        )
      }
      fallback={renderIssueViewerErrors}
    >
      <Box
        ref={issueViewerContainerRef}
        sx={{
          display: 'flex',
          flex: 'auto',
          flexDirection: 'column',
          justifyContent: 'stretch',
          alignItems: 'center',
          position: 'relative',
          pt: 3,
        }}
      >
        <Suspense fallback={<IssueViewerLoading optionConfig={optionConfig} />}>
          <IsssueViewerWithSecondary
            owner={owner}
            repo={repo}
            number={number}
            issueViewerViewRef={issueViewerViewRef}
            containerRef={issueViewerContainerRef}
            optionConfig={optionConfig}
          />
        </Suspense>
      </Box>
    </PreloadedQueryBoundary>
  )
}

function IssueViewerInternal({
  issueViewerViewRef,
  containerRef,
  optionConfig,
  secondaryIssueData,
  secondaryRepoData,
}: IssueViewerInternalProps) {
  const {repository, safeViewer} = usePreloadedQuery<IssueViewerViewQuery>(
    IssueViewerViewGraphqlQuery,
    issueViewerViewRef,
  )

  return repository?.issue ? (
    <IssueViewerInternalFragment
      viewerFragment={safeViewer || null}
      issueFragment={repository.issue}
      containerRef={containerRef}
      optionConfig={optionConfig}
      isRepoOwnerEnterpriseManaged={repository.isOwnerEnterpriseManaged}
      secondaryIssueData={secondaryIssueData}
      secondaryRepoData={secondaryRepoData}
    />
  ) : null
}

export function IssueViewerInternalFragment({
  viewerFragment,
  issueFragment,
  optionConfig,
  containerRef,
  isRepoOwnerEnterpriseManaged,
  secondaryIssueData,
  secondaryRepoData,
}: IssueViewerInternalFragmentProps) {
  const issue = useFragment(issueViewerViewFragment, issueFragment)
  const viewer = useFragment(issueViewerViewerFragment, viewerFragment) || null

  const hasSubIssues = useHasSubIssues(issue)
  const canEditSubIssues = useCanEditSubIssues(issue)

  const showEmuContributionBlockedBanner =
    viewer && !!viewer.enterpriseManagedEnterpriseId && !isRepoOwnerEnterpriseManaged
  const showCommentComposer = viewer && !showEmuContributionBlockedBanner

  const composerRef = useRef<MarkdownComposerRef>(null)
  const {startCommentEdit, cancelCommentEdit, isCommentEditActive} = useCommentEditsContext()
  const issueBodyKey = `issue-${issue.id}-body`
  const {setInputElementState, clearInputElementStates} = useInputElementActiveContext()
  const {anyItemPickerOpen} = useItemPickersContext()
  const breakpoint = useContainerBreakpoint(containerRef.current)

  const {sub_issues} = useFeatureFlags()

  // Reset comment and input states on issue change
  useEffect(() => {
    clearInputElementStates()
  }, [issue.id, clearInputElementStates])

  useEffect(() => {
    setInputElementState(IDS.itemPicker, anyItemPickerOpen())
  }, [anyItemPickerOpen, setInputElementState])

  // Whenever the issue body editing state changes, synchronize that state via callbacks
  const onIssueEditStateChange = optionConfig.onIssueEditStateChange
  useEffect(() => {
    onIssueEditStateChange?.(isCommentEditActive())
  }, [isCommentEditActive, onIssueEditStateChange])

  const onCommentReply = useCallback((quotedComment: string) => {
    composerRef.current?.setText(quotedComment)
    setTimeout(() => composerRef.current?.focus(), 0)
  }, [])

  const onCommentChange = useCallback(
    (id: string) => {
      startCommentEdit(VALUES.localStorageKeys.issueComment('', issue.id, id))
      optionConfig.onCommentEditStart?.(id)
    },
    [issue.id, optionConfig, startCommentEdit],
  )
  const onCommentEditCancel = useCallback(
    (id: string) => {
      cancelCommentEdit(VALUES.localStorageKeys.issueComment('', issue.id, id))
      optionConfig.onCommentEditCancel?.(id)
    },
    [cancelCommentEdit, issue.id, optionConfig],
  )

  const beforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isCommentEditActive()) {
        event.preventDefault()
        return (event.returnValue = '')
      }
    },
    [isCommentEditActive],
  )

  useBeforeUnload(beforeUnload)

  const [detailPaneOpen, setDetailPaneOpen] = useState(false)
  const exitOverlay = useCallback(() => setDetailPaneOpen(false), [])

  const isNarrow = useMemo(() => breakpoint([true, true, false, false]), [breakpoint])

  const metadataContent = useMemo(
    () => (
      <IssueSidebar
        sidebarKey={issue}
        sidebarSecondaryKey={secondaryIssueData}
        viewer={viewer}
        optionConfig={optionConfig}
      />
    ),
    [issue, optionConfig, secondaryIssueData, viewer],
  )

  const toggleSidesheetRef = useRef<HTMLButtonElement>(null)
  const metadataPaneTriggerButton = useMemo(
    () => (
      // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
      <IconButton
        unsafeDisableTooltip={true}
        aria-label="Show metadata pane"
        icon={InfoIcon}
        variant="invisible"
        onClick={() => setDetailPaneOpen(true)}
        ref={toggleSidesheetRef}
        data-testid={TEST_IDS.issueViewerMetadataOverlayTrigger}
      />
    ),
    [setDetailPaneOpen, toggleSidesheetRef],
  )
  const MetadataPaneTrigger = useCallback(
    () =>
      // Only render trigger if responsive right sidepanel is enabled
      optionConfig.responsiveRightSidepanel ? (
        <>
          {!optionConfig.useViewportQueries && isNarrow ? metadataPaneTriggerButton : null}
          {optionConfig.useViewportQueries ? (
            <Box sx={{display: ['flex', 'flex', 'none', 'none']}}>{metadataPaneTriggerButton}</Box>
          ) : null}
        </>
      ) : null,
    [isNarrow, metadataPaneTriggerButton, optionConfig.responsiveRightSidepanel, optionConfig.useViewportQueries],
  )

  const metadataPane = useMemo(
    () => (
      <Box sx={{flexDirection: 'column', width: '100%'}} data-testid={TEST_IDS.issueViewerMetadataPane}>
        <Heading as="h2" className="sr-only" sx={{fontSize: 2, ml: 3, mb: 2}}>
          {LABELS.metadataHeader}
        </Heading>
        {metadataContent}
      </Box>
    ),
    [metadataContent],
  )

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const renderRightOverlay = useMemo(
    () => optionConfig.responsiveRightSidepanel && isNarrow && detailPaneOpen,
    [detailPaneOpen, isNarrow, optionConfig.responsiveRightSidepanel],
  )
  const renderMetadataPane = useMemo(
    () => !isNarrow || (isNarrow && !optionConfig.responsiveRightSidepanel),
    [isNarrow, optionConfig.responsiveRightSidepanel],
  )
  const handleBodyEditStateChange = useCallback(
    (isEditing: boolean) => {
      optionConfig?.onIssueEditStateChange?.(isEditing)
      if (isEditing) {
        startCommentEdit(issueBodyKey)
      } else {
        cancelCommentEdit(issueBodyKey)
      }
    },
    [cancelCommentEdit, issueBodyKey, optionConfig, startCommentEdit],
  )
  // This is used to subscribe to hash-change events
  // Specifically, it is used to detect when the user has (soft) navigated to a comment in the same issue
  useHash()

  const {createDialogOpen, activeIssueId, closeCreateDialog} = useSubIssueState()

  const metadataOverlay = useMemo(
    () => (
      <Overlay
        data-testid={TEST_IDS.issueViewerMetadataOverlay}
        anchorSide="inside-left"
        aria-label={LABELS.metadataLabel}
        initialFocusRef={closeButtonRef}
        position="fixed"
        returnFocusRef={toggleSidesheetRef}
        right={0}
        top={0}
        sx={{
          p: 3,
          width: '440px',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        onClickOutside={noop}
        onEscape={exitOverlay}
      >
        <Box sx={{maxHeight: '100%', overflowY: 'scroll'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2, pl: 2}}>
            <Heading as="h2" sx={{fontSize: 2, fontWeight: 600}}>
              {LABELS.metadataHeader}
            </Heading>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              ref={closeButtonRef}
              aria-label="Close overview"
              icon={XIcon}
              variant="invisible"
              onClick={exitOverlay}
            />
          </Box>
          {metadataContent}
        </Box>
      </Overlay>
    ),
    [closeButtonRef, exitOverlay, metadataContent, toggleSidesheetRef],
  )

  return (
    <>
      <Header
        issue={issue}
        issueSecondary={secondaryIssueData}
        metadataPaneTrigger={<MetadataPaneTrigger />}
        optionConfig={optionConfig}
        containerRef={containerRef}
      />
      <ContentWrapper sx={optionConfig?.innerSx}>
        <Box
          sx={{
            display: 'flex',
            flex: 'auto',
            flexDirection: optionConfig.useViewportQueries
              ? ['column', 'column', 'row', 'row']
              : breakpoint(['column', 'column', 'row', 'row']),
            justifyContent: 'stretch',
            gap: [2, 2, 2, 4],
          }}
        >
          <Box
            sx={{
              width: optionConfig.useViewportQueries
                ? ['100%', '100%', 'auto', 'auto']
                : breakpoint(['100%', '100%', 'auto', 'auto']),
              backgroundColor: 'canvas.default',
              zIndex: 1,
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <div data-testid={TEST_IDS.issueViewerIssueContainer}>
              <IssueBody
                issue={issue}
                secondaryKey={secondaryIssueData}
                onLinkClick={optionConfig.onLinkClick}
                commentBoxConfig={optionConfig.commentBoxConfig}
                onIssueEditStateChange={handleBodyEditStateChange}
                onIssueUpdate={optionConfig.onIssueUpdate}
                isIssueEditActive={isCommentEditActive}
                onCommentReply={onCommentReply}
                highlightedEventText={ssrSafeLocation.hash}
                insideSidePanel={optionConfig.insideSidePanel}
              />
            </div>
            {!!sub_issues && hasSubIssues && (
              <Box sx={{my: 2}} data-testid={TEST_IDS.subIssuesIssueContainer}>
                <SubIssuesList
                  issueKey={secondaryIssueData}
                  viewerKey={viewer}
                  onSubIssueClick={optionConfig.onSubIssueClick}
                  insideSidePanel={optionConfig.insideSidePanel}
                  readonly={!canEditSubIssues}
                />
              </Box>
            )}
            <div data-testid={TEST_IDS.issueViewerCommentsContainer} className={CLASS_NAMES.commentsContainer}>
              <Box
                sx={{
                  mb: 3,
                }}
              >
                <ErrorBoundary fallback={<IssueTimelineErrorFallback />}>
                  <Suspense fallback={<IssueTimelineLoading delayedShow={true} />}>
                    <IssueTimeline
                      issue={issue}
                      issueSecondary={secondaryIssueData}
                      highlightedEventText={getHighlightedEventText(ssrSafeLocation.hash, ISSUE_EVENTS)}
                      viewer={viewer ? viewer.login : null}
                      onLinkClick={optionConfig.onLinkClick}
                      onCommentReply={onCommentReply}
                      onCommentChange={onCommentChange}
                      onCommentEditCancel={onCommentEditCancel}
                      commentBoxConfig={optionConfig.commentBoxConfig}
                      timelineEventBaseUrl={optionConfig.timelineEventBaseUrl}
                      withLiveUpdates={optionConfig.withLiveUpdates}
                      navigate={optionConfig.navigate ?? noop}
                    />
                    {showCommentComposer && (
                      <IssueCommentComposer
                        ref={composerRef}
                        issue={issue}
                        issueSecondary={secondaryIssueData}
                        repoSecondary={secondaryRepoData as LazyContributorFooter$key}
                        viewer={viewer}
                        onChange={() => {
                          startCommentEdit(VALUES.localStorageKeys.issueNewComment('viewer', issue.id))
                          optionConfig.onCommentEditStart?.(IDS.newComment)
                        }}
                        onSave={() => {
                          cancelCommentEdit(VALUES.localStorageKeys.issueNewComment('viewer', issue.id))
                          optionConfig.onCommentEditCancel?.(IDS.newComment)
                        }}
                        onCancel={() => {
                          cancelCommentEdit(VALUES.localStorageKeys.issueNewComment('viewer', issue.id))
                          optionConfig.onCommentEditCancel?.(IDS.newComment)
                        }}
                        onNewIssueComment={optionConfig.onNewIssueComment}
                        commentBoxConfig={optionConfig.commentBoxConfig}
                        singleKeyShortcutEnabled={optionConfig.singleKeyShortcutsEnabled || false}
                      />
                    )}
                  </Suspense>
                </ErrorBoundary>
                {showEmuContributionBlockedBanner && (
                  <Suspense>
                    <EmuContributionBlockedBanner enterpriseId={viewer.enterpriseManagedEnterpriseId} />
                  </Suspense>
                )}
              </Box>
            </div>
          </Box>

          <Box
            sx={{
              width: optionConfig.useViewportQueries
                ? ['auto', 'auto', '256px', '296px']
                : breakpoint(['auto', 'auto', '256px', '296px']),
              flexShrink: 0,
            }}
            data-testid={TEST_IDS.issueViewerMetadataContainer}
          >
            {optionConfig.useViewportQueries ? (
              // CSS-based responsiveness
              <>
                {/* Narrow viewport sidepanel overlay */}
                {optionConfig.responsiveRightSidepanel && detailPaneOpen && metadataOverlay}

                {/* Wide viewport sidepanel */}
                {optionConfig.responsiveRightSidepanel && (
                  <Box sx={{display: ['none', 'none', 'flex', 'flex']}}>{metadataPane}</Box>
                )}

                {/* Non-responsive sidepanel */}
                {!optionConfig.responsiveRightSidepanel && metadataPane}
              </>
            ) : (
              // JS-based responsiveness
              <>
                {renderRightOverlay ? metadataOverlay : null}
                {renderMetadataPane && metadataPane}
              </>
            )}
          </Box>
        </Box>
      </ContentWrapper>
      {secondaryIssueData && createDialogOpen && activeIssueId === issue.id && (
        <SubIssuesCreateDialog
          open={createDialogOpen}
          setOpen={closeCreateDialog}
          issue={secondaryIssueData}
          onCreateSuccess={({createMore}): void => {
            if (!createMore) {
              closeCreateDialog()
            }
          }}
        />
      )}
    </>
  )
}

function IsssueViewerWithSecondary({owner, repo, number, ...rest}: IssueViewerWithSecondaryProps) {
  const [secondaryIssueData, secondaryRepoData] = useSecondaryQuery({owner, repo, number})

  return (
    <IssueViewerInternal
      secondaryIssueData={secondaryIssueData ?? undefined}
      secondaryRepoData={secondaryRepoData ?? undefined}
      {...rest}
    />
  )
}
