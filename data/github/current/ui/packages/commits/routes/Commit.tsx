import type {DiffDelta} from '@github-ui/diff-file-tree'
import {DiffFindOpenProvider, SelectedDiffRowRangeContextProvider} from '@github-ui/diff-lines'
import {updateURLHash} from '@github-ui/diff-lines/document-hash-helpers'
import {DiffPlaceholder} from '@github-ui/diffs/DiffParts'
import {commitContextLinesPath, commitPath} from '@github-ui/paths'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {GlobalCommands} from '@github-ui/ui-commands'
import {useClientValue} from '@github-ui/use-client-value'
import {useHideFooter} from '@github-ui/use-hide-footer'
import {SplitPageLayout} from '@primer/react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'

import {DiscussionComments} from '../components/Commit/comments/DiscussionComments'
import {CommitInfo} from '../components/Commit/CommitInfo'
import {CommitUnavailable} from '../components/Commit/CommitUnavailable'
import {Diffs} from '../components/Commit/Diffs'
import {DiffsHeader as DiffsHeaderComponent} from '../components/Commit/DiffsHeader'
import {DIFF_FILE_TREE_ID, FileTree, type PostSelectAction} from '../components/Commit/FileTree'
import {SSRDiffs} from '../components/Commit/SSRDiffs'
import {DiffViewSettingsProvider} from '../contexts/DiffViewSettingsContext'
import {DiscussionCommentsProvider} from '../contexts/DiscussionCommentsContext'
import {InlineCommentsProvider} from '../contexts/InlineCommentsContext'
import {useDeferredCommentData} from '../hooks/use-fetch-deferred-comment-data'
import {useLoadBranchCommits} from '../hooks/use-load-branch-commits'
import {useTreePane} from '../hooks/use-tree-pane'
import type {CommitPayload} from '../types/commit-types'
import {splitDiffEntryData} from '../utils/split-diff-entry-data'

const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

