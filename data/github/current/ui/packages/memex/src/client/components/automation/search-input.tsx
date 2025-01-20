/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {SearchIcon} from '@primer/octicons-react'
import {type BoxProps, FormControl} from '@primer/react'
import {useEffect, useMemo} from 'react'
import {graphql, type PreloadedQuery, readInlineData, usePaginationFragment, usePreloadedQuery} from 'react-relay'

import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'
import {WorkflowResources} from '../../strings'
import {FilterSuggestionsItemsContext, type FilterSuggestionsItemsContextProps} from '../filter-bar/filter-suggestions'
import {ShowColumnSuggestionModeEnum} from '../filter-bar/helpers/filter-suggestions'
import {TokenizedFilterInput} from '../filter-bar/tokenized-filter-input'
import type {searchInputIssueTypeSuggestionsPaginated$data} from './__generated__/searchInputIssueTypeSuggestionsPaginated.graphql'
import type {searchInputIssueTypeSuggestionsQuery} from './__generated__/searchInputIssueTypeSuggestionsQuery.graphql'
import type {searchInputLabel$data, searchInputLabel$key} from './__generated__/searchInputLabel.graphql'
import type {searchInputLabelSuggestionsPaginated$data} from './__generated__/searchInputLabelSuggestionsPaginated.graphql'
import type {searchInputLabelSuggestionsQuery} from './__generated__/searchInputLabelSuggestionsQuery.graphql'
import type {searchInputMilestone$data, searchInputMilestone$key} from './__generated__/searchInputMilestone.graphql'
import type {searchInputMilestoneSuggestionsPaginated$data} from './__generated__/searchInputMilestoneSuggestionsPaginated.graphql'
import type {searchInputMilestoneSuggestionsQuery} from './__generated__/searchInputMilestoneSuggestionsQuery.graphql'
import {DisabledFilterInput} from './blocks/disabled-filter-input'
import type {
  searchInputIssueType$data,
  searchInputIssueType$key,
} from './fragments/__generated__/searchInputIssueType.graphql'
import {issueTypeFragment, labelFragment, milestoneFragment} from './fragments/search-input'
import {useSearchInputState} from './hooks/use-search-input-state'

type SearchInputProps = BoxProps & {
  onQueryChange: (query: string) => void
  labelSuggestionsQueryRef: PreloadedQuery<searchInputLabelSuggestionsQuery>
  milestoneSuggestionsQueryRef: PreloadedQuery<searchInputMilestoneSuggestionsQuery>
  issueTypeSuggestionsQueryRef: PreloadedQuery<searchInputIssueTypeSuggestionsQuery>
  query: string
  initialQuery?: string
}

// Set the permitted tokens and their suggestion level for auto-add workflow search input
const AllowedSuggestedColumnsMap = new Map<string, ShowColumnSuggestionModeEnum>([
  ['Labels', ShowColumnSuggestionModeEnum.ColumnAndValues],
  ['Milestone', ShowColumnSuggestionModeEnum.ColumnAndValues],
  ['Type', ShowColumnSuggestionModeEnum.ColumnAndValues],
  ['Assignees', ShowColumnSuggestionModeEnum.ColumnOnly],
  ['last-updated', ShowColumnSuggestionModeEnum.None],
  ['updated', ShowColumnSuggestionModeEnum.None],
])
const showColumnSuggestionIf = (suggestion: string) => {
  if (AllowedSuggestedColumnsMap.has(suggestion)) {
    return AllowedSuggestedColumnsMap.get(suggestion)
  }
}

export const LabelSuggestionsGraphqlQuery = graphql`
  query searchInputLabelSuggestionsQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...searchInputLabelSuggestionsPaginated
    }
  }
`

export const MilestoneSuggestionsGraphqlQuery = graphql`
  query searchInputMilestoneSuggestionsQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...searchInputMilestoneSuggestionsPaginated
    }
  }
`

export const IssueTypeSuggestionsGraphqlQuery = graphql`
  query searchInputIssueTypeSuggestionsQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...searchInputIssueTypeSuggestionsPaginated
    }
  }
`

