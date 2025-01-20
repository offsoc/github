export interface RawWeek {
  c: number // commits
  a: number // additions
  d: number // deletions
  w: number // timestamp / 1000
}

export interface Week {
  commits: number
  additions: number
  deletions: number
  week: number
  date: Date
}

export type Author = {
  id: number
  login: string
  avatar: string
  path: string
  hovercard_url: string
}

export interface RawContributor {
  author: Author
  total: number
  weeks: RawWeek[]
}

export interface Contributor {
  author: Author
  totals: Totals
  metrics: SummarizedCommitMetrics
  weeks: Week[]
}

export type Metric = 'commits' | 'additions' | 'deletions'

export type Totals = {
  commits: number
  additions: number
  deletions: number
}

type SummarizedMetric = [number, number]
export type SummarizedCommitMetrics = {
  commits: SummarizedMetric[]
  additions?: SummarizedMetric[]
  deletions?: SummarizedMetric[]
}

export type Axis = {
  min: number
  max: number
  floor: number
  ceiling: number
}
