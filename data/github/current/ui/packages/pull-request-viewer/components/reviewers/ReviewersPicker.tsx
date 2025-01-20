import {debounce} from '@github/mini-throttle'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {ExtendedItemProps} from '@github-ui/item-picker/ItemPicker'
import {ItemPicker} from '@github-ui/item-picker/ItemPicker'
import type {ItemGroup} from '@github-ui/item-picker/shared'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box, Text} from '@primer/react'
import type React from 'react'
import {startTransition, useCallback, useEffect, useMemo, useState} from 'react'
import {graphql, useFragment, useRefetchableFragment, useRelayEnvironment} from 'react-relay'

import {notEmpty} from '../../helpers/not-empty'
import type {ReviewersPickerCandidateReviewers_pullRequest$key} from './__generated__/ReviewersPickerCandidateReviewers_pullRequest.graphql'
import type {ReviewersPickerSearchQuery} from './__generated__/ReviewersPickerSearchQuery.graphql'
import type {ReviewersPickerSuggestedReviewers_pullRequest$key} from './__generated__/ReviewersPickerSuggestedReviewers_pullRequest.graphql'
import type {ReviewersPickerSuggestionsQuery} from './__generated__/ReviewersPickerSuggestionsQuery.graphql'

/**
 * Loads suggested reviewers based on git blame info on the files that have been changed in the PR.
 */
const reviewersPickerSuggestionsQuery = graphql`
  query ReviewersPickerSuggestionsQuery($pullRequestId: ID!) {
    pullRequest: node(id: $pullRequestId) {
      ... on PullRequest {
        ...ReviewersPickerSuggestedReviewers_pullRequest
      }
    }
  }
`

/**
 * Loads a list of possible reviewers for the PR, optionally scoped by a user-provided text query.
 */
const reviewersPickerSearchQuery = graphql`
  query ReviewersPickerSearchQuery($pullRequestId: ID!, $query: String, $reviewersCount: Int = 100) {
    pullRequest: node(id: $pullRequestId) {
      ... on PullRequest {
        ...ReviewersPickerCandidateReviewers_pullRequest @arguments(query: $query, reviewersCount: $reviewersCount)
      }
    }
  }
`

const CANDIDATE_REVIEWERS_INITIAL_COUNT = 20

export type Reviewer = {
  avatarUrl: string | null | undefined
  id: string
  isAuthor: boolean
  isCommenter: boolean
  isTeam: boolean
  // display text will either be the team slug or the user's login
  displayText: string
  description: string | null | undefined
}

function sortReviewerPickerUsers(assignedReviewerIds: string[], usersToSort: Reviewer[]) {
  return usersToSort.slice().sort((a, b) => {
    const aIsAssigned = assignedReviewerIds.some(a2Id => a2Id === a.id)
    const bIsAssigned = assignedReviewerIds.some(b2Id => b2Id === b.id)
    if (aIsAssigned && !bIsAssigned) return -1
    if (bIsAssigned && !aIsAssigned) return 1

    return a.displayText.localeCompare(b.displayText)
  })
}

const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}
const selectedGroup: ItemGroup = {groupId: 'selected'}

interface ReviewerPickerProps
  extends Omit<
    ReviewerPickerBaseProps,
    | 'isLoading'
    | 'pullRequestCandidateReviewers'
    | 'pullRequestSuggestedReviewers'
    | 'onSelectionChange'
    | 'pullRequestId'
  > {
  onUpdateRequestedReviewers: (teamIds: string[], userIds: string[], failureMessage: string) => void
  pullRequestId: string
}

export function LazyReviewerPicker({anchorElement, ...props}: Omit<ReviewerPickerProps, 'triggerOpen'>) {
  const [wasTriggered, setWasTriggered] = useState(false)
  if (!wasTriggered && anchorElement) {
    return anchorElement({onClick: () => setWasTriggered(true)})
  }

  return <ReviewersPicker {...props} triggerOpen anchorElement={anchorElement} />
}

/**
 * Provides a mechanism for selecting reviewers for a pull request, pulls in candidate reviewers and suggested reviewers
 */