export function Commit() {
  useHideFooter(true)

  const payload = useRoutePayload<CommitPayload>()
  const {splitPagePaneHiddenSx, splitPageContentHidden, treeToggleElement, collapseTree} = useTreePane(
    DIFF_FILE_TREE_ID,
    payload.fileTreeExpanded,
  )

  const [unselectedFileExtensions, setUnselectedFileExtensions] = useState(new Set<string>())
  const [isSSR] = useClientValue(() => false, true, [])
  const [selectedPathDigest, setSelectedPathDigest] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  //TODO: make this actually update properly, right now i just have the overlay appearing in a fixed spot
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [isStickied, setIsStickied] = useState(false)

  const handleFileSelected = useCallback(
    (file: DiffDelta, postSelectAction?: PostSelectAction) => {
      updateURLHash(`diff-${file.pathDigest}`)
      setSelectedPathDigest(file.pathDigest)
      if (postSelectAction === 'close_tree') {
        collapseTree()
      }
    },
    [collapseTree],
  )
  const commitInfo = useLoadBranchCommits(payload.commit.oid)
  const contextLinePathURL = commitContextLinesPath({
    owner: payload.repo.ownerLogin,
    repo: payload.repo.name,
    commitish: payload.commit.oid,
  })

  const handleFileExtensionsChange = useCallback(
    (type: 'selectFileExtension' | 'unselectFileExtension', extension: string) => {
      const unselectedExtensions = new Set(unselectedFileExtensions)

      if (type === 'selectFileExtension') {
        unselectedExtensions.delete(extension)
      } else if (type === 'unselectFileExtension') {
        unselectedExtensions.add(extension)
      }

      setUnselectedFileExtensions(unselectedExtensions)
    },
    [unselectedFileExtensions],
  )

  useEffect(() => {
    setUnselectedFileExtensions(new Set<string>())
  }, [payload.commit])

  useEffect(() => {
    const hash = ssrSafeWindow?.location.hash
    if (hash?.indexOf('diff-') !== -1) {
      const hashArray = hash?.split('diff-')
      if (hashArray && hashArray.length === 2) {
        setSelectedPathDigest(hashArray[1] ?? '')
      }
    }
  }, [])

  const viewSettings = useMemo(() => {
    return {
      hideWhitespace: payload.ignoreWhitespace,
      splitPreference: payload.splitViewPreference,
    }
  }, [payload.ignoreWhitespace, payload.splitViewPreference])

  //scroll to the top of the page on a soft nav
  useEffect(() => {
    if ((ssrSafeWindow?.scrollY ?? 0) > 0) {
      ssrSafeWindow?.scrollTo(0, 0)
    }
  }, [payload.path])

  // hook for fetching inline + discussion consolidated comment data
  const {deferredCommentData, state} = useDeferredCommentData(payload.repo, payload.commit.oid)
  const threadData = deferredCommentData?.threadMarkers

  const DiffsHeader = () => {
    return <DiffsHeaderComponent treeToggleElement={treeToggleElement} headerInfo={payload.headerInfo} />
  }

  if (payload.unavailableReason) {
    return (
      <CommitUnavailable
        commit={payload.commit}
        commitInfo={commitInfo}
        unavailableReason={payload.unavailableReason}
      />
    )
  }

  const [completeDiffData, fileTreeData] = splitDiffEntryData(payload.diffEntryData)

  const onCreatePermalink = () => {
    const permalink = commitPath({
      owner: payload.repo.ownerLogin,
      repo: payload.repo.name,
      commitish: payload.commit.oid,
    })
    window.history.pushState(null, document.title, permalink)
  }

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <InlineCommentsProvider initialFiles={threadData}>
        <GlobalCommands
          commands={{
            'commit-diff-view:create-permalink': onCreatePermalink,
          }}
        />
        <SplitPageLayout>
          <SplitPageLayout.Header>
            <h1 className="sr-only">{payload.commit.shortMessage}</h1>
            <CommitInfo commit={payload.commit} commitInfo={commitInfo} />
          </SplitPageLayout.Header>
          <SplitPageLayout.Pane
            position="start"
            sticky
            sx={splitPagePaneHiddenSx}
            divider={{regular: 'line', narrow: 'none'}}
            widthStorageKey="diff-tree-pane-width"
            resizable={true}
          >
            <FileTree
              diffs={fileTreeData}
              onFileSelected={handleFileSelected}
              unselectedFileExtensions={unselectedFileExtensions}
              diffsHeader={<DiffsHeader />}
              onFileExtensionsChange={handleFileExtensionsChange}
            />
          </SplitPageLayout.Pane>
          <SplitPageLayout.Content
            as="div"
            width="full"
            hidden={splitPageContentHidden}
            padding="none"
            sx={{p: [3, 3, 3, 4], pt: [0, 0, 0, 0]}}
          >
            <SelectedDiffRowRangeContextProvider>
              <DiffViewSettingsProvider viewSettings={viewSettings}>
                <DiffsHeader />
                {isSSR ? (
                  <SSRDiffs
                    diffEntryData={completeDiffData}
                    contextLinePathURL={contextLinePathURL}
                    repo={payload.repo}
                    oid={payload.commit.oid}
                  />
                ) : (
                  <DiffFindOpenProvider searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                    <Diffs
                      commitInfo={commitInfo}
                      isStickied={isStickied}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      ignoreWhitespace={payload.ignoreWhitespace}
                      diffEntryData={completeDiffData}
                      contextLinePathURL={contextLinePathURL}
                      unselectedFileExtensions={unselectedFileExtensions}
                      selectedPathDigest={selectedPathDigest}
                      repo={payload.repo}
                      oid={payload.commit.oid}
                    />
                  </DiffFindOpenProvider>
                )}
                <DiscussionCommentsProvider
                  comments={deferredCommentData?.discussionComments?.comments}
                  commentCount={deferredCommentData?.discussionComments?.count}
                  canLoadMore={deferredCommentData?.discussionComments?.canLoadMore}
                  subscribed={deferredCommentData?.subscribed}
                  providerState={state}
                  repo={payload.repo}
                  commitOid={payload.commit.oid}
                >
                  <DiscussionComments commit={payload.commit} commentInfo={payload.commentInfo} />
                </DiscussionCommentsProvider>
                {/* DiffPlaceholder is used for the skeleton placeholder when a diff isn't loaded, it needs to be
              somewhere on the page so that it can be drawn from within the diff lines component.  */}
                <DiffPlaceholder />
              </DiffViewSettingsProvider>
            </SelectedDiffRowRangeContextProvider>
          </SplitPageLayout.Content>
        </SplitPageLayout>
      </InlineCommentsProvider>
    </RelayEnvironmentProvider>
  )
}
