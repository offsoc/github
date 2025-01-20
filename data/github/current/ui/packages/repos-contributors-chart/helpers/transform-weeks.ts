import type {RawWeek, Week} from '../repos-contributors-chart-types'

export function transformWeeks(weeks: RawWeek[]): Week[] {
  if (weeks.length === 0) {
    return []
  }
  let _weeks = weeks
  if (_weeks.length === 1) {
    _weeks = [
      {
        c: 0,
        a: 0,
        d: 0,
        w: (_weeks[0]?.w || 0) - 7 * 24 * 60 * 60,
      },
      ..._weeks,
    ]
  }
  return _weeks.map(transformWeek)
}

export function transformWeek(week: RawWeek): Week {
  return {
    commits: week.c,
    additions: week.a,
    deletions: week.d,
    week: week.w * 1000,
    date: new Date(week.w * 1000),
  }
}
