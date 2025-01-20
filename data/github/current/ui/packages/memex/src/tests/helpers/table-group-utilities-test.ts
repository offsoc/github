import {MemexColumnDataType} from '../../client/api/columns/contracts/memex-column'
import type {FieldGrouping} from '../../client/features/grouping/types'
import {shouldDisableGroupFooter} from '../../client/helpers/table-group-utilities'

jest.mock('../../client/helpers/feature-flags')

describe('shouldDisableGroupFooter', () => {
  it('returns false for empty groups', () => {
    const emptyGroup: FieldGrouping = {
      dataType: MemexColumnDataType.Iteration,
      kind: 'empty',
      value: {
        titleHtml: 'No Sprint',
        columnId: 24242,
      },
    }
    expect(shouldDisableGroupFooter(emptyGroup)).toBeFalsy()
  })

  it('returns false for repository groups', () => {
    const repositoryGroup: FieldGrouping = {
      dataType: MemexColumnDataType.Repository,
      kind: 'group',
      value: {
        id: 2424242,
        name: 'memex',
        nameWithOwner: 'github/memex',
        isArchived: false,
        isPublic: false,
        isForked: false,
        hasIssues: true,
        url: 'https://github.com/github/memex',
      },
    }
    expect(shouldDisableGroupFooter(repositoryGroup)).toBeFalsy()
  })

  it('returns false for assignees groups', () => {
    const assigneesGroup: FieldGrouping = {
      dataType: MemexColumnDataType.Assignees,
      kind: 'group',
      value: [
        {
          id: 2424242,
          global_relay_id: 'MDQ6VXNlcjY0MTUxNDQ=',
          login: 'abigailychen',
          name: 'Abigail',
          avatarUrl: 'https://github.com/abigailychen.png',
          isSpammy: false,
        },
      ],
    }
    expect(shouldDisableGroupFooter(assigneesGroup)).toBeFalsy()
  })
})
