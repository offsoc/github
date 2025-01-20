import {LABELS} from '../resources/labels'

export enum DateRangeType {
  Unkown = 'DATE_RANGE_TYPE_UNKNOWN',
  CurrentWeek = 'DATE_RANGE_TYPE_CURRENT_WEEK',
  CurrentMonth = 'DATE_RANGE_TYPE_LATEST_MONTH',
  LastMonth = 'DATE_RANGE_TYPE_PREVIOUS_MONTH',
  Last30Days = 'DATE_RANGE_TYPE_LAST_30_DAYS',
  Last90Days = 'DATE_RANGE_TYPE_LAST_90_DAYS',
  LastYear = 'DATE_RANGE_TYPE_LAST_YEAR',
}

export const GET_DATE_RANGE_LABEL = (dateRange: DateRangeType): string => {
  return DATE_RANGE_LABELS[dateRange] || LABELS.unknown
}

export enum OperatorType {
  Unknown = 'FILTER_OPERATOR_UNKNOWN',
  Equals = 'FILTER_OPERATOR_EQUALS',
  NotEquals = 'FILTER_OPERATOR_NOT_EQUALS',
  Contains = 'FILTER_OPERATOR_CONTAINS',
  GreaterThan = 'FILTER_OPERATOR_GREATER_THAN',
  LessThan = 'FILTER_OPERATOR_LESS_THAN',
  GreaterEqualTo = 'FILTER_OPERATOR_GREATER_THAN_OR_EQUAL',
  LessEqualTo = 'FILTER_OPERATOR_LESS_THAN_OR_EQUAL',
  Between = 'FILTER_OPERATOR_BETWEEN',
}

export enum ZeroDataType {
  None,
  Start,
  Search,
}

export enum TabType {
  Workflows = 'workflows',
  Jobs = 'jobs',
  Repositories = 'repositories',
  Runtime = 'runtime',
  RunnerType = 'runner',
}

const DATE_RANGE_LABELS: {[key: string]: string} = {
  [DateRangeType.CurrentWeek]: LABELS.dateRangeTypes.currentWeek,
  [DateRangeType.CurrentMonth]: LABELS.dateRangeTypes.currentMonth,
  [DateRangeType.LastMonth]: LABELS.dateRangeTypes.lastMonth,
  [DateRangeType.Last30Days]: LABELS.dateRangeTypes.last30Days,
  [DateRangeType.Last90Days]: LABELS.dateRangeTypes.last90Days,
  [DateRangeType.LastYear]: LABELS.dateRangeTypes.lastYear,
}

export enum ExportStatus {
  EXPORT_STATUS_UNKNOWN = 'EXPORT_STATUS_UNKNOWN',
  EXPORT_STATUS_PENDING = 'EXPORT_STATUS_PENDING',
  EXPORT_STATUS_COMPLETE = 'EXPORT_STATUS_COMPLETE',
  EXPORT_STATUS_FAILED = 'EXPORT_STATUS_FAILED',
}

export enum OrderByDirection {
  ORDER_BY_DIRECTION_UNKNOWN = 'ORDER_BY_DIRECTION_UNKNOWN',
  ORDER_BY_DIRECTION_ASC = 'ORDER_BY_DIRECTION_ASC',
  ORDER_BY_DIRECTION_DESC = 'ORDER_BY_DIRECTION_DESC',
}

export enum RequestType {
  Unknown = 'REQUEST_TYPE_UNKNOWN',
  Usage = 'REQUEST_TYPE_USAGE',
  Performance = 'REQUEST_TYPE_PERFORMANCE',
}

export enum ScopeType {
  Unknown = 'SCOPE_TYPE_UNKNOWN',
  Org = 'SCOPE_TYPE_ORG',
  Repo = 'SCOPE_TYPE_REPO',
}

export const GET_SCOPE_TYPE = (scope?: string): ScopeType => {
  if (scope === ScopeType.Org) {
    return ScopeType.Org
  }

  if (scope === ScopeType.Repo) {
    return ScopeType.Repo
  }

  return ScopeType.Unknown
}