export function ReviewersPicker({onUpdateRequestedReviewers, pullRequestId, ...props}: ReviewerPickerProps) {
  const environment = useRelayEnvironment()
  const [isLoading, setIsLoading] = useState(true)
  const [candidateReviewersKey, setCandidateReviewersKey] =
    useState<ReviewersPickerCandidateReviewers_pullRequest$key | null>(null)
  const [suggestedReviewersKey, setSuggestedReviewersKey] =
    useState<ReviewersPickerSuggestedReviewers_pullRequest$key | null>(null)

  const handleSelectionChange = useCallback(
    (selectedReviewers: Reviewer[]) => {
      const teamIds: string[] = []
      const userIds: string[] = []

      for (const reviewer of selectedReviewers) {
        if (reviewer.isTeam) {
          teamIds.push(reviewer.id)
        } else {
          userIds.push(reviewer.id)
        }
      }

      onUpdateRequestedReviewers(teamIds, userIds, 'Failed to request reviews')
    },
    [onUpdateRequestedReviewers],
  )

  useEffect(() => {
    // Fetch suggested reviewers and initial list of 20 candidate reviewers.
    // We do this in separate queries because suggested reviewers are known to timeout
    // in large/maniacal repos, so this way the picker is still usable if that happens.
    clientSideRelayFetchQueryRetained<ReviewersPickerSuggestionsQuery>({
      environment,
      query: reviewersPickerSuggestionsQuery,
      variables: {pullRequestId},
    }).subscribe({
      next: data => setSuggestedReviewersKey(data.pullRequest ?? null),
    })

    clientSideRelayFetchQueryRetained<ReviewersPickerSearchQuery>({
      environment,
      query: reviewersPickerSearchQuery,
      variables: {pullRequestId, reviewersCount: CANDIDATE_REVIEWERS_INITIAL_COUNT},
    }).subscribe({
      next: data => {
        setCandidateReviewersKey(data.pullRequest ?? null)
        setIsLoading(false)
      },
    })
  }, [environment, pullRequestId])

  return (
    <ReviewerPickerBase
      isLoading={isLoading}
      pullRequestCandidateReviewers={candidateReviewersKey}
      pullRequestId={pullRequestId}
      pullRequestSuggestedReviewers={suggestedReviewersKey}
      onSelectionChange={handleSelectionChange}
      {...props}
    />
  )
}

interface ReviewerPickerBaseProps
  extends Pick<
    ReviewerPickerBaseInternalProps,
    'anchorElement' | 'assignedReviewerIds' | 'isLoading' | 'onSelectionChange' | 'triggerOpen'
  > {
  pullRequestCandidateReviewers: ReviewersPickerCandidateReviewers_pullRequest$key | null
  pullRequestId: string
  pullRequestSuggestedReviewers: ReviewersPickerSuggestedReviewers_pullRequest$key | null
  isRequestingReviews: boolean
}

export function ReviewerPickerBase({
  pullRequestCandidateReviewers,
  pullRequestId,
  pullRequestSuggestedReviewers,
  isRequestingReviews,
  ...props
}: ReviewerPickerBaseProps) {
  const [filter, setFilter] = useState('')

  const suggestedReviewersData = useFragment(
    graphql`
      fragment ReviewersPickerSuggestedReviewers_pullRequest on PullRequest {
        suggestedReviewers {
          isAuthor
          isCommenter
          reviewer {
            id
            login
            name
            avatarUrl(size: 64)
          }
        }
      }
    `,
    pullRequestSuggestedReviewers,
  )

  const [candidateReviewersData, refetchReviewerResults] = useRefetchableFragment(
    graphql`
      fragment ReviewersPickerCandidateReviewers_pullRequest on PullRequest
      @argumentDefinitions(query: {type: "String"}, reviewersCount: {type: "Int", defaultValue: 100})
      @refetchable(queryName: "ReviewersPickerCandidateReviewersQuery") {
        candidateReviewers(query: $query, first: $reviewersCount) {
          edges {
            node {
              reviewer {
                ... on Team {
                  __typename
                  id
                  combinedSlug
                  teamName: name
                  teamAvatarUrl: avatarUrl(size: 64)
                }
                ... on User {
                  __typename
                  id
                  login
                  name
                  avatarUrl(size: 64)
                }
              }
            }
          }
        }
      }
    `,
    pullRequestCandidateReviewers,
  )

  const refreshReviewers = useCallback(
    (query: string) => {
      // if the query string is empty, just don't pass it to the query
      const queryVal = !query ? undefined : query
      startTransition(() => {
        refetchReviewerResults({query: queryVal, pullRequestId})
      })
    },
    [pullRequestId, refetchReviewerResults],
  )

  const candidateReviewers = candidateReviewersData?.candidateReviewers.edges
  const suggestedReviewers = suggestedReviewersData?.suggestedReviewers

  const potentialReviewers = useMemo(() => {
    // remove results that are already displayed in suggestions
    const suggestionsSet = new Set(suggestedReviewers?.map(sug => sug?.reviewer.login))
    const results: Reviewer[] = []
    if (!candidateReviewers) return results
    for (const reviewerNode of candidateReviewers) {
      const reviewer = reviewerNode?.node?.reviewer
      if (reviewer?.__typename === 'User' && !suggestionsSet.has(reviewer.login)) {
        results.push({
          id: reviewer.id,
          description: reviewer.name,
          displayText: reviewer.login,
          avatarUrl: reviewer.avatarUrl,
          isCommenter: false,
          isAuthor: false,
          isTeam: false,
        })
      } else if (reviewer?.__typename === 'Team' && !suggestionsSet.has(reviewer.combinedSlug)) {
        results.push({
          id: reviewer.id,
          description: reviewer.teamName,
          displayText: reviewer.combinedSlug,
          avatarUrl: reviewer.teamAvatarUrl,
          isCommenter: false,
          isAuthor: false,
          isTeam: true,
        })
      }
    }

    return results
  }, [candidateReviewers, suggestedReviewers])

  const suggestedReviewersItems = useMemo(() => {
    let reviewers = suggestedReviewers?.filter(notEmpty)

    // remove suggestions that weren't included in the search results
    if (filter && candidateReviewers) {
      const userSearchResultLogins = new Set<string>()
      for (const result of candidateReviewers) {
        const reviewer = result?.node?.reviewer
        if (reviewer && reviewer.__typename === 'User') userSearchResultLogins.add(reviewer.login)
      }

      reviewers = reviewers?.filter(reviewer => userSearchResultLogins.has(reviewer.reviewer.login))
    }

    if (!reviewers) return []

    return reviewers.map(reviewer => {
      const {reviewer: reviewerData, isAuthor, isCommenter} = reviewer
      return {
        id: reviewerData.id,
        description: reviewerData.name,
        displayText: reviewerData.login,
        avatarUrl: reviewerData.avatarUrl,
        isCommenter,
        isAuthor,
        isTeam: false,
      }
    })
  }, [filter, candidateReviewers, suggestedReviewers])

  return (
    <ReviewerPickerBaseInternal
      filter={filter}
      isRequestingReviews={isRequestingReviews}
      refreshReviewers={refreshReviewers}
      searchResults={potentialReviewers}
      suggestedReviewers={suggestedReviewersItems}
      onFilter={setFilter}
      {...props}
    />
  )
}

