import {
  Filter,
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  type FilterSuggestion,
  FilterValueType,
  ProviderSupportStatus,
} from '@github-ui/filter'
import {
  AssigneeFilterProvider,
  IsFilterProvider,
  LabelFilterProvider,
  MilestoneFilterProvider,
  RepositoryFilterProvider,
  StateFilterProvider,
  TypeFilterProvider,
  UpdatedFilterProvider,
} from '@github-ui/filter/providers'
import {memo, useCallback, useMemo, useRef} from 'react'
import {type Environment, useRelayEnvironment} from 'react-relay'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {getInitialState} from '../../helpers/initial-state'
import type {LoggedInUser} from '../../helpers/json-island'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {ColumnModel} from '../../models/column-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {Resources} from '../../strings'
import {
  DateFilterProvider,
  FILTER_PRIORITIES,
  IterationFilterProvider,
  LastUpdatedFilterProvider,
  LinkedPullRequestsFilterProvider,
  NumberFilterProvider,
  ParentIssueFilterProvider,
  ReasonFilterProvider,
  ReviewersFilterProvider,
  SingleSelectFilterProvider,
  SubIssuesProgressFilterProvider,
  TextFilterProvider,
} from './filter-providers'
import {HasFilterProvider} from './has-filter-provider'
import {useHandleFilterBarShortcut} from './use-handle-filter-bar-shortcut'

type FilterBarProps = {
  value?: string
  onChange: (value: string) => void
}

const SUPPORTED_FILTER_TYPES: Array<MemexColumnDataType> = [
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Date,
  MemexColumnDataType.Iteration,
  MemexColumnDataType.Labels,
  MemexColumnDataType.LinkedPullRequests,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.Number,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Reviewers,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Text,
]

const getFilterProviderForColumn = (
  column: ColumnModel,
  loggedInUser?: LoggedInUser,
  relayEnvironment?: Environment,
  issue_types?: boolean,
  projectOwnerLogin?: string,
  projectNumber?: number,
) => {
  const userFilterParams = loggedInUser
    ? {
        showAtMe: true,
        currentUserLogin: loggedInUser.login,
        currentUserAvatarUrl: loggedInUser.avatarUrl,
      }
    : {showAtMe: false}

  // Setting valueless to false for all because we don't support the e.g. `assignee:none` syntax yet
  switch (column.dataType) {
    case MemexColumnDataType.Assignees:
      return new AssigneeFilterProvider(userFilterParams, {filterTypes: {exclusive: true}})
    case MemexColumnDataType.Date:
      return new DateFilterProvider(column)
    case MemexColumnDataType.Iteration:
      return new IterationFilterProvider(column)
    case MemexColumnDataType.Labels:
      return new LabelFilterProvider({
        filterTypes: {exclusive: true},
      })
    case MemexColumnDataType.LinkedPullRequests:
      return new LinkedPullRequestsFilterProvider()
    case MemexColumnDataType.Milestone:
      return new MilestoneFilterProvider({
        priority: FILTER_PRIORITIES.milestone,
        filterTypes: {exclusive: true},
      })
    case MemexColumnDataType.IssueType:
      return new TypeFilterProvider(
        {priority: FILTER_PRIORITIES.type, filterTypes: {valueless: true}},
        false,
        relayEnvironment,
        undefined,
        issue_types,
        {login: projectOwnerLogin, projectNumber},
      )
    case MemexColumnDataType.Number:
      return new NumberFilterProvider(column)
    case MemexColumnDataType.Repository:
      return new RepositoryFilterProvider({filterTypes: {exclusive: true}})
    case MemexColumnDataType.Reviewers:
      return new ReviewersFilterProvider(userFilterParams, {filterTypes: {exclusive: true}})
    case MemexColumnDataType.SingleSelect:
      return new SingleSelectFilterProvider(column)
    case MemexColumnDataType.SubIssuesProgress:
      return new SubIssuesProgressFilterProvider(column)
    case MemexColumnDataType.Text:
      return new TextFilterProvider(column)
    case MemexColumnDataType.ParentIssue:
      return new ParentIssueFilterProvider(column)
    default:
      throw new Error(`Filter support for ${column.name} column not implemented`)
  }
}

const filterBarSx = {width: '100%'}
export const FilterBar = memo(function FilterBar({value, onChange}: FilterBarProps) {
  const relayEnvironment = useRelayEnvironment()

  const {issue_types, sub_issues} = useEnabledFeatures()
  const {allColumns} = useAllColumns()
  const {loggedInUser, projectOwner, projectData} = getInitialState()
  const {mwl_filter_bar_validation} = useEnabledFeatures()
  const columnFilterProviders = useMemo(() => {
    const supportedFilterTypes = [...SUPPORTED_FILTER_TYPES]
    if (sub_issues) {
      supportedFilterTypes.push(MemexColumnDataType.ParentIssue)
      supportedFilterTypes.push(MemexColumnDataType.SubIssuesProgress)
    }
    return allColumns
      .filter(({dataType}) => supportedFilterTypes.includes(dataType))
      .map(column =>
        getFilterProviderForColumn(
          column,
          loggedInUser,
          relayEnvironment,
          issue_types,
          projectOwner?.login,
          projectData?.number,
        ),
      )
  }, [sub_issues, allColumns, loggedInUser, relayEnvironment, issue_types, projectOwner?.login, projectData?.number])

  const inputRef = useRef<HTMLInputElement>(null)

  const onFilterBarShortcut = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useHandleFilterBarShortcut(onFilterBarShortcut)

  const hasFilterProviderValues: Array<FilterSuggestion> = useMemo(
    () =>
      columnFilterProviders
        .sort((a, b) => (a.displayName ?? a.key)?.localeCompare(b.displayName ?? b.key) ?? 0)
        .filter(provider => provider.options.filterTypes.valueless !== false)
        .map(provider => ({
          value: provider.key,
          priority: FILTER_PRIORITY_DISPLAY_THRESHOLD,
          displayName: provider.displayName,
          type: FilterValueType.Value,
          icon: provider.icon,
        })),
    [columnFilterProviders],
  )

  return (
    <Filter
      id="filter-bar-component"
      data-testid="filter-bar-component"
      label="Filter"
      filterButtonVariant="compact"
      settings={{
        aliasMatching: true,
      }}
      aria-label={Resources.filterByKeyboardOrByField}
      placeholder={Resources.filterByKeyboardOrByField}
      sx={filterBarSx}
      filterValue={value}
      inputRef={inputRef}
      onChange={onChange}
      showValidationMessage={mwl_filter_bar_validation}
      providers={useMemo(
        () => [
          ...columnFilterProviders,
          new LastUpdatedFilterProvider(),
          new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged'], {filterTypes: {valueless: false}}),
          new StateFilterProvider('mixed', {
            priority: FILTER_PRIORITIES.state,
            support: {status: ProviderSupportStatus.Unsupported},
            filterTypes: {valueless: false},
          }),
          new HasFilterProvider(hasFilterProviderValues),
          new UpdatedFilterProvider({filterTypes: {valueless: false}}),
          new ReasonFilterProvider(),
        ],
        [columnFilterProviders, hasFilterProviderValues],
      )}
    />
  )
})