export const SearchInput = ({
  onQueryChange,
  query,
  initialQuery = '',
  milestoneSuggestionsQueryRef,
  labelSuggestionsQueryRef,
  issueTypeSuggestionsQueryRef,
}: SearchInputProps) => {
  const {workflow} = useAutomationGraph()

  const {setValueFromSuggestion, isDirty, editingDisabled, clearQuery, handleQueryChange, resetChanges} =
    useSearchInputState({
      query,
      initialQuery,
      workflow,
      onQueryChange,
    })

  const preloadedData = usePreloadedQuery<searchInputLabelSuggestionsQuery>(
    LabelSuggestionsGraphqlQuery,
    labelSuggestionsQueryRef,
  )

  const preloadedMilestoneData = usePreloadedQuery<searchInputMilestoneSuggestionsQuery>(
    MilestoneSuggestionsGraphqlQuery,
    milestoneSuggestionsQueryRef,
  )

  const preloadedIssueTypeData = usePreloadedQuery<searchInputIssueTypeSuggestionsQuery>(
    IssueTypeSuggestionsGraphqlQuery,
    issueTypeSuggestionsQueryRef,
  )

  const DEFAULT_QUERY_SIZE = 100

  const {
    data: labelData,
    loadNext: loadNextLabels,
    isLoadingNext: isLoadingNextLabels,
    hasNext: hasNextLabels,
  } = usePaginationFragment(
    graphql`
      fragment searchInputLabelSuggestionsPaginated on Repository
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 100})
      @refetchable(queryName: "searchInputLabelSuggestionsPaginationQuery") {
        labels(first: $count, after: $cursor) @connection(key: "Repository_labels") {
          edges {
            __id
            node {
              ...searchInputLabel
            }
          }
          totalCount
        }
      }
    `,
    preloadedData.repository ? preloadedData.repository : null,
  )

  const {
    data: milestoneData,
    loadNext: loadNextMilestones,
    isLoadingNext: isLoadingNextMilestones,
    hasNext: hasNextMilestones,
  } = usePaginationFragment(
    graphql`
      fragment searchInputMilestoneSuggestionsPaginated on Repository
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 100})
      @refetchable(queryName: "searchInputMilestoneSuggestionsPaginationQuery") {
        milestones(first: $count, after: $cursor) @connection(key: "Repository_milestones") {
          edges {
            __id
            node {
              ...searchInputMilestone
            }
          }
          totalCount
        }
      }
    `,
    preloadedMilestoneData.repository ? preloadedMilestoneData.repository : null,
  )

  const {
    data: issueTypeData,
    loadNext: loadNextIssueTypes,
    isLoadingNext: isLoadingNextIssueTypes,
    hasNext: hasNextIssueTypes,
  } = usePaginationFragment(
    graphql`
      fragment searchInputIssueTypeSuggestionsPaginated on Repository
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 10})
      @refetchable(queryName: "searchInputIssueTypeSuggestionsPaginationQuery") {
        issueTypes(first: $count, after: $cursor) @connection(key: "Repository_issueTypes") {
          edges {
            __id
            node {
              ...searchInputIssueType
            }
          }
          totalCount
        }
      }
    `,
    preloadedIssueTypeData.repository ? preloadedIssueTypeData.repository : null,
  )

  const totalNumberOfIssueTypes =
    (issueTypeData as searchInputIssueTypeSuggestionsPaginated$data)?.issueTypes?.totalCount || 0
  const fetchedIssueTypes = (
    (issueTypeData as searchInputIssueTypeSuggestionsPaginated$data)?.issueTypes?.edges || []
  ).flatMap(a => (a?.node ? [readInlineData<searchInputIssueType$key>(issueTypeFragment, a.node)] : []))

  const totalNumberOfLabels = (labelData as searchInputLabelSuggestionsPaginated$data)?.labels?.totalCount || 0
  const fetchedLabels = ((labelData as searchInputLabelSuggestionsPaginated$data)?.labels?.edges || []).flatMap(a =>
    a?.node ? [readInlineData<searchInputLabel$key>(labelFragment, a.node)] : [],
  )

  const totalNumberOfMilestones =
    (milestoneData as searchInputMilestoneSuggestionsPaginated$data)?.milestones?.totalCount || 0
  const fetchedMilestones = (
    (milestoneData as searchInputMilestoneSuggestionsPaginated$data)?.milestones?.edges || []
  ).flatMap(a => (a?.node ? [readInlineData<searchInputMilestone$key>(milestoneFragment, a.node)] : []))

  useEffect(() => {
    if (hasNextLabels && !isLoadingNextLabels && fetchedLabels.length < totalNumberOfLabels) {
      loadNextLabels(DEFAULT_QUERY_SIZE)
    }
  }, [loadNextLabels, fetchedLabels, totalNumberOfLabels, hasNextLabels, isLoadingNextLabels])

  useEffect(() => {
    if (hasNextMilestones && !isLoadingNextMilestones && fetchedMilestones.length < totalNumberOfMilestones) {
      loadNextMilestones(DEFAULT_QUERY_SIZE)
    }
  }, [loadNextMilestones, fetchedMilestones, totalNumberOfMilestones, hasNextMilestones, isLoadingNextMilestones])

  useEffect(() => {
    if (hasNextIssueTypes && !isLoadingNextIssueTypes && fetchedIssueTypes.length < totalNumberOfIssueTypes) {
      loadNextIssueTypes(DEFAULT_QUERY_SIZE)
    }
  }, [loadNextIssueTypes, fetchedIssueTypes, totalNumberOfIssueTypes, hasNextIssueTypes, isLoadingNextIssueTypes])

  const labels = useMemo(() => {
    const allLabels: Array<searchInputLabel$data> = []
    return allLabels.concat(fetchedLabels)
  }, [fetchedLabels])

  const milestones = useMemo(() => {
    const allMilestones: Array<searchInputMilestone$data> = []
    return allMilestones.concat(fetchedMilestones)
  }, [fetchedMilestones])

  const issueTypes = useMemo(() => {
    const allIssueTypes: Array<searchInputIssueType$data> = []
    return allIssueTypes.concat(fetchedIssueTypes)
  }, [fetchedIssueTypes])

  const contextValue: FilterSuggestionsItemsContextProps = useMemo(() => {
    return {
      items: [],
      repoSuggestions: {labels, milestones, issueTypes},
    }
  }, [labels, milestones, issueTypes])

  if (editingDisabled) {
    return <DisabledFilterInput query={query} icon={<SearchIcon />} />
  } else {
    return (
      <FilterSuggestionsItemsContext.Provider value={contextValue}>
        <TokenizedFilterInput
          height="32px"
          value={query}
          onChange={handleQueryChange}
          onClearButtonClick={clearQuery}
          setValueFromSuggestion={setValueFromSuggestion}
          onResetChanges={isDirty ? resetChanges : undefined}
          filterIconButtonIcon={SearchIcon}
          suggestColumns
          showColumnSuggestionIf={showColumnSuggestionIf}
          hideSaveButton
          hideCounterLabel
          aria-describedby="query-validation-message"
        />
        {isDirty && query.length === 0 && (
          <FormControl.Validation variant="error" id="query-validation-message" sx={{mt: 1, color: 'attention.fg'}}>
            {WorkflowResources.emptyFilterAutoAdd}
          </FormControl.Validation>
        )}
      </FilterSuggestionsItemsContext.Provider>
    )
  }
}
