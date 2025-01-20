import type {FilterKey, FilterProvider, FilterSuggestion} from '@github-ui/filter'
import {
  ClockIcon,
  GlobeIcon,
  PackageIcon,
  PulseIcon,
  RepoIcon,
  RocketIcon,
  WorkflowIcon,
  XCircleIcon,
} from '@primer/octicons-react'
import {LABELS} from '../resources/labels'
import {COLUMNS} from './constants'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {
  AsyncStringSuggestionsFilterProvider,
  NumberFilterProvider,
  ValuesFilterProvider,
} from '../utils/filter-providers'
import {PATHS} from './controller_paths'
import type {TabType} from '../models/enums'
import {Utils} from '../utils/utils'

export interface FilterItem {
  key: string
  priority: number
}

export const enum FilterType {
  Number,
  Values,
  Async,
}

export const FILTER = 0
export const FILTER_TYPE = 1

// map key (camelCase) must match object key (snake_case)
export const FILTERS: {[key: string]: [Omit<FilterKey, 'priority'>, FilterType]} = {
  // common
  workflowFileName: [
    {displayName: LABELS.workflow, key: COLUMNS.workflowFileName, icon: WorkflowIcon},
    FilterType.Async,
  ],
  repository: [{displayName: LABELS.sourceRepository, key: COLUMNS.repository, icon: RepoIcon}, FilterType.Async],
  jobName: [{displayName: LABELS.job, key: COLUMNS.jobName, icon: PulseIcon}, FilterType.Async],
  runnerRuntime: [{displayName: LABELS.runtimeOs, key: COLUMNS.runnerRuntime, icon: GlobeIcon}, FilterType.Values],
  runnerType: [{displayName: LABELS.runnerType, key: COLUMNS.runnerType, icon: PackageIcon}, FilterType.Values],

  // usage
  totalMinutes: [{displayName: LABELS.totalMinutes, key: COLUMNS.totalMinutes, icon: ClockIcon}, FilterType.Number],
  jobExecutions: [{displayName: LABELS.jobRuns, key: COLUMNS.jobExecutions, icon: RocketIcon}, FilterType.Number],
  jobs: [{displayName: LABELS.jobs, key: COLUMNS.jobs, icon: PulseIcon}, FilterType.Number],
  workflows: [{displayName: LABELS.workflows, key: COLUMNS.workflows, icon: WorkflowIcon}, FilterType.Number],
  workflowExecutions: [
    {displayName: LABELS.workflowRuns, key: COLUMNS.workflowExecutions, icon: RocketIcon},
    FilterType.Number,
  ],

  // performance
  averageRunMinutes: [
    {displayName: LABELS.avgRunTimeMinutes, key: COLUMNS.filterRunTimeMinutes, icon: ClockIcon},
    FilterType.Number,
  ],
  averageQueueMinutes: [
    {displayName: LABELS.avgQueueTimeMinutes, key: COLUMNS.filterQueueTimeMinutes, icon: ClockIcon},
    FilterType.Number,
  ],
  failureRate: [{displayName: LABELS.failureRate, key: COLUMNS.failureRate, icon: XCircleIcon}, FilterType.Number],
}

export const NUMBER_COUNT_VALUE = [
  {value: '>0', displayName: LABELS.filters.atLeast1, priority: 1},
  {value: '>10', displayName: LABELS.filters.moreThan10, priority: 2},
]

export const RUNTIME_VALUES = [
  {value: LABELS.runtimes.linux, priority: 1},
  {value: LABELS.runtimes.windows, priority: 2},
  {value: LABELS.runtimes.macos, priority: 3},
]

export const RUNNER_TYPE_VALUES = [
  {value: LABELS.runnerTypes.hosted, priority: 1},
  {value: LABELS.runnerTypes.hostedLarger, priority: 2},
  {value: LABELS.runnerTypes.selfHosted, priority: 3},
]

export function getFilters(
  tabToFiltersMap: Map<TabType, FilterItem[]>,
  defaultTabFilters: FilterItem[],
  tab?: string,
): FilterProvider[] {
  const filterItems =
    tab && tabToFiltersMap.has(tab as TabType) ? tabToFiltersMap.get(tab as TabType) : defaultTabFilters
  const result = filterItems!
    .map(filterItem => {
      const filterAndType = FILTERS[Utils.snakeToCamel(filterItem.key)]!
      const filter = filterAndType[FILTER] as unknown as FilterKey
      filter.priority = filterItem.priority
      const type = filterAndType[FILTER_TYPE]

      if (type === FilterType.Values) {
        let suggestions: FilterSuggestion[] | undefined = undefined
        if (filterItem.key === COLUMNS.runnerRuntime) {
          suggestions = RUNTIME_VALUES
        }
        if (filterItem.key === COLUMNS.runnerType) {
          suggestions = RUNNER_TYPE_VALUES
        }

        if (suggestions) {
          return new ValuesFilterProvider(filter, suggestions)
        }
      }

      if (type === FilterType.Async) {
        const url = ssrSafeLocation.pathname
        let endpoint = ''
        if (filterItem.key === COLUMNS.workflowFileName) {
          endpoint = url + PATHS.getWorkflows
        }

        if (filterItem.key === COLUMNS.repository) {
          endpoint = url + PATHS.getRepositories
        }

        if (filterItem.key === COLUMNS.jobName) {
          endpoint = url + PATHS.getJobs
        }

        if (endpoint) {
          return new AsyncStringSuggestionsFilterProvider(filter, endpoint)
        }
      }

      if (type === FilterType.Number) {
        return new NumberFilterProvider(filter, NUMBER_COUNT_VALUE)
      }

      return undefined
    })
    .filter(filter => filter !== undefined) as FilterProvider[]

  return result
}
