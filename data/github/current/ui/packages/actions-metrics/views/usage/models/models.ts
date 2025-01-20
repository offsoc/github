import type {ApproximateNumber, Repository, MetricsRunnerItem} from '../../../common/models/models'

// These should match https://github.com/github/actions-usage-metrics/blob/main/proto/usage.proto
// as (aside from repository info) we currently pass them through directly from the AUM backend.

export interface WorkflowMetricsItem extends UsageMetricsItem {
  repository?: Repository
  workflowFilePath?: string
  workflowExecutions?: ApproximateNumber
  jobs?: ApproximateNumber
}

export interface JobMetricsItem extends UsageMetricsItem {
  repository?: Repository
  workflowFilePath?: string
  jobName?: string
  jobExecutions?: number
}

export interface RepositoryMetricsItem extends UsageMetricsItem {
  repository?: Repository
  workflowExecutions?: ApproximateNumber
  workflows?: ApproximateNumber
}

export interface RuntimeMetricsItem extends Omit<UsageMetricsItem, 'runnerType'> {
  workflowExecutions?: ApproximateNumber
  workflows?: ApproximateNumber
}

export interface RunnerMetricsItem extends Omit<UsageMetricsItem, 'runnerRuntime'> {
  workflowExecutions?: ApproximateNumber
  workflows?: ApproximateNumber
}

interface UsageMetricsItem extends MetricsRunnerItem {
  totalMinutes?: number
}
