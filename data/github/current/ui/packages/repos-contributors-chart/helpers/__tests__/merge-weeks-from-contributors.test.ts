import {mergeWeeksFromContributors} from '../merge-weeks-from-contributors'

test('returns [] if given []', () => {
  expect(mergeWeeksFromContributors([])).toStrictEqual([])
})

test('returns 2 weeks of data if given 1 where the 1st week is a mock of the week before', () => {
  const week = new Date().getTime() / 1000
  const previousWeek = week - 7 * 24 * 60 * 60
  expect(
    mergeWeeksFromContributors([
      {
        weeks: [
          {
            c: 1,
            a: 1,
            d: 1,
            w: week,
          },
        ],
      },
      {
        weeks: [
          {
            c: 1,
            a: 1,
            d: 1,
            w: week,
          },
        ],
      },
    ]),
  ).toStrictEqual([
    {
      commits: 0,
      additions: 0,
      deletions: 0,
      week: previousWeek * 1000,
      date: new Date(previousWeek * 1000),
    },
    {
      commits: 2,
      additions: 2,
      deletions: 2,
      week: week * 1000,
      date: new Date(week * 1000),
    },
  ])
})

test('returns 2 for each stat if given 2 weeks of status that are each 1', () => {
  const firstWeek = new Date().getTime() / 1000
  const secondWeek = firstWeek + 1
  expect(
    mergeWeeksFromContributors([
      {
        weeks: [
          {
            c: 1,
            a: 1,
            d: 1,
            w: firstWeek,
          },
          {
            c: 1,
            a: 1,
            d: 1,
            w: secondWeek,
          },
        ],
      },
      {
        weeks: [
          {
            c: 1,
            a: 1,
            d: 1,
            w: firstWeek,
          },
          {
            c: 1,
            a: 1,
            d: 1,
            w: secondWeek,
          },
        ],
      },
    ]),
  ).toStrictEqual([
    {
      commits: 2,
      additions: 2,
      deletions: 2,
      week: firstWeek * 1000,
      date: new Date(firstWeek * 1000),
    },
    {
      commits: 2,
      additions: 2,
      deletions: 2,
      week: secondWeek * 1000,
      date: new Date(secondWeek * 1000),
    },
  ])
})