interface ReviewerPickerBaseInternalProps {
  anchorElement: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
  assignedReviewerIds: string[]
  filter: string
  isLoading: boolean
  isRequestingReviews: boolean
  onFilter: (query: string) => void
  onSelectionChange: (selectedReviewers: Reviewer[]) => void
  refreshReviewers: (query: string) => void
  searchResults: Reviewer[]
  suggestedReviewers: Reviewer[]
  triggerOpen?: boolean
}

function ReviewerPickerBaseInternal({
  anchorElement,
  assignedReviewerIds,
  filter,
  isLoading,
  isRequestingReviews,
  onFilter,
  onSelectionChange,
  refreshReviewers,
  searchResults,
  suggestedReviewers,
  triggerOpen,
}: ReviewerPickerBaseInternalProps) {
  const {addToast} = useToastContext()

  const getItemKey = useCallback((assignee: Reviewer) => assignee.id, [])

  const groupItemId = useCallback(
    (reviewer: Reviewer) => {
      if (assignedReviewerIds.includes(reviewer.id)) {
        return selectedGroup.groupId
      } else {
        return suggestionsGroup.groupId
      }
    },
    [assignedReviewerIds],
  )

  const convertToItemProps = useCallback(
    (reviewer: Reviewer): ExtendedItemProps<Reviewer> => {
      let description: string | undefined

      if (reviewer.isAuthor) {
        description = 'Recently edited these files'
      } else if (reviewer.isCommenter) {
        description = 'Recently reviewed these files'
      }

      return {
        id: reviewer.id,
        text: reviewer.displayText,
        description,
        descriptionVariant: 'block',
        source: reviewer,
        groupId: groupItemId(reviewer),
        leadingVisual: () =>
          reviewer.avatarUrl ? <GitHubAvatar alt={reviewer.displayText} src={reviewer.avatarUrl} /> : null,
        trailingVisual: reviewer.description ? () => <Text sx={{fontSize: 0}}>{reviewer.description}</Text> : undefined,
      }
    },
    [groupItemId],
  )

  const fetchSearchData = useCallback(
    (query: string) => {
      try {
        refreshReviewers(query)
      } catch {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: 'Failed to search reviewers'})
      }
    },
    [addToast, refreshReviewers],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchSearchData = useCallback(
    debounce((nextValue: string) => fetchSearchData(nextValue), 200),
    [fetchSearchData],
  )

  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (filter !== trimmedFilter) {
        debounceFetchSearchData(trimmedFilter)
      }

      onFilter(value)
    },
    [debounceFetchSearchData, filter, onFilter],
  )

  const items = useMemo(() => {
    const sortedSuggestions = sortReviewerPickerUsers(assignedReviewerIds, suggestedReviewers)
    const sortedSearchResults = sortReviewerPickerUsers(assignedReviewerIds, searchResults)

    return sortedSuggestions.concat(sortedSearchResults)
  }, [assignedReviewerIds, searchResults, suggestedReviewers])

  const groups: ItemGroup[] | undefined = useMemo(() => {
    const itemGroups: ItemGroup[] = []

    if (assignedReviewerIds.length > 0) {
      itemGroups.push(selectedGroup)
    }

    if (searchResults.length > 0 || suggestedReviewers.length > 0) {
      itemGroups.push(suggestionsGroup)
    }

    return itemGroups
  }, [assignedReviewerIds.length, searchResults.length, suggestedReviewers.length])

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        convertToItemProps={convertToItemProps}
        filterItems={filterItems}
        getItemKey={getItemKey}
        groups={groups}
        height="medium"
        initialSelectedItems={assignedReviewerIds}
        items={items}
        loading={isLoading || isRequestingReviews}
        placeholderText="Filter reviewers"
        renderAnchor={anchorElement}
        selectionVariant="multiple"
        triggerOpen={triggerOpen}
        width="medium"
        onSelectionChange={onSelectionChange}
      />
    </Box>
  )
}
