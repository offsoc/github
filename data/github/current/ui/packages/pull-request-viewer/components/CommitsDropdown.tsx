import {TriangleDownIcon, VersionsIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button} from '@primer/react'
import {useMemo, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {useHasCommitRange, useSelectedRefContext} from '../contexts/SelectedRefContext'
import type {CommitsDropdown_pullRequest$key} from './__generated__/CommitsDropdown_pullRequest.graphql'
import {CommitsSelector} from './CommitsSelector'

function getButtonTextFromCommitData({
  endOid,
  isSingleCommit,
  startOid,
}: {
  endOid?: string | null
  isSingleCommit?: boolean
  startOid?: string | null
}) {
  // treat a range that only includes one commit like a single commit
  if (startOid && endOid && startOid === endOid) isSingleCommit = true

  if (isSingleCommit && endOid) {
    return `Commit ${endOid.slice(0, 7)}`
  }

  if (startOid && endOid) {
    return `${startOid.slice(0, 7)}..${endOid.slice(0, 7)}`
  }

  return 'All changes'
}

function getCommitSelectorOptionText({
  commitOids,
  endOid,
  isSingleCommit,
  startOid,
}: {
  commitOids: string[]
  endOid?: string | null
  isSingleCommit?: boolean
  startOid?: string | null
}) {
  // treat a range that only includes one commit like a single commit
  if (startOid && endOid && startOid === endOid) isSingleCommit = true

  if (isSingleCommit && endOid) {
    return `Commit ${endOid.slice(0, 7)}...`
  }

  if (startOid && endOid) {
    const startIndex = commitOids.indexOf(startOid)
    const endIndex = commitOids.indexOf(endOid)
    if (startIndex > -1 && endIndex > -1) {
      const commitsInRange = endIndex - startIndex + 1
      return `${commitsInRange} commits...`
    }
  }

  return 'Specific commit…'
}

interface CommitsDropdownProps {
  onRangeUpdated: (args: {startOid: string; endOid: string} | {singleCommitOid: string} | undefined) => void
  pullRequest: CommitsDropdown_pullRequest$key
}

/**
 * Shows a simple dropdown with a few options for filtering commits. Includes a nested
 * commit selector for selecting a range of commits.
 */
export function CommitsDropdown({onRangeUpdated, pullRequest}: CommitsDropdownProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment CommitsDropdown_pullRequest on PullRequest {
        ...CommitsSelector_pullRequest
        baseRefOid
        commits(first: 100) {
          edges {
            node {
              commit {
                oid
              }
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const {endOid, isSingleCommit, startOid} = useSelectedRefContext()
  const hasCommitRange = useHasCommitRange()
  const [isCommitDropdownOpen, setIsCommitDropdownOpen] = useState(false)
  const [isCommitSelectorOpen, setIsCommitSelectorOpen] = useState(false)
  const baseRefOid = pullRequestData.baseRefOid as string
  const commitOids = useMemo(
    () => pullRequestData.commits?.edges?.map(edge => edge?.node?.commit.oid as string) ?? [],
    [pullRequestData.commits.edges],
  )

  // when we represent the range in the button text, we want to show the first commit that is
  // actually included in the diff, which is the start commit + 1
  const firstCommitInRange = useMemo(() => {
    if (!startOid) return
    if (startOid === baseRefOid) return commitOids[0]

    const startIndex = commitOids.findIndex(oid => oid === startOid)
    if (startIndex < 0) return

    return commitOids[startIndex + 1]
  }, [baseRefOid, commitOids, startOid])

  const buttonText = getButtonTextFromCommitData({endOid, isSingleCommit, startOid: firstCommitInRange})
  const commitSelectorOptionText = getCommitSelectorOptionText({
    endOid,
    startOid: firstCommitInRange,
    commitOids,
  })

  const handleOpenCommitSelector = () => {
    setIsCommitDropdownOpen(false)
    setIsCommitSelectorOpen(true)
  }

  const handleShowAllCommits = () => {
    // clear out the existing range
    onRangeUpdated(undefined)
  }

  const handleRangeUpdated = (args: {startOid: string; endOid: string} | {singleCommitOid: string} | undefined) => {
    setIsCommitSelectorOpen(false)
    onRangeUpdated(args)
  }

  return (
    <>
      <ActionMenu open={isCommitDropdownOpen} onOpenChange={setIsCommitDropdownOpen}>
        <ActionMenu.Anchor>
          <Button alignContent="start" leadingVisual={VersionsIcon} trailingAction={TriangleDownIcon}>
            {buttonText}
          </Button>
        </ActionMenu.Anchor>
        <ActionMenu.Overlay side="outside-bottom" width="small">
          <ActionList selectionVariant="single">
            <ActionList.Item selected={!hasCommitRange} onSelect={handleShowAllCommits}>
              All changes
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item selected={hasCommitRange} onSelect={handleOpenCommitSelector}>
              {commitSelectorOptionText}
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {isCommitSelectorOpen && (
        <CommitsSelector
          endOid={endOid}
          pullRequest={pullRequestData}
          startOid={startOid}
          onClose={() => setIsCommitSelectorOpen(false)}
          onRangeUpdated={handleRangeUpdated}
        />
      )}
    </>
  )
}
