import type {Column} from '@primer/react/drafts'
import type {CardData, CardHeading, MetricsItem, OrderBy} from '../../../common/models/models'
import type {IObservableArray} from '../../../common/observables/observable'
import {ObservableArray} from '../../../common/observables/observable'
import type {IMetricsService} from '../../../common/services/metrics-service'
import {DEFAULT_ORDER_BY_DIRECTION, MetricsService} from '../../../common/services/metrics-service'
import {LABELS} from '../../../common/resources/labels'
import {
  DurationCell,
  NumberCell,
  PercentCell,
  RepositoryCell,
  TextCell,
  WorkflowCell,
} from '../../../common/components/MetricsCells'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {FilterProvider} from '@github-ui/filter'
import {getPerformanceFilters} from '../utils/filter-providers'
import {GET_DATE_RANGE_LABEL, RequestType, TabType} from '../../../common/models/enums'
import type {
  JobMetricsItem,
  RepositoryMetricsItem,
  RunnerMetricsItem,
  RuntimeMetricsItem,
  WorkflowMetricsItem,
} from '../models/models'
import {COLUMNS} from '../../../common/constants/constants'
import {Utils} from '../../../common/utils/utils'

export interface IPerformanceService extends IMetricsService {}

export class PerformanceService extends MetricsService implements IPerformanceService {
  public static override serviceId = 'IOrgPerformanceService'
  protected readonly columns = new ObservableArray<Column<MetricsItem>>([])
  protected readonly filterProviders = new ObservableArray<FilterProvider>()
  protected readonly cardData = new ObservableArray<CardData | undefined>()
  protected readonly cardCount = 4

  protected columnConfig: Map<string, Array<Column<MetricsItem>>>

  constructor() {
    super()
    this.metricsView.value.requestType = RequestType.Performance
    this.setColumnConfig()
    this.init()
  }

  public override getServiceId(): string {
    return PerformanceService.serviceId
  }

  public override getColumns(): IObservableArray<Column<MetricsItem>> {
    return this.columns
  }

  public override getFilterProviders(): IObservableArray<FilterProvider> {
    return this.filterProviders
  }

  public override getDefaultOrderBy(): OrderBy {
    return {field: 'averageRunTime', direction: DEFAULT_ORDER_BY_DIRECTION}
  }

  protected setColumns(tab?: string) {
    this.setColumnsHelper(this.columnConfig, NON_SORtableColumns, tab)
  }

  protected setFilterProviders(tab?: string) {
    this.filterProviders.value = getPerformanceFilters(tab).filter(f => Utils.columnValidForScope(f.key, this.scope))
  }

  protected getCardHeading(key: string): CardHeading {
    const dateRange = GET_DATE_RANGE_LABEL(this.metricsView.value.dateRangeType!).toLowerCase()

    switch (key) {
      case 'average_job_run_time':
        return Utils.getCardHeading(
          LABELS.cardHeadings.averageRunTimeTitle,
          LABELS.cardHeadings.averageRunTimeDescription,
          dateRange,
          Utils.getDuration,
        )

      case 'average_job_queue_time':
        return Utils.getCardHeading(
          LABELS.cardHeadings.averageQueueTimeTitle,
          LABELS.cardHeadings.averageQueueTimeDescription,
          dateRange,
          Utils.getDuration,
        )
      case 'job_failure_rate':
        return Utils.getCardHeading(
          LABELS.cardHeadings.failureRateTitle,
          LABELS.cardHeadings.failureRateDescription,
          dateRange,
          Utils.getPercentage,
        )
      case 'total_failure_minutes':
        return Utils.getCardHeading(
          LABELS.cardHeadings.totalFailureMinutesTitle,
          LABELS.cardHeadings.totalFailureMinutesDescription,
          dateRange,
        )
      default:
        return {title: '', description: ''}
    }
  }

  protected setColumnConfig() {
    const isRepoLevelEnabled = this.payloadService.getFeatureFlag('actions_usage_metrics_repo')
    const tableColumns = new Map<string, Array<Column<MetricsItem>>>()

    const workflowTabColumns: Array<Column<WorkflowMetricsItem>> = [
      {
        id: COLUMNS.workflowFilePath,
        header: LABELS.workflow,
        width: 'growCollapse',
        renderCell: data => WorkflowCell(data.workflowFilePath, data.repository, ORG_NAME),
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.repository,
        header: LABELS.sourceRepository,
        width: 'growCollapse',
        renderCell: data => RepositoryCell(data.repository, isRepoLevelEnabled, RequestType.Performance),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.failureRate,
        header: LABELS.hasJobFailures,
        renderCell: data => PercentCell(data.failureRate),
        align: 'end',
        maxWidth: MEDIUM_COLUMN_WIDTH,
        minWidth: MEDIUM_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageRunTime,
        header: LABELS.avgRunTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageRunTime),
        maxWidth: MEDIUM_COLUMN_WIDTH,
        minWidth: MEDIUM_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.workflowExecutions,
        header: LABELS.workflowRuns,
        align: 'end',
        renderCell: data => NumberCell(data.workflowExecutions),
        maxWidth: MEDIUM_COLUMN_WIDTH,
        minWidth: MEDIUM_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.jobs,
        header: LABELS.jobs,
        renderCell: data => NumberCell(data.jobs?.count, data.jobs?.approximate),
        align: 'end',
        maxWidth: EXTRA_SMALL_COLUMN_WIDTH,
        minWidth: EXTRA_SMALL_COLUMN_WIDTH,
      },
    ]

