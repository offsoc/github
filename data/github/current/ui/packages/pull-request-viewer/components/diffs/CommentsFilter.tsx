import {SearchIcon, SlidersIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, IconButton, type SxProp, TextInput} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {CommentsFilter_pullRequestThreadEdge$key} from './__generated__/CommentsFilter_pullRequestThreadEdge.graphql'

/**
 * Data on each thread that is used to determine if it matches the current filter
 */
type ThreadFilterData = {
  authorLogin: string
  body: string
  id: string
  isResolved: boolean
  path: string
}

/**
 * Return a set of thread ids that match the current filter state
 */
export function useFilteredComments(
  threadEdges: CommentsFilter_pullRequestThreadEdge$key,
  filterState: CommentsFilterState,
): Set<string> {
  const edges = useFragment(
    graphql`
      fragment CommentsFilter_pullRequestThreadEdge on PullRequestThreadEdge @relay(plural: true) {
        node {
          id
          isResolved
          path
          firstComment: comments(first: 1) {
            edges {
              node {
                body
                author {
                  login
                }
              }
            }
          }
        }
      }
    `,
    threadEdges,
  )

  const matchingThreadIds = edges.filter(edge => {
    const thread = edge?.node
    const firstComment = thread?.firstComment?.edges?.[0]?.node
    const threadFilterData = {
      authorLogin: firstComment?.author?.login ?? '',
      body: firstComment?.body ?? '',
      id: thread?.id ?? '',
      isResolved: thread?.isResolved ?? false,
      path: thread?.path ?? '',
    }

    return filterThread(threadFilterData, filterState)
  })

  return new Set([...matchingThreadIds.map(edge => edge?.node?.id ?? '')])
}

function filterThread(threadData: ThreadFilterData, filterState: CommentsFilterState) {
  const {filterText, showResolvedThreads} = filterState
  if (!showResolvedThreads && threadData.isResolved) {
    return false
  }

  if (filterText) {
    const filterTextLower = filterText.toLowerCase()
    if (
      !threadData.authorLogin.toLowerCase().includes(filterTextLower) &&
      !threadData.body.toLowerCase().includes(filterTextLower) &&
      !threadData.path.toLowerCase().includes(filterTextLower)
    ) {
      return false
    }
  }

  return true
}

/**
 * The state values of the comments filter
 */
export type CommentsFilterState = {
  filterText: string
  showResolvedThreads: boolean
}

const defaultFilterState: CommentsFilterState = {
  filterText: '',
  showResolvedThreads: true,
}

export function getDefaultFilterState(): CommentsFilterState {
  return {...defaultFilterState}
}

type CommentsFilterProps = {
  filterState: CommentsFilterState
  onFilterStateChange: (filterState: CommentsFilterState) => void
} & SxProp

export function CommentsFilter({filterState, onFilterStateChange, sx}: CommentsFilterProps) {
  const updateFilterText = (filterText: string) => {
    onFilterStateChange({...filterState, filterText})
  }

  const toggleResolvedFilter = () => {
    onFilterStateChange({...filterState, showResolvedThreads: !filterState.showResolvedThreads})
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'nowrap', ...sx}}>
      <TextInput
        block
        aria-label="Filter threads"
        leadingVisual={SearchIcon}
        placeholder="Filter threads"
        value={filterState.filterText}
        onChange={event => updateFilterText(event.target.value)}
      />
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            aria-label="Additional thread filters"
            icon={SlidersIcon}
            sx={{flexShrink: 0}}
            unsafeDisableTooltip={true}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="auto">
          <ActionList selectionVariant="single">
            <ActionList.Item selected={filterState.showResolvedThreads} onSelect={() => toggleResolvedFilter()}>
              Resolved threads
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}
