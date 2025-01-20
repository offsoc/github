import {testIdProps} from '@github-ui/test-id-props'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box, Flash, Header, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useCallback, useRef, useState} from 'react'

import {ItemType} from '../../api/memex-items/item-type'
import {type SidePanelItem, SidePanelTypeParam} from '../../api/memex-items/side-panel-item'
import type {SuggestedRepository} from '../../api/repository/contracts'
import {
  ProjectDescriptionAdd,
  ProjectDescriptionSidePanelUI,
  ProjectDescriptionUpdate,
  ProjectReadmeAdd,
  ProjectReadmeSettingsPageUI,
  ProjectReadmeUpdate,
} from '../../api/stats/contracts'
import {assertNever} from '../../helpers/assert-never'
import {getInitialState} from '../../helpers/initial-state'
import {resetScrollPositionImmediately} from '../../helpers/scroll-utilities'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {SidePanelState} from '../../hooks/use-side-panel'
import {useSidePanelDirtyState} from '../../hooks/use-side-panel-dirty-state'
import {IssueStateProvider} from '../../state-providers/issues/issue-state-provider'
import {useIssueContext} from '../../state-providers/issues/use-issue-context'
import {useProjectDetails} from '../../state-providers/memex/use-project-details'
import {useProjectState} from '../../state-providers/memex/use-project-state'
import {DescriptionEditor} from '../description-editor'
import {SanitizedHtml} from '../dom/sanitized-html'
import type {OmnibarItemAttrs} from '../omnibar/types'
import {ShortDescriptionEditor} from '../short-description-editor'
import {StatusUpdates} from '../status-updates/status-updates'
import {SidePanelBody} from './body'
import {BulkAddItemsProvider} from './bulk-add/bulk-add-items-provider'
import {BulkAddView} from './bulk-add/bulk-add-view'
import {SidePanelComments} from './comments'
import {SidePanelHeader, type SidePanelTabName, SidePanelToolbar} from './header'
import {SharedIssueViewer} from './shared-issue-viewer'
import {SidePanelSidebar} from './sidebar'

export const SidePanelContent = memo(function SidePanelContent({
  sidePanelState,
}: {
  sidePanelState: NonNullable<SidePanelState>
}) {
  const {loggedInUser} = getInitialState()

  switch (sidePanelState.type) {
    case SidePanelTypeParam.ISSUE: {
      if (sidePanelState.item.contentType === 'Issue' && loggedInUser) {
        const issueIdentifier = sidePanelState.item.getItemIdentifier()
        // If in standalone dev mode, don't render the new issue viewer
        if (
          (process.env.APP_ENV === 'development' || process.env.APP_ENV === 'staging') &&
          process.env.IS_STANDALONE === 'TRUE'
        ) {
          return <NewIssueViewerDevelopmentWarning />
        }

        // New issue viewer
        return issueIdentifier ? (
          <SharedIssueViewer {...issueIdentifier} url={sidePanelState.item.getUrl()} itemId={sidePanelState.item.id} />
        ) : null
        // Legacy issue viewer used for draft issues & when logged out
      } else if (
        sidePanelState.item.contentType === 'DraftIssue' ||
        (!loggedInUser && sidePanelState.item.contentType === 'Issue')
      ) {
        return (
          <IssueStateProvider
            contentType={sidePanelState.item.contentType}
            repositoryId={sidePanelState.item.ownerId()}
            itemId={sidePanelState.item.itemId()}
            memexItemId={sidePanelState.item.memexItemId?.()}
          >
            <SidePanelItemContent item={sidePanelState.item} />
          </IssueStateProvider>
        )
      } else {
        // This should never happen as PullRequest and RedactedItem should never open the issue viewer
        throw new Error(`Unexpected contentType of ${sidePanelState.item.contentType} for SidePanelTypeParam.ISSUE`)
      }
    }
    case SidePanelTypeParam.INFO: {
      return <SidePanelMemexInfoContent />
    }
    case SidePanelTypeParam.BULK_ADD: {
      return (
        <SidePanelMemexBulkAddContent
          targetRepository={sidePanelState.targetRepository}
          query={sidePanelState.query}
          newItemAttributes={sidePanelState.newItemAttributes}
        />
      )
    }
    default: {
      assertNever(sidePanelState)
    }
  }
})

