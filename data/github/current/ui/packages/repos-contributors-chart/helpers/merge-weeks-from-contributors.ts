import type {RawContributor, Week} from '../repos-contributors-chart-types'
import {transformWeeks} from './transform-weeks'

export function mergeWeeksFromContributors(contributors: Array<Pick<RawContributor, 'weeks'>>): Week[] {
  const contributorWeeks = contributors.map(contributor => contributor.weeks)
  return contributorWeeks.map(transformWeeks).reduce<Week[]>(
    (acc, weeks) =>
      weeks.map((week, index) => ({
        ...week,
        commits: week.commits + (acc[index]?.commits || 0),
        additions: week.additions + (acc[index]?.additions || 0),
        deletions: week.deletions + (acc[index]?.deletions || 0),
      })),
    [],
  )
}
