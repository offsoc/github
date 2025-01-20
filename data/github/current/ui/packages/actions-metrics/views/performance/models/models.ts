import type {Repository, MetricsRunnerItem, ApproximateNumber} from '../../../common/models/models'

// These should match https://github.com/github/actions-usage-metrics/blob/main/proto/usage.proto
// as (aside from repository info) we currently pass them through directly from the AUM backend.

export interface WorkflowMetricsItem
  extends Omit<PerformanceMetricsItem, 'runnerType' | 'runnerRuntime' | 'jobExecutions'> {
  repository?: Repository
  workflowFilePath?: string
  workflowExecutions?: number
  jobs?: ApproximateNumber
}

export interface JobMetricsItem extends PerformanceMetricsItem {
  jobName?: string
  repository?: Repository
  workflowFilePath?: string
}

export interface RepositoryMetricsItem extends PerformanceMetricsItem {
  repository?: Repository
}

export interface RuntimeMetricsItem extends Omit<PerformanceMetricsItem, 'runnerType'> {}

export interface RunnerMetricsItem extends Omit<PerformanceMetricsItem, 'runnerRuntime'> {}

interface PerformanceMetricsItem extends MetricsRunnerItem {
  failureRate?: number
  averageRunTime?: number
  averageQueueTime?: number
  jobExecutions?: number
}