const SidePanelMemexInfoContent = memo(function SidePanelMemexInfoContent() {
  const {postStats} = usePostStats()
  const {titleHtml} = useProjectDetails()
  const [, setHasUnsavedShortDescription] = useSidePanelDirtyState()
  const [, setHasUnsavedDescription] = useSidePanelDirtyState()
  const {isTemplate} = useProjectState()

  const onSaveStatsShortDescription = useCallback(
    (update: boolean) => {
      postStats({
        name: update ? ProjectDescriptionUpdate : ProjectDescriptionAdd,
        ui: ProjectDescriptionSidePanelUI,
      })
    },
    [postStats],
  )

  const onSaveStatsDescription = useCallback(
    (update: boolean) => {
      postStats({
        name: update ? ProjectReadmeUpdate : ProjectReadmeAdd,
        ui: ProjectReadmeSettingsPageUI,
      })
    },
    [postStats],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'canvas.default',
        width: '100%',
        overflowY: 'auto',
        height: '100%',
        alignItems: 'center',
        px: '20px',
      }}
      {...testIdProps('side-panel-info-content')}
    >
      <Box sx={{width: '100%', mt: 4}}>
        <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'row-reverse'}}>
          <SidePanelToolbar showCloseButton />
          <Box sx={{flex: 1}} />
          <SanitizedHtml sx={{fontWeight: '600', fontSize: 2, wordBreak: 'break-word'}} as="h2">
            {titleHtml}
          </SanitizedHtml>
        </Box>

        <ShortDescriptionEditor
          onSaveStats={onSaveStatsShortDescription}
          setHasUnsavedChanges={setHasUnsavedShortDescription}
          hideLabel
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 'auto',
          flexGrow: 0,
          width: '100%',
        }}
      >
        <DescriptionEditor
          onSaveStats={onSaveStatsDescription}
          setHasUnsavedChanges={setHasUnsavedDescription}
          hideLabel
        />
      </Box>
      {!isTemplate && <StatusUpdates />}
    </Box>
  )
})

// Could just get supportsComments and isLoading from the useIssueContext hook, but this helps minimize hook use
// to minimize re-renders
const SidePanelItemDetails = memo<{item: SidePanelItem; isLoading: boolean}>(function SidePanelItemDetails({
  item,
  isLoading,
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const itemId = item.itemId()

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      resetScrollPositionImmediately(scrollContainerRef.current)
    }
  }, [itemId])

  const breakpoint = useContainerBreakpoint(scrollContainerRef.current)

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        display: 'flex',
        flex: 'auto',
        flexDirection: breakpoint(['column', 'column', 'row', 'row']),
        backgroundColor: 'canvas.default',
        justifyContent: 'stretch',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: 'auto',
          flexDirection: 'column',
          width: breakpoint(['100%', '100%', '66%', '66%']),
          mx: 'auto',
        }}
      >
        <SidePanelBody item={item} isLoading={isLoading} />
        <SidePanelComments itemURL={item.getUrl()} />
      </Box>
      <SidePanelSidebar item={item} breakpoint={breakpoint} />
    </Box>
  )
})

const SidePanelItemContent = memo<{
  item: SidePanelItem
}>(function SidePanelItemContent({item}) {
  const [selectedTab, setSelectedTab] = useState<SidePanelTabName>('details')
  const {tasklist_block} = useEnabledFeatures()
  const {isLoading} = useIssueContext()
  const showBreadcrumbs = tasklist_block && item.contentType === ItemType.Issue
  const showTabs = false // Tabs are permanently disabled pending future hierarchy works

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'canvas.default',
        height: '100%',
        width: '100%',
        flexGrow: 1,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SidePanelHeader
        item={item}
        isLoading={isLoading}
        showBreadcrumbs={showBreadcrumbs}
        showTabs={showTabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      <SidePanelItemDetails item={item} isLoading={isLoading} />
    </Box>
  )
})

const SidePanelMemexBulkAddContent = memo<{
  targetRepository?: SuggestedRepository
  query?: string
  newItemAttributes?: OmnibarItemAttrs
}>(function SidePanelMemexBulkAddContent({targetRepository, query, newItemAttributes}) {
  return (
    <BulkAddItemsProvider query={query} selectedRepository={targetRepository}>
      <BulkAddView targetRepository={targetRepository} newItemAttributes={newItemAttributes} />
    </BulkAddItemsProvider>
  )
})

const newIssueViewerDevelopmentWarningContainerStyles: BetterSystemStyleObject = {
  position: 'relative',
  backgroundColor: 'canvas.default',
  height: '100%',
  width: '100%',
  flexGrow: 1,
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
}

const newIssueViewerDevelopmentWarningHeaderStyles: BetterSystemStyleObject = {
  margin: 'auto',
}

const newIssueViewerDevelopmentWarningFlashStyles: BetterSystemStyleObject = {
  width: '400px',
}

const NewIssueViewerDevelopmentWarning = memo(function NewIssueViewerDevelopmentWarning() {
  return (
    <Box {...testIdProps('new-issue-viewer-development-warning')} sx={newIssueViewerDevelopmentWarningContainerStyles}>
      <SidePanelToolbar showCloseButton />
      <Header.Item sx={newIssueViewerDevelopmentWarningHeaderStyles}>
        <Flash sx={newIssueViewerDevelopmentWarningFlashStyles} variant="warning">
          <p>
            We decided not to render the new issue viewer in standalone development environment.{' '}
            <Link
              href="https://github.com/github/memex/blob/main/docs/adr/2024-05-10-issue-viewer-testing.md"
              target="_blank"
              inline
            >
              Learn more
            </Link>
            .
          </p>
          <p>
            E2E tests for the new issue viewer should be added to{' '}
            <Link
              href="https://github.com/github/github/blob/master/test/e2e/spec/hyperlist-web/memex-issue-viewer.spec.ts"
              target="_blank"
            >
              <code>/test/e2e/spec/hyperlist-web/memex-issue-viewer.spec.ts</code>
            </Link>
            .{' '}
          </p>
        </Flash>
      </Header.Item>
    </Box>
  )
})