    const jobsTabColumns: Array<Column<JobMetricsItem>> = [
      {
        id: COLUMNS.jobName,
        header: LABELS.job,
        width: 'growCollapse',
        renderCell: data => TextCell(data.jobName),
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.workflowFilePath,
        header: LABELS.workflow,
        width: 'growCollapse',
        renderCell: data => WorkflowCell(data.workflowFilePath, data.repository, ORG_NAME),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.repository,
        header: LABELS.sourceRepository,
        width: 'growCollapse',
        renderCell: data => RepositoryCell(data.repository, isRepoLevelEnabled, RequestType.Performance),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.failureRate,
        header: LABELS.failureRate,
        renderCell: data => PercentCell(data.failureRate),
        align: 'end',
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageRunTime,
        header: LABELS.avgRunTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageRunTime),
        maxWidth: MEDIUM_COLUMN_WIDTH,
        minWidth: MEDIUM_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageQueueTime,
        header: LABELS.avgQueueTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageQueueTime),
        maxWidth: MEDIUM_COLUMN_WIDTH,
        minWidth: MEDIUM_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.runnerType,
        header: LABELS.runnerType,
        renderCell: data => TextCell(data.runnerType),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.runnerRuntime,
        header: LABELS.runtimeOs,
        renderCell: data => TextCell(data.runnerRuntime),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.jobExecutions,
        header: LABELS.jobRuns,
        align: 'end',
        renderCell: data => NumberCell(data.jobExecutions),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
    ]

    const repoTabColumns: Array<Column<RepositoryMetricsItem>> = [
      {
        id: COLUMNS.repository,
        header: LABELS.sourceRepository,
        width: 'growCollapse',
        renderCell: data => RepositoryCell(data.repository, isRepoLevelEnabled, RequestType.Performance),
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.failureRate,
        header: LABELS.failureRate,
        renderCell: data => PercentCell(data.failureRate),
        align: 'end',
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageRunTime,
        header: LABELS.avgJobRunTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageRunTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageQueueTime,
        header: LABELS.avgJobQueueTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageQueueTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.jobExecutions,
        header: LABELS.jobRuns,
        align: 'end',
        renderCell: data => NumberCell(data.jobExecutions),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
    ]

    const runtimeTabColumns: Array<Column<RuntimeMetricsItem>> = [
      {
        id: COLUMNS.runnerRuntime,
        header: LABELS.runtimeOs,
        renderCell: data => TextCell(data.runnerRuntime),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.failureRate,
        header: LABELS.failureRate,
        renderCell: data => PercentCell(data.failureRate),
        align: 'end',
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageRunTime,
        header: LABELS.avgJobRunTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageRunTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageQueueTime,
        header: LABELS.avgJobQueueTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageQueueTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.jobExecutions,
        header: LABELS.jobRuns,
        align: 'end',
        renderCell: data => NumberCell(data.jobExecutions),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
    ]

    const runnerTabColumns: Array<Column<RunnerMetricsItem>> = [
      {
        id: COLUMNS.runnerType,
        header: LABELS.runnerType,
        renderCell: data => TextCell(data.runnerType),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.failureRate,
        header: LABELS.failureRate,
        renderCell: data => PercentCell(data.failureRate),
        align: 'end',
        minWidth: SMALL_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageRunTime,
        header: LABELS.avgJobRunTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageRunTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.averageQueueTime,
        header: LABELS.avgJobQueueTime,
        align: 'end',
        renderCell: data => DurationCell(data.averageQueueTime),
        maxWidth: LARGE_COLUMN_WIDTH,
        minWidth: LARGE_COLUMN_WIDTH,
      },
      {
        id: COLUMNS.jobExecutions,
        header: LABELS.jobRuns,
        align: 'end',
        renderCell: data => NumberCell(data.jobExecutions),
        maxWidth: SMALL_COLUMN_WIDTH,
        minWidth: SMALL_COLUMN_WIDTH,
      },
    ]

    tableColumns.set(TabType.Workflows, workflowTabColumns as Array<Column<MetricsItem>>)
    tableColumns.set(TabType.Jobs, jobsTabColumns as Array<Column<MetricsItem>>)
    tableColumns.set(TabType.Repositories, repoTabColumns as Array<Column<MetricsItem>>)
    tableColumns.set(TabType.Runtime, runtimeTabColumns as Array<Column<MetricsItem>>)
    tableColumns.set(TabType.RunnerType, runnerTabColumns as Array<Column<MetricsItem>>)

    this.columnConfig = tableColumns
  }
}

// /orgs/<org name>/actions/metrics/Performance => ['', orgs, <org name>, ...]
const ORG_NAME = ssrSafeLocation.pathname.split('/')[2] || ''
const LARGE_COLUMN_WIDTH = 225
const MEDIUM_COLUMN_WIDTH = 150
const SMALL_COLUMN_WIDTH = 125
const EXTRA_SMALL_COLUMN_WIDTH = 100
const NON_SORtableColumns = new Set<string>([COLUMNS.repository])
