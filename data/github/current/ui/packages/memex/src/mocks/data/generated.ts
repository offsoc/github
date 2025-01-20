import {randBetweenDate, randPhrase, seed as falsoSeed} from '@ngneat/falso'
import {eachDayOfInterval, subDays} from 'date-fns'
import seedrandom from 'seedrandom'

import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {
  DraftIssueTitleColumnData,
  IssueTitleColumnData,
  MemexColumnData,
  PullRequestTitleColumnData,
} from '../../client/api/columns/contracts/storage'
import type {IssueTitleValue, PullRequestTitleValue} from '../../client/api/columns/contracts/title'
import {IssueState, IssueStateReason, PullRequestState} from '../../client/api/common-contracts'
import type {DraftIssue, Issue, MemexItem, PullRequest} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {mockIssueTypes} from './issue-types'
import {mockLabels} from './labels'
import {MilestonesByRepository} from './milestones'
import {getNextId} from './mock-ids'
import {mockParentIssues} from './parent-issues'
import {mockPublicRepo} from './repositories'
import {mockUsers} from './users'

/**
 * We use this specialized pseudo-random number generator instead of
 * `Math.random` so that we can control the random number seed (and, as a
 * result, make it possible to get the same behaviour out of methods in this
 * module with repeated invocations). This is not possible with plain
 * `Math.random`: https://stackoverflow.com/a/521323.
 */
let random = seedrandom()

/**
 * Generates a set of items with randomized data in each of the given columns.
 *
 * @param options An object used to configure item generation. The `count` key
 *   says how many items to generate, `columns` says which columns to generate
 *   data for, and `seed` provides a way to seed the pseudo-random number
 *   generator so that this function returns the same results on successive
 *   invocations.
 * @returns MemexItem[]
 */
export const generateItems = ({
  count,
  columns,
  seed,
  includeEmpty,
}: {
  count: number
  columns: Array<MemexColumn>
  seed?: number
  includeEmpty?: boolean
}) => {
  if (seed) {
    random = seedrandom(`${seed}`)
    falsoSeed(seed.toString())
  }

  const items: Array<MemexItem> = []

  for (let i = 0; i < count; i++) {
    // Select between one of 7 different types of item to generate.
    const choice = randomIntInclusive(1, 7)

    switch (choice) {
      case 1:
        items.push(generateDraftIssue(columns, includeEmpty))
        break
      case 2:
        items.push(generateIssue({state: IssueState.Open, columns}, includeEmpty))
        break
      case 3:
        items.push(generateIssue({state: IssueState.Closed, columns}, includeEmpty))
        break
      case 4:
        items.push(
          generateIssue({state: IssueState.Closed, stateReason: IssueStateReason.NotPlanned, columns}, includeEmpty),
        )
        break
      case 5:
        items.push(generatePullRequest(PullRequestState.Open, false, columns, undefined, includeEmpty))
        break
      case 6:
        items.push(generatePullRequest(PullRequestState.Closed, false, columns, undefined, includeEmpty))
        break
      case 7:
        items.push(generatePullRequest(PullRequestState.Merged, false, columns, undefined, includeEmpty))
        break
    }
  }

  return items
}

const generateDraftIssue = (columns: Array<MemexColumn>, includeEmpty?: boolean): DraftIssue => {
  const id = getNextId()

  const columnValues = columns.reduce(
    (memo, column) => {
      switch (column.dataType) {
        case MemexColumnDataType.Title: {
          const title = arbitraryText()
          memo.push({
            memexProjectColumnId: SystemColumnId.Title,
            value: {
              title: {
                raw: title,
                html: title,
              },
            },
          })
          break
        }
        case MemexColumnDataType.Text:
        case MemexColumnDataType.Number:
        case MemexColumnDataType.Date:
        case MemexColumnDataType.SingleSelect:
          memo.push({
            memexProjectColumnId: column.id,
            value: getArbitraryNonTitleColumnValue(column, includeEmpty),
          } as MemexColumnData)
          break
        default:
      }

      return memo
    },
    [] as Array<MemexColumnData | DraftIssueTitleColumnData>,
  )

  return {
    id,
    contentType: ItemType.DraftIssue,
    content: {
      id,
    },
    priority: getNextId(),
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: columnValues,
  }
}

