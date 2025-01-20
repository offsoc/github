import {assertDataPresent} from '@github-ui/assert-data-present'
import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Suspense, useRef, useState, useSyncExternalStore} from 'react'
import {createPortal} from 'react-dom'
import {useFragment, useLazyLoadQuery} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useFileDiffReference} from '../../use-file-diff-reference'
import {DiffEntryMenuItems} from '../shared/DiffEntryMenuItems'
import {CopilotDiffEntryElement} from './CopilotDiffEntryElement'
import {DiffLinesMenu} from './DiffLinesMenu'
import type {InjectedDiffEntries_DiffEntryQuery} from './__generated__/InjectedDiffEntries_DiffEntryQuery.graphql'
import type {InjectedDiffEntries_PullRequestFragment$key} from './__generated__/InjectedDiffEntries_PullRequestFragment.graphql'
import {useActiveDiffLines, type ActiveLines} from './use-active-diff-lines'
import {useLatestCommit} from '@github-ui/use-latest-commit'

const PullRequestFragment = graphql`
  fragment InjectedDiffEntries_PullRequestFragment on PullRequest {
    id
    repository {
      name
      owner {
        login
      }
    }
    comparison(startOid: $startOid, endOid: $endOid) {
      ...useFileDiffReference_Comparison
    }
  }
`

// TODO: If we could directly reference diff entries by node ID instead of path, we could shared loaded data across
// this and the entries selectpanel. This would reduce duplication in loaded data, but requires passing the node ID
// in through `CopilotDiffEntryElement`.
const DiffEntryQuery = graphql`
  query InjectedDiffEntries_DiffEntryQuery($prId: ID!, $path: String!, $startOid: String!, $endOid: String!) {
    node(id: $prId) {
      ... on PullRequest {
        comparison(startOid: $startOid, endOid: $endOid) {
          diffEntry(path: $path) {
            ...useFileDiffReference_DiffEntry
          }
        }
      }
    }
  }
`

const useEntryElements = () =>
  useSyncExternalStore(
    onUpdate => {
      CopilotDiffEntryElement.store.addEventListener('update', onUpdate)
      return () => CopilotDiffEntryElement.store.removeEventListener('update', onUpdate)
    },
    () => CopilotDiffEntryElement.store.entries,
  )

function InjectedDiffButton({
  fileDiffReference,
  activeLines: newActiveLines,
}: {
  fileDiffReference: FileDiffReference
  activeLines?: ActiveLines
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const lastActiveLines = useRef(newActiveLines)

  // Force continued usage of previous value if menu is still open, so we don't autoclose the menu when the user tries
  // to move the mouse into it
  const activeLines = isMenuOpen ? lastActiveLines.current : newActiveLines
  lastActiveLines.current = activeLines

  if (!activeLines) return null

  const fileDiffReferenceWithSelection = {
    ...fileDiffReference,
    selectedRange: {
      start: `${activeLines.startOrientation[0]?.toUpperCase() ?? ''}${activeLines.startLineNumber}`,
      end: `${activeLines.endOrientation[0]?.toUpperCase() ?? ''}${activeLines.endLineNumber}`,
    },
  }

  return createPortal(
    <DiffLinesMenu fileDiffReference={fileDiffReferenceWithSelection} onOpenChange={setIsMenuOpen} />,
    activeLines.topRightElement,
  )
}

interface InjectedDiffEntryProps {
  entryElement: CopilotDiffEntryElement
  pullRequestKey: InjectedDiffEntries_PullRequestFragment$key
  activeLinesById: Map<string, ActiveLines>
  startOid: string
  endOid: string
}

function InjectedDiffEntry({
  entryElement: {menuItemsSlot, filePath},
  startOid,
  endOid,
  pullRequestKey,
  activeLinesById,
}: InjectedDiffEntryProps) {
  const pullRequest = useFragment(PullRequestFragment, pullRequestKey)
  assertDataPresent(pullRequest.comparison)

  const entryKey = useLazyLoadQuery<InjectedDiffEntries_DiffEntryQuery>(DiffEntryQuery, {
    prId: pullRequest.id,
    path: filePath,
    startOid,
    endOid,
  }).node?.comparison?.diffEntry
  assertDataPresent(entryKey)

  const [latestCommit] = useLatestCommit(
    pullRequest.repository.owner.login,
    pullRequest.repository.name,
    endOid,
    filePath,
  )
  const fileDiffReference = useFileDiffReference(pullRequest.comparison, entryKey, latestCommit?.oid)

  return (
    <>
      {fileDiffReference && (
        <InjectedDiffButton
          fileDiffReference={fileDiffReference}
          activeLines={activeLinesById.get(fileDiffReference.id)}
        />
      )}
      {menuItemsSlot && createPortal(<DiffEntryMenuItems fileDiffReference={fileDiffReference} />, menuItemsSlot)}
    </>
  )
}

interface InjectedDiffEntriesProps {
  pullRequestKey: InjectedDiffEntries_PullRequestFragment$key
  startOid: string
  endOid: string
}

export function InjectedDiffEntries({pullRequestKey, startOid, endOid}: InjectedDiffEntriesProps) {
  const entryElements = useEntryElements()
  const activeLinesById = useActiveDiffLines()

  return (
    <>
      {Array.from(entryElements).map(entryElement => (
        <ErrorBoundary key={entryElement.filePath} fallback={null}>
          <Suspense fallback={null}>
            <InjectedDiffEntry
              startOid={startOid}
              endOid={endOid}
              pullRequestKey={pullRequestKey}
              entryElement={entryElement}
              // It would be more ideal to pass only the lines relevant to this entry here, allowing us to memoize
              // InjectedDiffEntry. But that requires knowing the ID we get from `useFileDiffReference` here, which
              // we don't have yet
              activeLinesById={activeLinesById}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  )
}
