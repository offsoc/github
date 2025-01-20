import type {DiffDelta} from '@github-ui/diff-file-tree'
import {DiffFileTree} from '@github-ui/diff-file-tree'
import {updateURLHash} from '@github-ui/diff-lines/document-hash-helpers'
import {memo, useCallback, useMemo} from 'react'
import {graphql, useFragment} from 'react-relay'

import {useFilteredFilesContext} from '../contexts/FilteredFilesContext'
import {useFocusedFileContext} from '../contexts/FocusedFileContext'
import {useHasCommitRange} from '../contexts/SelectedRefContext'
import {usePullRequestAnalytics} from '../hooks/use-pull-request-analytics'
import type {FileTree_pullRequest$key} from './__generated__/FileTree_pullRequest.graphql'

interface FileTreeProps {
  pullRequest: FileTree_pullRequest$key
}

const FileTree = memo(function FileTree({pullRequest}: FileTreeProps) {
  const data = useFragment<FileTree_pullRequest$key>(
    graphql`
      fragment FileTree_pullRequest on PullRequest {
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          # eslint-disable-next-line relay/unused-fields
          summary {
            path
            pathDigest
            changeType
            totalCommentsCount
            totalAnnotationsCount
          }
        }
      }
    `,
    pullRequest,
  )

  const {setFocusedFileDigest} = useFocusedFileContext()
  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  const handleFileSelected = useCallback(
    (file: DiffDelta) => {
      sendPullRequestAnalyticsEvent('file_tree.file_selected', 'FILE_TREE_ENTRY')
      updateURLHash(`diff-${file.pathDigest}`)
      setFocusedFileDigest({digest: file.pathDigest, isNavigationRequest: true})
    },
    [sendPullRequestAnalyticsEvent, setFocusedFileDigest],
  )

  const {filteredFileAnchors} = useFilteredFilesContext()
  const hasCommitRange = useHasCommitRange()

  const diffs: readonly DiffDelta[] = useMemo(() => {
    let diffsList: readonly DiffDelta[] = data.comparison?.summary || []
    if (filteredFileAnchors) {
      diffsList = diffsList
        .filter(file => filteredFileAnchors.has(file.pathDigest))
        .map(file => ({...file, totalCommentsCount: !hasCommitRange ? file.totalCommentsCount : undefined}))
    }
    return diffsList
  }, [data.comparison?.summary, filteredFileAnchors, hasCommitRange])

  return <DiffFileTree diffs={diffs} onSelect={handleFileSelected} />
})

export default FileTree
