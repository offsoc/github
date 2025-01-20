import {RepoIcon, ServerIcon, StopwatchIcon, WorkflowIcon} from '@primer/octicons-react'
import {LABELS} from '../resources/labels'
import {TabType} from '../models/enums'

export const ORG_TABS = [
  {value: TabType.Workflows, displayValue: LABELS.workflows, icon: WorkflowIcon},
  {value: TabType.Jobs, displayValue: LABELS.jobs, icon: StopwatchIcon},
  {value: TabType.Repositories, displayValue: LABELS.repositories, icon: RepoIcon},
  {value: TabType.Runtime, displayValue: LABELS.runtimeOs, icon: ServerIcon},
  {value: TabType.RunnerType, displayValue: LABELS.runnerType, icon: ServerIcon},
]

export const REPO_TABS = ORG_TABS.filter(t => t.value !== TabType.Repositories)

export const COLUMNS = {
  // common
  workflowFileName: 'workflow_file_name',
  workflowFilePath: 'workflow_file_path',
  repository: 'repository',
  runnerRuntime: 'runner_runtime',
  runnerType: 'runner_type',

  // usage
  jobs: 'jobs',
  jobName: 'job_name',
  jobExecutions: 'job_executions',
  totalMinutes: 'total_minutes',
  workflows: 'workflows',
  workflowExecutions: 'workflow_executions',

  // performance
  averageRunTime: 'average_run_time',
  averageQueueTime: 'average_queue_time',
  failureRate: 'failure_rate',

  // special values just for filters
  filterQueueTimeMinutes: 'average_queue_minutes',
  filterRunTimeMinutes: 'average_run_minutes',
}

export const TIME_IN_MS = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
}