const generateIssue = (
  {
    state,
    columns,
    stateReason = undefined,
    issueCreatedAt,
    issueClosedAt,
  }: {
    state: IssueState
    columns: Array<MemexColumn>
    stateReason?: IssueStateReason
    issueCreatedAt?: string
    issueClosedAt?: string
  },
  includeEmpty?: boolean,
): Issue => {
  const id = getNextId()
  const number = getNextId()

  const columnValues = columns.reduce(
    (memo, column) => {
      switch (column.dataType) {
        case MemexColumnDataType.Title:
          memo.push({
            memexProjectColumnId: SystemColumnId.Title,
            value: getArbitraryIssueTitle({number, state, stateReason}),
          })
          break
        default:
          memo.push({
            memexProjectColumnId: column.id,
            value: getArbitraryNonTitleColumnValue(column, includeEmpty),
          } as MemexColumnData)
      }

      return memo
    },
    [] as Array<MemexColumnData | IssueTitleColumnData>,
  )

  return {
    id,
    contentType: ItemType.Issue,
    content: {
      id,
      globalRelayId: '',
      url: `https://github.com/github/memex/issues/${number}`,
    },
    contentRepositoryId: mockPublicRepo.id,
    priority: getNextId(),
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: columnValues,
    state,
    stateReason,
    issueCreatedAt,
    issueClosedAt,
  }
}

const generatePullRequest = (
  state: PullRequestState,
  isDraft: boolean,
  columns: Array<MemexColumn>,
  options?: {
    issueCreatedAt?: string
    issueClosedAt?: string
  },
  includeEmpty?: boolean,
): PullRequest => {
  const id = getNextId()
  const number = getNextId()

  const columnValues = columns.reduce(
    (memo, column) => {
      switch (column.dataType) {
        case MemexColumnDataType.Title:
          memo.push({
            memexProjectColumnId: SystemColumnId.Title,
            value: getArbitraryPullRequestTitle(number, state, isDraft),
          })
          break
        default:
          memo.push({
            memexProjectColumnId: column.id,
            value: getArbitraryNonTitleColumnValue(column, includeEmpty),
          } as MemexColumnData)
      }

      return memo
    },
    [] as Array<MemexColumnData | PullRequestTitleColumnData>,
  )

  return {
    id,
    contentType: ItemType.PullRequest,
    content: {
      id,
      url: `https://github.com/github/memex/pull/${number}`,
    },
    contentRepositoryId: mockPublicRepo.id,
    priority: getNextId(),
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: columnValues,
    issueCreatedAt: options?.issueCreatedAt,
    issueClosedAt: options?.issueClosedAt,
  }
}

