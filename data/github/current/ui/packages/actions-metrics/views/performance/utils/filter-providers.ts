import type {FilterProvider} from '@github-ui/filter'
import {TabType} from '../../../common/models/enums'
import {getFilters, type FilterItem} from '../../../common/constants/filters'
import {COLUMNS} from '../../../common/constants/constants'

const COMMON_JOB_FILTERS = [
  {key: COLUMNS.filterRunTimeMinutes, priority: 2},
  {key: COLUMNS.filterQueueTimeMinutes, priority: 2},
  {key: COLUMNS.failureRate, priority: 2},
  {key: COLUMNS.jobExecutions, priority: 2},
]

const WORKFLOW_FILTERS: FilterItem[] = [
  {key: COLUMNS.repository, priority: 1},
  {key: COLUMNS.workflowFileName, priority: 1},
  {key: COLUMNS.filterRunTimeMinutes, priority: 2},
  {key: COLUMNS.failureRate, priority: 2},
  {key: COLUMNS.jobs, priority: 2},
  {key: COLUMNS.workflowExecutions, priority: 2},
]

const JOBS_FILTERS: FilterItem[] = [
  {key: COLUMNS.repository, priority: 1},
  {key: COLUMNS.jobName, priority: 1},
  {key: COLUMNS.workflowFileName, priority: 1},
  {key: COLUMNS.runnerRuntime, priority: 2},
  {key: COLUMNS.runnerType, priority: 2},
  ...COMMON_JOB_FILTERS,
]

const REPOSITORIES_FILTERS: FilterItem[] = [{key: COLUMNS.repository, priority: 1}, ...COMMON_JOB_FILTERS]

const RUNTIME_FILTERS: FilterItem[] = [{key: COLUMNS.runnerRuntime, priority: 1}, ...COMMON_JOB_FILTERS]

const RUNNER_TYPE_FILTERS: FilterItem[] = [{key: COLUMNS.runnerType, priority: 1}, ...COMMON_JOB_FILTERS]

const TAB_TO_FILTERS_MAPPING = new Map<TabType, FilterItem[]>()
TAB_TO_FILTERS_MAPPING.set(TabType.Workflows, WORKFLOW_FILTERS)
TAB_TO_FILTERS_MAPPING.set(TabType.Jobs, JOBS_FILTERS)
TAB_TO_FILTERS_MAPPING.set(TabType.Repositories, REPOSITORIES_FILTERS)
TAB_TO_FILTERS_MAPPING.set(TabType.Runtime, RUNTIME_FILTERS)
TAB_TO_FILTERS_MAPPING.set(TabType.RunnerType, RUNNER_TYPE_FILTERS)

export function getPerformanceFilters(tab?: string): FilterProvider[] {
  return getFilters(TAB_TO_FILTERS_MAPPING, WORKFLOW_FILTERS, tab)
}
