import {assertDataPresent} from '@github-ui/assert-data-present'
import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ActionList, Box, Spinner} from '@primer/react'
import {useEffect, useMemo, type ReactElement} from 'react'
import {useFragment, usePaginationFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {useFileDiffReference_Comparison$key} from '../../__generated__/useFileDiffReference_Comparison.graphql'
import {mapWith, mapWithout} from '../../map-utils'
import {useFileDiffReference} from '../../use-file-diff-reference'
import type {DiffEntriesList_EntryItem_entry$key} from './__generated__/DiffEntriesList_EntryItem_entry.graphql'
import type {DiffEntriesList_entriesData$key} from './__generated__/DiffEntriesList_entriesData.graphql'

interface EntryItemProps {
  entryKey: DiffEntriesList_EntryItem_entry$key
  comparisonKey: useFileDiffReference_Comparison$key
  selected: boolean
  onSelect: (reference: FileDiffReference) => void
  onDeselect: () => void
}

function EntryItem({entryKey, comparisonKey, selected, onSelect, onDeselect}: EntryItemProps) {
  const entry = useFragment(
    graphql`
      fragment DiffEntriesList_EntryItem_entry on PullRequestDiffEntry {
        path
        ...useFileDiffReference_DiffEntry
      }
    `,
    entryKey,
  )

  const reference = useFileDiffReference(comparisonKey, entry)

  return reference ? (
    <ActionList.Item
      disabled={!reference}
      selected={selected}
      onSelect={() => (selected ? onDeselect() : onSelect(reference))}
    >
      {entry.path}
    </ActionList.Item>
  ) : (
    <ActionList.Item disabled={!reference} inactiveText="Copilot is not available for this file">
      {entry.path}
    </ActionList.Item>
  )
}

interface DiffEntriesListProps {
  pullRequestKey: DiffEntriesList_entriesData$key
  filter: string
  selectedReferences: ReadonlyMap<string, FileDiffReference>
  onSelectedReferencesChange: (newSelectedReferences: Map<string, FileDiffReference>) => void
  emptyState: ReactElement
}

const ENTRIES_LIMIT = 100
const PAGE_SIZE = 25

export function DiffEntriesList({
  pullRequestKey,
  filter,
  selectedReferences,
  onSelectedReferencesChange,
  emptyState,
}: DiffEntriesListProps) {
  const {
    data: entriesData,
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment(
    graphql`
      fragment DiffEntriesList_entriesData on PullRequest
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 10})
      @refetchable(queryName: "DiffEntriesList_entriesData_refetchQuery") {
        comparison(startOid: $startOid, endOid: $endOid) {
          ...useFileDiffReference_Comparison
          diffEntries(after: $cursor, first: $count) @connection(key: "DiffEntriesList_entriesData_diffEntries") {
            edges {
              node {
                path
                ...DiffEntriesList_EntryItem_entry
              }
            }
          }
        }
      }
    `,
    pullRequestKey,
  )
  const totalLoaded = entriesData.comparison?.diffEntries.edges?.length ?? 0

  // Load all pages up to the limit (making several small requests feels more responsive than the user having to wait
  // on one large one):
  useEffect(() => {
    if (hasNext && !isLoadingNext && totalLoaded < ENTRIES_LIMIT) {
      // Ensure the last page is reduced so we don't go over the limit
      const thisPageSize = Math.min(ENTRIES_LIMIT - totalLoaded, PAGE_SIZE)
      loadNext(thisPageSize)
    }
  }, [totalLoaded, hasNext, isLoadingNext, loadNext])

  const comparison = entriesData.comparison
  assertDataPresent(comparison)

  const filteredEntries = useMemo(() => {
    const lowercaseFilter = filter.toLowerCase()
    const newFilteredEntries = []
    for (const edge of entriesData.comparison?.diffEntries.edges ?? [])
      if (edge?.node?.path.toLowerCase().includes(lowercaseFilter)) newFilteredEntries.push(edge.node)
    return newFilteredEntries
  }, [entriesData, filter])

  const onSelectEntry = (path: string, reference: FileDiffReference) =>
    onSelectedReferencesChange(mapWith(selectedReferences, [path, reference]))

  const onDeselectEntry = (path: string) => onSelectedReferencesChange(mapWithout(selectedReferences, path))

  return filteredEntries.length === 0 && !isLoadingNext ? (
    emptyState
  ) : (
    <>
      <ActionList>
        {filteredEntries.map(entry => (
          <EntryItem
            key={entry.path}
            entryKey={entry}
            comparisonKey={comparison}
            selected={selectedReferences.has(entry.path)}
            onSelect={reference => onSelectEntry(entry.path, reference)}
            onDeselect={() => onDeselectEntry(entry.path)}
          />
        ))}
        <Box sx={{px: 3, py: 2, display: 'flex', gap: 2}}>
          {isLoadingNext && (
            <>
              <Spinner size="small" />
              <span>Loading more files…</span>
            </>
          )}
          {hasNext && !isLoadingNext && totalLoaded === ENTRIES_LIMIT && `Maximum of ${ENTRIES_LIMIT} files loaded`}
        </Box>
      </ActionList>
    </>
  )
}
