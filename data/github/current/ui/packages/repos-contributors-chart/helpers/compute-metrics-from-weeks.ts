import type {Week, Totals, SummarizedCommitMetrics} from '../repos-contributors-chart-types'

export function computeMetricsFromWeeks(weeks: Week[]): {
  totals: Totals
  metrics: SummarizedCommitMetrics
} {
  if (weeks.length === 0) {
    return {
      metrics: {
        commits: [],
        additions: [],
        deletions: [],
      },
      totals: {
        commits: 0,
        additions: 0,
        deletions: 0,
      },
    }
  }
  const metrics: SummarizedCommitMetrics = {
    commits: weeks.map(({week, commits}) => [week, commits]),
    additions: weeks.map(({week, additions}) => [week, additions]),
    deletions: weeks.map(({week, deletions}) => [week, deletions]),
  }

  return {
    metrics,
    totals: {
      additions: metrics.additions?.reduce((acc, [, a]) => acc + a, 0) || 0,
      deletions: metrics.deletions?.reduce((acc, [, d]) => acc + d, 0) || 0,
      commits: metrics.commits?.reduce((acc, [, c]) => acc + c, 0) || 0,
    },
  }
}