const getArbitraryNonTitleColumnValue = (column: MemexColumn, includeEmpty?: boolean): MemexColumnData['value'] => {
  if (includeEmpty && column.dataType !== MemexColumnDataType.Repository) {
    const noValue = randomIntInclusive(1, 10)
    if (noValue === 1) {
      return null
    }
  }
  switch (column.dataType) {
    case MemexColumnDataType.Assignees:
      return sample(mockUsers, randomIntInclusive(1, 3))
    case MemexColumnDataType.Labels:
      return sample(mockLabels, randomIntInclusive(1, 3))
    case MemexColumnDataType.LinkedPullRequests:
      return []
    case MemexColumnDataType.Tracks: {
      const total = randomIntInclusive(1, 10)
      const completed = Math.ceil(total * random())
      const percent = Math.floor((completed / total) * 100)
      return {total, completed, percent}
    }
    case MemexColumnDataType.TrackedBy: {
      return []
    }
    case MemexColumnDataType.ParentIssue: {
      return not_typesafe_nonNullAssertion(sample(mockParentIssues)[0])
    }
    case MemexColumnDataType.IssueType:
      return not_typesafe_nonNullAssertion(sample(mockIssueTypes)[0])
    case MemexColumnDataType.Repository:
      return {...mockPublicRepo}
    case MemexColumnDataType.Reviewers:
      return []
    case MemexColumnDataType.Milestone: {
      const milestones = MilestonesByRepository.get(mockPublicRepo.id)
      if (!milestones) {
        throw new Error(
          `No milestones listed for repository ${mockPublicRepo.id} - you should add some to the mock data`,
        )
      }
      return not_typesafe_nonNullAssertion(sample(milestones)[0])
    }
    case MemexColumnDataType.Text: {
      const text = arbitraryText()
      return {raw: text, html: text}
    }
    case MemexColumnDataType.Number:
      return {value: randomIntInclusive(1, 1000000)}
    case MemexColumnDataType.Date:
      return {value: randBetweenDate({from: new Date('2021-01-01'), to: new Date('2021-12-31')}).toISOString()}
    case MemexColumnDataType.SingleSelect:
      return {id: not_typesafe_nonNullAssertion(sample(not_typesafe_nonNullAssertion(column.settings?.options))[0]).id}
    default:
      throw new Error(`could not generate value for ${column.dataType} column`)
  }
}

const arbitraryText = () => randPhrase()

const getArbitraryIssueTitle = ({
  number,
  state,
  stateReason,
}: {
  number: number
  state: IssueState
  stateReason?: IssueStateReason
}): IssueTitleValue => {
  const text = arbitraryText()

  return {
    state,
    stateReason,
    number,
    issueId: 24535353,
    title: {
      raw: text,
      html: text,
    },
  }
}

const getArbitraryPullRequestTitle = (
  number: number,
  state: PullRequestState,
  isDraft: boolean,
): PullRequestTitleValue => {
  const text = arbitraryText()

  return {
    state,
    number,
    isDraft,
    issueId: 24535353,
    title: {
      raw: text,
      html: text,
    },
  }
}

const randomIntInclusive = (lowerBound: number, upperBound: number) => {
  // Reference implementation: https://tinyurl.com/yxsnxyj7

  const min = Math.ceil(lowerBound)
  const max = Math.floor(upperBound)
  return Math.floor(random() * (max - min + 1) + min)
}

const sample = <T>(choices: Array<T>, n = 1) => {
  // Reference implementation: https://stackoverflow.com/a/11935263

  const shuffled = choices.slice(0)
  let i = choices.length
  let temp: T | undefined
  let index = choices.length - 1

  while (i--) {
    index = Math.floor((i + 1) * random())
    temp = shuffled[index]
    shuffled[index] = not_typesafe_nonNullAssertion(shuffled[i])
    shuffled[i] = not_typesafe_nonNullAssertion(temp)
  }

  return shuffled.slice(0, n)
}

// This function generates mock historical insights data going back 180 days
export const generateLeanHistoricalInsightsData = ({columns}: {columns: Array<MemexColumn>}, now = new Date()) => {
  const items: Array<MemexItem> = []

  let i = 1

  const dates = eachDayOfInterval({
    start: subDays(now, 180),
    end: now,
  })

  for (const date of dates) {
    const numberOfItems = randomIntInclusive(5, 10)
    // create an issue that was created 14 days ago and closed today
    for (let n = 0; n < numberOfItems; n++) {
      if (i % 2 === 0) {
        items.push(
          generateIssue({
            state: IssueState.Closed,
            // make every other issue closed as not planned
            stateReason: i % 5 === 0 ? IssueStateReason.NotPlanned : undefined,
            columns,
            issueCreatedAt: subDays(date, randomIntInclusive(0, 10)).toISOString(),
            issueClosedAt: date.toISOString(),
          }),
        )
      } else {
        items.push(
          generatePullRequest(PullRequestState.Closed, false, columns, {
            issueCreatedAt: subDays(date, randomIntInclusive(0, 10)).toISOString(),
            issueClosedAt: date.toISOString(),
          }),
        )
      }
    }

    i++
  }

  return items
}
