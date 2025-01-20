import type {Iteration} from '../../../../client/api/columns/contracts/iteration'
import {
  type MemexColumn,
  MemexColumnDataType,
  SystemColumnId,
} from '../../../../client/api/columns/contracts/memex-column'
import {PullRequestState} from '../../../../client/api/common-contracts'
import type {Issue, MemexItem, PullRequest} from '../../../../client/api/memex-items/contracts'
import {ItemType} from '../../../../client/api/memex-items/item-type'
import {
  type FilterOptions,
  filtersToQuery,
  insertFilterIntoQuery,
  matchesFilter,
  matchesFreeText,
  matchesLastUpdated,
  matchMetaProps,
  normalizeToFilterName,
  normalizeToLowercaseFieldName,
  parseFullTextQuery,
  removeFilterFromQuery,
  replaceQuery,
  splitFieldFilters,
} from '../../../../client/components/filter-bar/helpers/search-filter'
import {type ColumnModel, createColumnModel} from '../../../../client/models/column-model'
import {createMemexItemModel} from '../../../../client/models/memex-item-model'
import {
  CustomDateColumnId,
  customIterationColumn,
  CustomIterationColumnId,
  CustomNumberColumnId,
  CustomSingleSelectColumnId,
  CustomTextColumnId,
  parentIssueColumn,
  trackedByColumn,
  tracksColumn,
} from '../../../../mocks/data/columns'
import {aardvarkOptions} from '../../../../mocks/data/single-select'
import {
  DefaultClosedIssue,
  DefaultClosedPullRequest,
  DefaultDraftIssue,
  DefaultDraftPullRequest,
  DefaultMergedPullRequest,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultSubIssue,
  DefaultTrackedByIssue,
  IssueInPublicRepositoryWithCustomColumns,
  IssueWithAFixedAssignee,
  IssueWithAssigneeMatt,
  IssueWithDueDate,
  IssueWithoutDueDate,
  OverflowingClosedIssue,
  PullRequestWithReviewerMatt,
} from '../../../../mocks/memex-items'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'

const itemWithIterationValue = (iterationId: string): MemexItem => {
  const newItem = DefaultClosedIssue
  newItem.memexProjectColumnValues.push({memexProjectColumnId: CustomIterationColumnId, value: {id: iterationId}})
  return newItem
}

describe('matchesFreeText', () => {
  it('when no query tokens found, any item matches', () => {
    const item = createMemexItemModel(DefaultOpenIssue)

    expect(matchesFreeText(item.columns, [], [])).toBeTruthy()
  })

  it('searches in the title column', () => {
    const titleColumn = {
      dataType: MemexColumnDataType.Title,
      id: SystemColumnId.Title,
      databaseId: 1,
      name: 'Title',
      position: 1,
      userDefined: false,
      defaultColumn: true,
    }

    const item = createMemexItemModel(DefaultOpenIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(titleColumn)]
    const query = 'Fix this issue'.toLocaleLowerCase().split(' ')

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })

  it('searches in the assignees column', () => {
    const assigneesColumn = assigneeColumnFixture()
    const item = createMemexItemModel(IssueWithAFixedAssignee)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(assigneesColumn)]
    const query = 'marcey'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in a singleSelect column', () => {
    const customSingleSelectColumn = {
      dataType: MemexColumnDataType.SingleSelect,
      id: CustomSingleSelectColumnId,
      databaseId: 3,
      name: 'Aardvarks',
      position: 3,
      userDefined: true,
      defaultColumn: true,
      settings: {options: aardvarkOptions},
    }

    const item = createMemexItemModel(IssueInPublicRepositoryWithCustomColumns)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(customSingleSelectColumn)]
    const query = 'aric'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in an iteration column', () => {
    const item = createMemexItemModel(itemWithIterationValue('iteration-4'))

    const visibleColumns: Array<ColumnModel> = [createColumnModel(customIterationColumn)]
    const query = 'iteration 4'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in the labels column', () => {
    const item = createMemexItemModel(DefaultClosedIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(labelsColumnFixture())]
    const query = ['tech', 'debt']

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })

  it('searches in the labels column using emoji', () => {
    const item = createMemexItemModel(DefaultClosedIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(labelsColumnFixture())]
    const query = ['enhancement', '✨']

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })

  it('searches in the repository column', () => {
    const repositoryColumn = {
      dataType: MemexColumnDataType.Repository,
      id: SystemColumnId.Repository,
      databaseId: 5,
      name: 'Repository',
      position: 5,
      userDefined: false,
      defaultColumn: true,
    }

    const item = createMemexItemModel(DefaultClosedIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(repositoryColumn)]
    const query = 'memex'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in the milestone column', () => {
    const milestoneColumn = {
      dataType: MemexColumnDataType.Milestone,
      id: SystemColumnId.Milestone,
      databaseId: 6,
      name: 'Milestone',
      position: 6,
      userDefined: false,
      defaultColumn: true,
    }

    const item = createMemexItemModel(DefaultClosedIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(milestoneColumn)]
    const query = 'Prioritized Lists'.toLocaleLowerCase().split(' ')

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })

  it('searches in a text column', () => {
    const textColumn = {
      dataType: MemexColumnDataType.Text,
      id: CustomTextColumnId,
      databaseId: 7,
      name: 'Custom Text',
      position: 7,
      userDefined: true,
      defaultColumn: true,
    }

    const item = createMemexItemModel(OverflowingClosedIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(textColumn)]
    const query = 'really, really long custom text'.split(' ')

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })

  it('searches in a number column', () => {
    const numberColumn = numberColumnFixture()

    const item = createMemexItemModel(DefaultOpenIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(numberColumn)]
    const query = '1'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in a date column', () => {
    const dateColumn = dateColumnFixture()
    const item = createMemexItemModel(IssueWithDueDate)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(dateColumn)]
    const query = '2021'

    expect(matchesFreeText(item.columns, visibleColumns, [query])).toBeTruthy()
  })

  it('searches in the tracked by column', () => {
    const item = createMemexItemModel(DefaultTrackedByIssue)
    const visibleColumns: Array<ColumnModel> = [createColumnModel(trackedByColumnFixture())]
    const query = ['#335']

    expect(matchesFreeText(item.columns, visibleColumns, query)).toBeTruthy()
  })
})

describe('matchesFilter', () => {
  describe('focused filtering', () => {
    it('search in the title field with or without a number', () => {
      const item = createMemexItemModel(DefaultOpenIssue)

      const visibleColumn = createColumnModel({
        dataType: MemexColumnDataType.Title,
        id: SystemColumnId.Title,
        databaseId: 1,
        name: 'Title',
        position: 1,
        userDefined: false,
        defaultColumn: true,
      })

      expect(matchesFilter({columnData: item.columns, column: visibleColumn, values: ['Fix this issue']})).toBeFalsy()
      expect(
        matchesFilter({columnData: item.columns, column: visibleColumn, values: ['Fix this `issue` please!']}),
      ).toBeTruthy()
      expect(
        matchesFilter({columnData: item.columns, column: visibleColumn, values: ['Fix this `issue` please! #3']}),
      ).toBeTruthy()
      expect(
        matchesFilter({columnData: item.columns, column: visibleColumn, values: ['fIx ThIs `IsSuE` PlEaSe! #3']}),
      ).toBeTruthy()
      expect(
        matchesFilter({columnData: item.columns, column: visibleColumn, values: ['Fix this `issue`*']}),
      ).toBeTruthy()
    })
    it('searches in the labels column', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(labelsColumnFixture())
      const query = ['tech debt']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('searches in the labels column using emoji', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(labelsColumnFixture())
      const query = ['enhancement ✨']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('returns a match only if exact match found', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(labelsColumnFixture())
      const query = ['tech de']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeFalsy()
    })

    it('returns a match if wildcard match found', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(labelsColumnFixture())

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: ['tech de*']})).toBeTruthy()
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: ['*ch debt']})).toBeTruthy()
    })

    it.each`
      input                               | expected
      ${['handle']}                       | ${false}
      ${['*handle*']}                     | ${true}
      ${['/$handle (re*']}                | ${true}
      ${['/$handle (regex) characters/']} | ${true}
    `(
      'properly handles regex character escapes when using wildcards case: $case expected: toBe($expected)',
      ({input, expected}: {input: Array<string>; expected: string}) => {
        const item = createMemexItemModel({
          id: 2,
          contentType: ItemType.Issue,
          content: {
            id: 2,
            url: 'https://github.com/github/memex/issues/336',
            globalRelayId: '',
          },
          contentRepositoryId: 1,
          priority: 1,
          updatedAt: '2022-03-01T00:00:00Z',
          memexProjectColumnValues: [
            {
              memexProjectColumnId: SystemColumnId.Labels,
              value: [
                {
                  id: 2,
                  name: '/$handle (regex) characters/',
                  nameHtml: '/$handle (regex) characters/',
                  color: 'red',
                  url: 'fake-rul',
                },
              ],
            },
          ],
        })
        const testColumn = createColumnModel(labelsColumnFixture())

        expect(matchesFilter({columnData: item.columns, column: testColumn, values: input})).toBe(expected)
      },
    )

    it('ignores whitespace in column values when matching filters', () => {
      const textColumn = {
        dataType: MemexColumnDataType.Text,
        id: CustomTextColumnId,
        databaseId: 7,
        name: 'Custom Text',
        position: 7,
        userDefined: true,
        defaultColumn: true,
      }

      const itemWithWhitespaceValues = {
        ...DefaultClosedIssue,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: CustomTextColumnId,
            value: {
              raw: 'tech debt ',
              html: 'tech debt ',
            },
          },
        ],
      }

      const item = createMemexItemModel(itemWithWhitespaceValues)
      const testColumn = createColumnModel(textColumn)
      const query = ['tech debt']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })
  })

  describe('number filtering', () => {
    it('handles >', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['>9']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles >=', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['>=9']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['>=10']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles <', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['<11']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles <=', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['<=10']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['<=11']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles ..', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['9..11']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles ..*', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['9..*']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['10..*']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles *..', () => {
      const item = createMemexItemModel(DefaultClosedIssue)
      const testColumn = createColumnModel(numberColumnFixture())
      const query = ['*..11']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['*..10']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })
  })

  describe('date filtering', () => {
    jest.useFakeTimers()

    it('searches in a date column', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['2021-04-23']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('does not match against no date', () => {
      const item = createMemexItemModel(IssueWithoutDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['2021-04-23']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeFalsy()
    })

    it('handles >', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['>2021-04-22']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles >=', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['>=2021-04-22']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['>=2021-04-23']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles <', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['<2021-04-24']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles <=', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['<=2021-04-24']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['<=2021-04-23']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles ..', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['2021-04-22..2021-04-24']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('handles ..*', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['2021-04-22..*']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['2021-04-23..*']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles *..', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())
      const query = ['*..2021-04-24']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
      const query2 = ['*..2021-04-23']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query2})).toBeTruthy()
    })

    it('handles @today as a special date value', () => {
      // note: expected due date is 2021-04-23
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())

      // yesterday - 2021-04-22
      const yesterday = new Date(2021, 3, 22)
      jest.setSystemTime(yesterday)
      expect(matchesFilter({values: ['@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['>=@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['<=@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['>@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['<@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..*'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['*..@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['..@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..2021-11-11'], columnData: item.columns, column: testColumn})).toEqual(
        true,
      )
      expect(matchesFilter({values: ['2021-01-01..@today'], columnData: item.columns, column: testColumn})).toEqual(
        false,
      )

      // "today" - 2021-04-23 (same as due date)
      const today = new Date(2021, 3, 23)
      jest.setSystemTime(today)
      expect(matchesFilter({values: ['@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['>=@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['<=@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['>@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['<@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..*'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['*..@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today..'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['..@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today..2021-11-11'], columnData: item.columns, column: testColumn})).toEqual(
        true,
      )
      expect(matchesFilter({values: ['2021-01-01..@today'], columnData: item.columns, column: testColumn})).toEqual(
        true,
      )

      // tomorrow - 2021-04-24
      const tomorrow = new Date(2021, 3, 24)
      jest.setSystemTime(tomorrow)
      expect(matchesFilter({values: ['@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['>=@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['<=@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['>@today'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['<@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today..*'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['*..@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today..'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['..@today'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today..2021-11-11'], columnData: item.columns, column: testColumn})).toEqual(
        false,
      )
      expect(matchesFilter({values: ['2021-01-01..@today'], columnData: item.columns, column: testColumn})).toEqual(
        true,
      )
    })

    it('allows numbers to be added/subtracted from @today', () => {
      // note: expected due date is 2021-04-23
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())

      // yesterday - 2021-04-22
      jest.setSystemTime(new Date(2021, 3, 22))
      expect(matchesFilter({values: ['@today+1'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today-1'], columnData: item.columns, column: testColumn})).toEqual(false)

      // today - 2021-04-23
      jest.setSystemTime(new Date(2021, 3, 23))
      expect(matchesFilter({values: ['@today+1'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today-1'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today+0'], columnData: item.columns, column: testColumn})).toEqual(true)
      expect(matchesFilter({values: ['@today-0'], columnData: item.columns, column: testColumn})).toEqual(true)

      // tomorrow - 2021-04-24
      jest.setSystemTime(new Date(2021, 3, 24))
      expect(matchesFilter({values: ['@today+1'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today-1'], columnData: item.columns, column: testColumn})).toEqual(true)
    })

    it('handles invalid dates gracefully', () => {
      const item = createMemexItemModel(IssueWithDueDate)
      const testColumn = createColumnModel(dateColumnFixture())

      jest.setSystemTime(new Date('2021-04-23'))

      expect(matchesFilter({values: [''], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['abcd'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['0000-01-22'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['01-01-2022'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..abcd'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today..00-01-22'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['..0000-01-22'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['abcd..'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['abcd..*'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['*..abcd'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['..abcd'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today+abc'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@todayy'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today+-0'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today-+0'], columnData: item.columns, column: testColumn})).toEqual(false)
      expect(matchesFilter({values: ['@today++000'], columnData: item.columns, column: testColumn})).toEqual(false)
    })
  })

  describe('progress filtering', () => {
    const item = createMemexItemModel(DefaultOpenIssue)

    const filterProps = {
      item,
      column: createColumnModel(tracksColumn),
      columnData: item.columns,
    }
    const baseExpectMatchesFilter = (values: Array<string>) => matchesFilter({...filterProps, values})

    const expectMatchesFilter = (...values: Array<string>) => expect(baseExpectMatchesFilter(values)).toBeTruthy()
    const expectNotMatchesFilter = (...values: Array<string>) =>
      expect(baseExpectMatchesFilter(values)).not.toBeTruthy()

    it('requires % values', () => {
      expectNotMatchesFilter('64')
      expectMatchesFilter('64%')
    })

    it('handles >', () => expectMatchesFilter('>60%'))

    it('handles >=', () => {
      expectMatchesFilter('>=60%')
      expectMatchesFilter('>=64%')
    })

    it('handles <', () => expectMatchesFilter('<75%'))

    it('handles <=', () => {
      expectMatchesFilter('<=64%')
      expectMatchesFilter('<=75%')
    })

    it('handles ..', () => expectMatchesFilter('60%..75%'))

    it('handles ..*', () => {
      expectMatchesFilter('60%..*')
      expectMatchesFilter('64%..*')
    })

    it('handles *..', () => {
      expectMatchesFilter('*..75%')
      expectMatchesFilter('*..64%')
    })
  })

  describe('tracked by filtering', () => {
    const item = createMemexItemModel(DefaultTrackedByIssue)

    const filterProps = {
      item,
      column: createColumnModel(trackedByColumn),
      columnData: item.columns,
    }
    const baseExpectMatchesFilter = (values: Array<string>) => matchesFilter({...filterProps, values})

    const expectMatchesFilter = (...values: Array<string>) => expect(baseExpectMatchesFilter(values)).toBeTruthy()
    const expectNotMatchesFilter = (...values: Array<string>) =>
      expect(baseExpectMatchesFilter(values)).not.toBeTruthy()

    it('handles expected values', () => {
      expectMatchesFilter('github/memex#335')
      expectNotMatchesFilter('github/foobar#533')
    })
  })

  describe('parent issue filtering', () => {
    const item = createMemexItemModel(DefaultSubIssue)
    const filterOpts = {item, column: createColumnModel(parentIssueColumn), columnData: item.columns}

    it('matches when name-with-owner is the same', () => {
      expect(matchesFilter({values: ['github/memex#100'], ...filterOpts})).toEqual(true)
    })
    it('does not match when name-with-owner is different', () => {
      expect(matchesFilter({values: ['github/something-else#123'], ...filterOpts})).toEqual(false)
    })
    it('matches when at least one NWO matches', () => {
      expect(matchesFilter({values: ['github/memex#100', 'github/something-else#123'], ...filterOpts})).toEqual(true)
    })
    it('does not match on partial name with owner', () => {
      expect(matchesFilter({values: ['github/memex'], ...filterOpts})).toEqual(false)
      expect(matchesFilter({values: ['memex#100'], ...filterOpts})).toEqual(false)
    })
  })

  describe('@me filter', () => {
    it('matches against the current user for assignees', () => {
      seedJSONIsland('logged-in-user', {
        id: 7584089,
        global_relay_id: 'MDQ6VXNlcjc1ODQwODk=',
        login: 'azenMatt',
        name: 'Matthew Butler',
        avatarUrl: 'https://github.com/azenMatt.png',
        isSpammy: false,
      })
      const item = createMemexItemModel(IssueWithAssigneeMatt)
      const testColumn = createColumnModel(assigneeColumnFixture())
      const query = ['@me']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('matches against the current user for reviewers', () => {
      seedJSONIsland('logged-in-user', {
        id: 7584089,
        global_relay_id: 'MDQ6VXNlcjc1ODQwODk=',
        login: 'azenMatt',
        name: 'Matthew Butler',
        avatarUrl: 'https://github.com/azenMatt.png',
        isSpammy: false,
      })
      const item = createMemexItemModel(PullRequestWithReviewerMatt)
      const testColumn = createColumnModel(reviewersColumnFixture())
      const query = ['@me']
      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })
  })

  describe('iteration filtering', () => {
    const setDate = '2021-10-25'

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date(setDate).getTime())
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    const currentIterationId = 'current-id'
    const nextIterationId = 'next-id'
    const previousIterationId = 'previous-id'

    const beforePreviousIteration: Iteration = {
      id: 'x',
      title: 'Long ago iteration',
      titleHtml: 'Long ago iteration as HTML',
      startDate: '2021-09-08',
      duration: 14,
    }
    const previousIteration: Iteration = {
      id: previousIterationId,
      title: 'Previous iteration',
      titleHtml: 'Previous iteration as HTML',
      startDate: '2021-09-22',
      duration: 7,
    }

    const currentIteration: Iteration = {
      id: currentIterationId,
      title: 'Current iteration',
      titleHtml: 'Current iteration as HTML',
      startDate: '2021-10-20',
      duration: 28,
    }

    const nextIteration: Iteration = {
      id: nextIterationId,
      title: 'Next iteration',
      titleHtml: 'Next iteration as HTML',
      startDate: '2021-11-03',
      duration: 14,
    }

    const iterationColumnId = 1234

    const iterationField: MemexColumn = {
      dataType: MemexColumnDataType.Iteration,
      id: iterationColumnId,
      databaseId: 4,
      name: 'Iteration',
      userDefined: true,
      defaultColumn: true,
      settings: {
        configuration: {
          iterations: [currentIteration, nextIteration],
          completedIterations: [beforePreviousIteration, previousIteration],
          startDay: 1,
          duration: 14,
        },
      },
    }

    const itemData: Omit<Issue, 'memexProjectColumnValues'> = {
      contentType: ItemType.Issue,
      content: {
        id: 12445,
        url: 'https://github.com/github/memex/issues/55',
        globalRelayId: '',
      },
      contentRepositoryId: 44444,
      id: 333,
      priority: null,
      updatedAt: '2022-03-02T00:00:00.000Z',
    }

    it('shows item belonging to current iteration', () => {
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: 'current-id'},
          },
        ],
      }

      const item = createMemexItemModel(itemInCurrentIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@current']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('shows item belonging to next iteration', () => {
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: 'next-id'},
          },
        ],
      }

      const item = createMemexItemModel(itemInCurrentIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@next']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('shows item belonging to previous iteration', () => {
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: 'previous-id'},
          },
        ],
      }

      const item = createMemexItemModel(itemInCurrentIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@previous']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeTruthy()
    })

    it('shows item belonging to current iteration when multiple query values are present', () => {
      const itemInPreviousIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: previousIterationId},
          },
        ],
      }
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: currentIterationId},
          },
        ],
      }

      const currentIterationItem = createMemexItemModel(itemInCurrentIteration)
      const previousIterationItem = createMemexItemModel(itemInPreviousIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@previous', '@current']

      expect(
        matchesFilter({
          columnData: currentIterationItem.columns,
          column: testColumn,
          values: query,
        }),
      ).toBeTruthy()
      expect(
        matchesFilter({
          columnData: previousIterationItem.columns,
          column: testColumn,
          values: query,
        }),
      ).toBeTruthy()
    })

    it('hides item belonging to next iteration', () => {
      const itemInNextIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: 'next-id'},
          },
        ],
      }

      const item = createMemexItemModel(itemInNextIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@current']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeFalsy()
    })

    it('hides item without iteration value', () => {
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [],
      }

      const item = createMemexItemModel(itemInCurrentIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@current']

      expect(matchesFilter({columnData: item.columns, column: testColumn, values: query})).toBeFalsy()
    })

    it('hides item with current iteration with negated matching', () => {
      const itemInCurrentIteration = {
        ...itemData,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: iterationColumnId,
            value: {id: 'current-id'},
          },
        ],
      }

      const item = createMemexItemModel(itemInCurrentIteration)
      const testColumn = createColumnModel(iterationField)
      const query = ['@current']

      expect(
        matchesFilter({columnData: item.columns, column: testColumn, values: query, matchNegated: true}),
      ).toBeFalsy()
    })

    describe('comparison filters', () => {
      it.each`
        id                     | query                           | result
        ${previousIterationId} | ${['>=@current']}               | ${false}
        ${currentIterationId}  | ${['>=@current']}               | ${true}
        ${nextIterationId}     | ${['>=@current']}               | ${true}
        ${previousIterationId} | ${['>=current iteration']}      | ${false}
        ${currentIterationId}  | ${['>=current iteration']}      | ${true}
        ${nextIterationId}     | ${['>=current iteration']}      | ${true}
        ${previousIterationId} | ${['>@current']}                | ${false}
        ${currentIterationId}  | ${['>@current']}                | ${false}
        ${nextIterationId}     | ${['>@current']}                | ${true}
        ${previousIterationId} | ${['>current iteration']}       | ${false}
        ${currentIterationId}  | ${['>current iteration']}       | ${false}
        ${nextIterationId}     | ${['>current iteration']}       | ${true}
        ${previousIterationId} | ${['<=@next']}                  | ${true}
        ${currentIterationId}  | ${['<=@next']}                  | ${true}
        ${nextIterationId}     | ${['<=@next']}                  | ${true}
        ${previousIterationId} | ${['<=next iteration']}         | ${true}
        ${currentIterationId}  | ${['<=next iteration']}         | ${true}
        ${nextIterationId}     | ${['<=next iteration']}         | ${true}
        ${previousIterationId} | ${['<@current']}                | ${true}
        ${currentIterationId}  | ${['<@current']}                | ${false}
        ${nextIterationId}     | ${['<@current']}                | ${false}
        ${previousIterationId} | ${['<@current', '@next']}       | ${true}
        ${currentIterationId}  | ${['<@current', '@next']}       | ${false}
        ${nextIterationId}     | ${['<@current', '@next']}       | ${true}
        ${previousIterationId} | ${['<current iteration']}       | ${true}
        ${currentIterationId}  | ${['<current iteration']}       | ${false}
        ${nextIterationId}     | ${['<current iteration']}       | ${false}
        ${previousIterationId} | ${['@current..next iteration']} | ${false}
        ${currentIterationId}  | ${['@current..next iteration']} | ${true}
        ${nextIterationId}     | ${['@current..next iteration']} | ${true}
        ${previousIterationId} | ${['current iteration..@next']} | ${false}
        ${currentIterationId}  | ${['current iteration..@next']} | ${true}
        ${nextIterationId}     | ${['current iteration..@next']} | ${true}
        ${previousIterationId} | ${['>=@previous']}              | ${true}
        ${currentIterationId}  | ${['>=@previous']}              | ${true}
        ${nextIterationId}     | ${['>=@previous']}              | ${true}
        ${previousIterationId} | ${['>=previous iteration']}     | ${true}
        ${currentIterationId}  | ${['>=previous iteration']}     | ${true}
        ${nextIterationId}     | ${['>=previous iteration']}     | ${true}
        ${previousIterationId} | ${['>@previous']}               | ${false}
        ${currentIterationId}  | ${['>@previous']}               | ${true}
        ${nextIterationId}     | ${['>@previous']}               | ${true}
        ${previousIterationId} | ${['>previous iteration']}      | ${false}
        ${currentIterationId}  | ${['>previous iteration']}      | ${true}
        ${nextIterationId}     | ${['>previous iteration']}      | ${true}
        ${previousIterationId} | ${['<=@current+1']}             | ${true}
        ${currentIterationId}  | ${['<=@current+1']}             | ${true}
        ${nextIterationId}     | ${['<=@current+1']}             | ${true}
        ${previousIterationId} | ${['<=@previous+1']}            | ${true}
        ${currentIterationId}  | ${['<=@previous+1']}            | ${true}
        ${nextIterationId}     | ${['<=@previous+1']}            | ${false}
        ${previousIterationId} | ${['@previous+1..@next-1']}     | ${false}
        ${currentIterationId}  | ${['@previous+1..@next-1']}     | ${true}
        ${nextIterationId}     | ${['@previous+1..@next-1']}     | ${false}
        ${previousIterationId} | ${['@previous+0']}              | ${true}
        ${currentIterationId}  | ${['@current+0']}               | ${true}
        ${nextIterationId}     | ${['@next+0']}                  | ${true}
        ${previousIterationId} | ${['@current..@current+1']}     | ${false}
        ${currentIterationId}  | ${['@current..@current+1']}     | ${true}
        ${nextIterationId}     | ${['@current..@current+1']}     | ${true}
        ${nextIterationId}     | ${['@previous+2']}              | ${true}
        ${previousIterationId} | ${['@next-2']}                  | ${true}
        ${nextIterationId}     | ${['@previous+-2']}             | ${false}
        ${previousIterationId} | ${['@next-+2']}                 | ${false}
        ${currentIterationId}  | ${['@current++00']}             | ${false}
        ${currentIterationId}  | ${['@current+=-+-"200"']}       | ${false}
      `(
        'returns the expected `$result` for iteration $id given a $query',
        ({id, query, result}: {id: string; query: Array<string>; result: boolean}) => {
          const iterationItem = {
            ...itemData,
            memexProjectColumnValues: [
              {
                memexProjectColumnId: iterationColumnId,
                value: {id},
              },
            ],
          }

          const item = createMemexItemModel(iterationItem)
          const testColumn = createColumnModel(iterationField)

          expect(
            matchesFilter({
              columnData: item.columns,
              column: testColumn,
              values: query,
            }),
          ).toEqual(result)
        },
      )
    })
  })
})

describe('matchesLastUpdated', () => {
  describe('when query is `last-updated:23days`', () => {
    it('matches an item updated 24 days ago', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(24),
          value: '23days',
        }),
      ).toEqual(true)
    })

    it('does not match an item updated 23 days ago', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(23),
          value: '23days',
        }),
      ).toEqual(false)
    })

    it('does not match an item updated just now', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: new Date(),
          value: '23days',
        }),
      ).toEqual(false)
    })
  })

  describe('when query is `-last-updated:10days`', () => {
    it('matches an item updated 10 days ago', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(10),
          value: '10days',
          matchNegated: true,
        }),
      ).toEqual(true)
    })

    it('matches an item updated just now', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: new Date(),
          value: '10days',
          matchNegated: true,
        }),
      ).toEqual(true)
    })

    it('does not match an item updated 11 days ago', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(11),
          value: '10days',
          matchNegated: true,
        }),
      ).toEqual(false)
    })
  })

  describe('when query is invalid', () => {
    it('does not match an item if unit in value is not day/days', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(365),
          value: '5weeks',
        }),
      ).toEqual(false)
    })

    it('does not match an item if number of days in value is less than 0', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: getDaysAgo(24),
          value: '-24days',
        }),
      ).toEqual(false)
    })

    it('does not match an item if number of days in value is equal to 0', () => {
      expect(
        matchesLastUpdated({
          itemUpdateAtDate: new Date(),
          value: '0days',
        }),
      ).toEqual(false)
    })
  })
})

describe('updatedParseFullTextQuery', () => {
  it.each`
    rawQuery | parsedQuery
    ${'labels:bug'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug',
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"to do"'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"to do"',
      spaceAfter: '',
    },
  ],
}}
    ${"labels:'to do'"} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'to do'",
      spaceAfter: '',
    },
  ],
}}
    ${'labels:to-do'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['to-do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'to-do',
      spaceAfter: '',
    },
  ],
}}
    ${'due-date:04-19-2021'} | ${{
  searchTokens: [],
  fieldFilters: [['due-date', ['04-19-2021']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'due-date',
      type: 'field',
      value: '04-19-2021',
      spaceAfter: '',
    },
  ],
}}
    ${'labels:to do"'} | ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'labels:to do"',
      spaceAfter: '',
    },
  ],
}}
    ${"labels:to do'"} | ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: "labels:to do'",
      spaceAfter: '',
    },
  ],
}}
    ${"labels:'to do"} | ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: "labels:'to do",
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"to do'} | ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'labels:"to do',
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"to, do"'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['to, do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"to, do"',
      spaceAfter: '',
    },
  ],
}}
    ${'label:"changelog:dependencies"'} | ${{
  searchTokens: [],
  fieldFilters: [['label', ['changelog:dependencies']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'label',
      type: 'field',
      value: '"changelog:dependencies"',
      spaceAfter: '',
    },
  ],
}}
    ${'no:label'} | ${{
  searchTokens: [],
  fieldFilters: [['no', ['label']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      field: 'label',
      type: 'no-field',
      spaceAfter: '',
    },
  ],
}}
    ${'-no:label'} | ${{
  searchTokens: [],
  fieldFilters: [['-no', ['label']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      field: 'label',
      type: 'no-field',
      spaceAfter: '',
    },
  ],
}}
    ${'-label:"In progress"'} | ${{
  searchTokens: [],
  fieldFilters: [['-label', ['In progress']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      field: 'label',
      type: 'field',
      value: '"In progress"',
      spaceAfter: '',
    },
  ],
}}
    ${':"In progress"'} | ${{
  searchTokens: [':', '"in progress"'],
  fieldFilters: [],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'search',
      value: ':',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: '"In progress"',
    },
  ],
}}
  `('correctly parses single column filter rawQuery: $rawQuery', ({rawQuery, parsedQuery}) => {
    expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
  })

  it.each`
    rawQuery | parsedQuery
    ${'labels:bug this is a test'} | ${{
  searchTokens: ['this', 'is', 'a', 'test'],
  fieldFilters: [['labels', ['bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: ' ',
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug',
    },
    {
      type: 'search',
      value: 'this',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'is',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'a',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: '',
    },
  ],
}}
    ${'this is a test labels:bug'} | ${{
  searchTokens: ['this', 'is', 'a', 'test'],
  fieldFilters: [['labels', ['bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'this',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'is',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'a',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug',
      spaceAfter: '',
    },
  ],
}}
    ${'this is labels:bug a test'} | ${{
  searchTokens: ['this', 'is', 'a', 'test'],
  fieldFilters: [['labels', ['bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'this',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'is',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'a',
      spaceAfter: ' ',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: 'test',
    },
  ],
}}
    ${'"free:text"'} | ${{
  searchTokens: ['"free:text"'],
  fieldFilters: [],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: '"free:text"',
      spaceAfter: '',
    },
  ],
}}
    ${"this is a test labels:bug labels:'to do'"} | ${{
  searchTokens: ['this', 'is', 'a', 'test'],
  fieldFilters: [['labels', ['bug']], ['labels', ['to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'this',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'is',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'a',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'to do'",
      spaceAfter: '',
    },
  ],
}}
    ${"  this  is    a test     labels:bug     labels:'to do'   "} | ${{
  searchTokens: ['this', 'is', 'a', 'test'],
  fieldFilters: [['labels', ['bug']], ['labels', ['to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '  ',
      type: 'search',
      value: '',
    },
    {
      spaceAfter: '  ',
      type: 'search',
      value: 'this',
    },
    {
      spaceAfter: '    ',
      type: 'search',
      value: 'is',
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: 'a',
    },
    {
      spaceAfter: '     ',
      type: 'search',
      value: 'test',
    },
    {
      exclude: false,
      field: 'labels',
      spaceAfter: '     ',
      type: 'field',
      value: 'bug',
    },
    {
      exclude: false,
      field: 'labels',
      spaceAfter: '   ',
      type: 'field',
      value: "'to do'",
    },
  ],
}}
    ${':"In progress" test'} | ${{
  searchTokens: [':', '"in progress"', 'test'],
  fieldFilters: [],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: ':',
      spaceAfter: '',
    },
    {
      type: 'search',
      value: '"In progress"',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: '',
    },
  ],
}}
  `('correctly parses single column filter and fuzzy search terms Raw Query: $rawQuery', ({rawQuery, parsedQuery}) => {
    expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
  })

  it.each`
    rawQuery | parsedQuery
    ${'labels:bug,"enhancement ✨"'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['bug', 'enhancement ✨']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug,"enhancement ✨"',
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"enhancement ✨",bug'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨",bug',
      spaceAfter: '',
    },
  ],
}}
    ${"labels:'enhancement ✨',bug"} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨',bug",
      spaceAfter: '',
    },
  ],
}}
    ${"labels:bug,'enhancement ✨'"} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['bug', 'enhancement ✨']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "bug,'enhancement ✨'",
      spaceAfter: '',
    },
  ],
}}
    ${'labels:bug,to-do'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['bug', 'to-do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug,to-do',
      spaceAfter: '',
    },
  ],
}}
    ${"labels:'enhancement ✨','user story',bug"} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨','user story',bug",
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"enhancement ✨","user story","to do"'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨","user story","to do"',
      spaceAfter: '',
    },
  ],
}}
    ${"labels:'enhancement ✨','user story','to do'"} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨','user story','to do'",
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"enhancement ✨","user story",bug'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨","user story",bug',
      spaceAfter: '',
    },
  ],
}}
    ${'labels:"enhancement, ✨","user, story",bug'} | ${{
  searchTokens: [],
  fieldFilters: [['labels', ['enhancement, ✨', 'user, story', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement, ✨","user, story",bug',
      spaceAfter: '',
    },
  ],
}}
    ${`labels:enhancement ✨",''`} | ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: "labels:enhancement ✨\",''",
      spaceAfter: '',
    },
  ],
}}
    ${`labels:enhancement ✨",blah',"hey`} | ${{
  searchTokens: ['✨', '",blah\',"', 'hey'],
  fieldFilters: [['labels', ['enhancement']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: ' ',
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'enhancement',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: '✨',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: '",blah\',"',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: 'hey',
    },
  ],
}}
    ${':"enhancement, ✨","user, story",bug'} | ${{
  searchTokens: [':', '"enhancement, ✨"', ',', '"user, story"', ',bug'],
  fieldFilters: [],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'search',
      value: ':',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: '"enhancement, ✨"',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: ',',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: '"user, story"',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: ',bug',
    },
  ],
}}
  `('correctly parses column filter with comma separated values rawQuery: $rawQuery', ({rawQuery, parsedQuery}) => {
    expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
  })

  it.each`
    rawQuery                                                                             | parsedQuery
    ${'cool test labels:bug,"enhancement ✨" fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['bug', 'enhancement ✨']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug,"enhancement ✨"',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${'cool test labels:"enhancement ✨",bug fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨",bug',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${"cool test labels:'enhancement ✨',bug fixes stuff"} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨',bug",
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${"cool test labels:bug,'enhancement ✨' fixes stuff"} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['bug', 'enhancement ✨']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "bug,'enhancement ✨'",
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${'cool test labels:bug,to-do fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['bug', 'to-do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: 'bug,to-do',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${"cool test labels:'enhancement ✨','user story',bug fixes stuff"} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨','user story',bug",
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${'cool test labels:"enhancement ✨","user story",bug fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨","user story",bug',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${'cool test labels:"enhancement ✨","user story","to do" fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement ✨","user story","to do"',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${"cool test labels:'enhancement ✨','user story','to do' fixes stuff"} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement ✨', 'user story', 'to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: 'test',
    },
    {
      spaceAfter: ' ',
      exclude: false,
      field: 'labels',
      type: 'field',
      value: "'enhancement ✨','user story','to do'",
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: 'fixes',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: 'stuff',
    },
  ],
}}
    ${'cool test labels:"enhancement, ✨","user, story","to do" fixes stuff'} | ${{
  searchTokens: ['cool', 'test', 'fixes', 'stuff'],
  fieldFilters: [['labels', ['enhancement, ✨', 'user, story', 'to do']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      type: 'search',
      value: 'cool',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'test',
      spaceAfter: ' ',
    },
    {
      exclude: false,
      field: 'labels',
      type: 'field',
      value: '"enhancement, ✨","user, story","to do"',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'fixes',
      spaceAfter: ' ',
    },
    {
      type: 'search',
      value: 'stuff',
      spaceAfter: '',
    },
  ],
}}
    ${"    cool   test   labels:'enhancement ✨,'user story','to do'  fixes   stuff   "}
    ${{
  searchTokens: [],
  fieldFilters: [],
  invalidQuery: true,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'search',
      value: "    cool   test   labels:'enhancement ✨,'user story','to do'  fixes   stuff   ",
    },
  ],
}}
    ${':"enhancement, ✨" "user, story" bug test'} | ${{
  searchTokens: [':', '"enhancement, ✨"', '"user, story"', 'bug', 'test'],
  fieldFilters: [],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'search',
      value: ':',
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: '"enhancement, ✨"',
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: '"user, story"',
    },
    {
      spaceAfter: ' ',
      type: 'search',
      value: 'bug',
    },
    {
      spaceAfter: '',
      type: 'search',
      value: 'test',
    },
  ],
}}
  `(
    'correctly parses column filter with comma separated values and fuzzy text rawQuery: $rawQuery',
    ({rawQuery, parsedQuery}) => {
      expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
    },
  )

  it.each`
    rawQuery | parsedQuery
    ${'is:closed'} | ${{
  fieldFilters: [['is', ['closed']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'is',
      value: 'closed',
    },
  ],
  searchTokens: [],
}}
    ${'is:closed,merged'} | ${{
  fieldFilters: [['is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'is',
      value: 'closed,merged',
    },
  ],
  searchTokens: [],
}}
    ${'is:"closed","merged"'} | ${{
  fieldFilters: [['is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'is',
      value: '"closed","merged"',
    },
  ],
  searchTokens: [],
}}
    ${'is:closed,"merged"'} | ${{
  fieldFilters: [['is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'is',
      value: 'closed,"merged"',
    },
  ],
  searchTokens: [],
}}
    ${'is:CLOSED,"merged"'} | ${{
  fieldFilters: [['is', ['CLOSED', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: '',
      type: 'is',
      value: 'CLOSED,"merged"',
    },
  ],
  searchTokens: [],
}}
    ${'-is:closed'} | ${{
  fieldFilters: [['-is', ['closed']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      spaceAfter: '',
      type: 'is',
      value: 'closed',
    },
  ],
  searchTokens: [],
}}
    ${'-is:closed,merged'} | ${{
  fieldFilters: [['-is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      spaceAfter: '',
      type: 'is',
      value: 'closed,merged',
    },
  ],
  searchTokens: [],
}}
    ${'-is:"closed","merged"'} | ${{
  fieldFilters: [['-is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      spaceAfter: '',
      type: 'is',
      value: '"closed","merged"',
    },
  ],
  searchTokens: [],
}}
    ${'-is:closed,"merged"'} | ${{
  fieldFilters: [['-is', ['closed', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      spaceAfter: '',
      type: 'is',
      value: 'closed,"merged"',
    },
  ],
  searchTokens: [],
}}
    ${'-is:CLOSED,"merged"'} | ${{
  fieldFilters: [['-is', ['CLOSED', 'merged']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      spaceAfter: '',
      type: 'is',
      value: 'CLOSED,"merged"',
    },
  ],
  searchTokens: [],
}}
  `('correctly parses queries with unbalanced quotes: $rawQuery', ({rawQuery, parsedQuery}) => {
    expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
  })
  it.each`
    rawQuery | parsedQuery
    ${'label:"won\'t fix"'} | ${{
  fieldFilters: [['label', ["won't fix"]]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'label',
      spaceAfter: '',
      type: 'field',
      value: '"won\'t fix"',
    },
  ],
  searchTokens: [],
}}
    ${'-label:"won\'t fix"'} | ${{
  fieldFilters: [['-label', ["won't fix"]]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: true,
      field: 'label',
      spaceAfter: '',
      type: 'field',
      value: '"won\'t fix"',
    },
  ],
  searchTokens: [],
}}
    ${'"can\'t repro" label:"won\'t fix"'} | ${{
  fieldFilters: [['label', ["won't fix"]]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      spaceAfter: ' ',
      type: 'search',
      value: '"can\'t repro"',
    },
    {
      exclude: false,
      field: 'label',
      spaceAfter: '',
      type: 'field',
      value: '"won\'t fix"',
    },
  ],
  searchTokens: ['"can\'t repro"'],
}}
    ${'status:"can\'t determine" label:\'waiting for "top cat" review\',bug'} | ${{
  fieldFilters: [['status', ["can't determine"]], ['label', ['waiting for "top cat" review', 'bug']]],
  invalidQuery: false,
  orderedTokenizedFilters: [
    {
      exclude: false,
      field: 'status',
      spaceAfter: ' ',
      type: 'field',
      value: '"can\'t determine"',
    },
    {
      exclude: false,
      field: 'label',
      spaceAfter: '',
      type: 'field',
      value: '\'waiting for "top cat" review\',bug',
    },
  ],
  searchTokens: [],
}}
  `('correctly parses is qualifiers raw query: $rawQuery', ({rawQuery, parsedQuery}) => {
    expect(parseFullTextQuery(rawQuery)).toEqual(parsedQuery)
  })

  describe('iteration column filters', () => {
    it('correctly parses an iteration column value in the filter', () => {
      expect(parseFullTextQuery('iteration:"iteration-4"')).toEqual({
        searchTokens: [],
        fieldFilters: [['iteration', ['iteration-4']]],
        invalidQuery: false,
        orderedTokenizedFilters: [
          {
            exclude: false,
            field: 'iteration',
            type: 'field',
            value: '"iteration-4"',
            spaceAfter: '',
          },
        ],
      })
    })

    it('correctly parses the @current iteration token', () => {
      expect(parseFullTextQuery('iteration:@current')).toEqual({
        searchTokens: [],
        fieldFilters: [['iteration', ['@current']]],
        invalidQuery: false,
        orderedTokenizedFilters: [
          {
            exclude: false,
            field: 'iteration',
            type: 'field',
            value: '@current',
            spaceAfter: '',
          },
        ],
      })
    })
  })

  it('correctly parses iterations and dates with a plus or minus number', () => {
    expect(parseFullTextQuery('iteration:@current+1')).toEqual({
      searchTokens: [],
      fieldFilters: [['iteration', ['@current+1']]],
      invalidQuery: false,
      orderedTokenizedFilters: [
        {
          exclude: false,
          field: 'iteration',
          type: 'field',
          value: '@current+1',
          spaceAfter: '',
        },
      ],
    })
    expect(parseFullTextQuery('iteration:@next-3')).toEqual({
      searchTokens: [],
      fieldFilters: [['iteration', ['@next-3']]],
      invalidQuery: false,
      orderedTokenizedFilters: [
        {
          exclude: false,
          field: 'iteration',
          type: 'field',
          value: '@next-3',
          spaceAfter: '',
        },
      ],
    })
  })
})

describe('normalizeToLowercaseFieldName', () => {
  it('correctly normalizes repo, label, or assignee filters to field names', () => {
    expect(normalizeToLowercaseFieldName('label')).toEqual('labels')
    expect(normalizeToLowercaseFieldName('assignee')).toEqual('assignees')
    expect(normalizeToLowercaseFieldName('repo')).toEqual('repository')
  })
  it('correctly normalizes hyphens and spaces in filters to field names', () => {
    expect(normalizeToLowercaseFieldName('due-date')).toEqual('due date')
    expect(normalizeToLowercaseFieldName('due date ')).toEqual('due date')
  })
  it('correctly normalizes to locale lowercase', () => {
    expect(normalizeToLowercaseFieldName('STATUS')).toEqual('status')
  })
})

describe('normalizeToFilterName', () => {
  it('correctly normalizes repository, labels, or assignees column to github filter syntax', () => {
    expect(normalizeToFilterName('labels')).toEqual('label')
    expect(normalizeToFilterName('assignees')).toEqual('assignee')
    expect(normalizeToFilterName('repository')).toEqual('repo')
    expect(normalizeToFilterName('status')).toEqual('status')
    expect(normalizeToFilterName('due-date')).toEqual('due-date')
  })
  it('correctly normalizes uppercased, unhyphenated column to github filter syntax', () => {
    expect(normalizeToFilterName('STATUS')).toEqual('status')
    expect(normalizeToFilterName('due date')).toEqual('due-date')
    expect(normalizeToFilterName('due-date ')).toEqual('due-date')
  })
})

describe('matchMetaProps', () => {
  it('recognizes issue types', () => {
    const item = createMemexItemModel(DefaultClosedIssue)
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'issue'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'pr'})).toBeFalsy()
  })

  it('recognizes open pull', () => {
    const item = createMemexItemModel(DefaultOpenPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'pr'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'issue'})).toBeFalsy()
  })

  it('recognizes merged and closed pulls', () => {
    let item = createMemexItemModel(DefaultMergedPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'pr'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'merged'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'closed'})).toBeTruthy()

    item = createMemexItemModel(DefaultClosedPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'pr'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'merged'})).toBeFalsy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'closed'})).toBeTruthy()
  })

  it('recognizes draft types', () => {
    // Draft issues are also bucketed as issues see src/client/helpers/search-filter.ts
    const item = createMemexItemModel(DefaultDraftIssue)
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'issue'})).toBeTruthy()
  })

  it('recognizes draft state', () => {
    const item = createMemexItemModel(DefaultDraftPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'draft'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'open'})).toBeTruthy()

    // draft pull requests are equivalent to draft issues
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft', matchNegated: true})).toBeFalsy()
  })

  it('recognizes closed draft pull requests', () => {
    const closedDraftPullRequest: PullRequest = {
      id: 7,
      contentType: ItemType.PullRequest,
      content: {
        id: 7,
        url: 'https://github.com/github/memex/pull/337',
      },
      contentRepositoryId: 1424242,
      priority: 6,
      updatedAt: '2022-03-02T00:00:00.000Z',
      memexProjectColumnValues: [
        {
          memexProjectColumnId: SystemColumnId.Title,
          value: {
            number: 7,
            state: PullRequestState.Closed,
            title: {
              raw: 'Experimental changes to core architecture ',
              html: 'Experimental changes to <code>core architecture</code>',
            },
            isDraft: true,
          },
        },
      ],
    }

    const item = createMemexItemModel(closedDraftPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'draft'})).toBeFalsy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'open'})).toBeFalsy()

    // draft pull requests are equivalent to draft issues
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft'})).toBeFalsy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft', matchNegated: true})).toBeTruthy()
  })

  it('recognizes open state', () => {
    const item = createMemexItemModel(DefaultOpenPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'open'})).toBeTruthy()
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'closed'})).toBeFalsy()

    // open pull requests should be excluded from is:draft filters
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft'})).toBeFalsy()
    expect(matchMetaProps({columnData: item.columns, field: 'type', value: 'draft', matchNegated: true})).toBeTruthy()
  })

  it('does not recognize invalid values', () => {
    const item = createMemexItemModel(DefaultDraftPullRequest)
    expect(matchMetaProps({columnData: item.columns, field: 'state', value: 'drafty'})).toBeFalsy()
  })
})

describe('replaceQuery', () => {
  it('can add to a list of quoted values', () => {
    expect(
      replaceQuery('label:"tech debt",', 'Labels', {
        value: 'changelog:dependencies',
        replace: true,
      }),
    ).toEqual('label:"tech debt","changelog:dependencies"')
  })
  it('can add to a list of quoted values, with an initial quote', () => {
    expect(
      replaceQuery('label:"tech debt","', 'Labels', {
        value: 'changelog:dependencies',
        replace: true,
      }),
    ).toEqual('label:"tech debt","changelog:dependencies"')
  })
  it('does not remove a quote when not replacing', () => {
    expect(replaceQuery('-label:"changelog:dependencies"', 'Labels')).toEqual('-label:"changelog:dependencies" label:')
  })

  it.each`
    filter         | query                                       | options                                                              | result
    ${'Labels'}    | ${'label:'}                                 | ${{value: 'tech debt', replace: true}}                               | ${'label:"tech debt"'}
    ${'Labels'}    | ${'label:"tech debt",'}                     | ${{value: 'enhancement ✨', replace: true}}                          | ${'label:"tech debt","enhancement ✨"'}
    ${'Status'}    | ${'status:'}                                | ${{value: 'Done', replace: true}}                                    | ${'status:Done'}
    ${'Status'}    | ${'status:"Don'}                            | ${{value: 'Done', replace: true}}                                    | ${'status:Done'}
    ${'Assignees'} | ${'-'}                                      | ${{value: undefined, replace: true, filterForNegative: true}}        | ${'-assignee:'}
    ${'Assignees'} | ${'-assignee:'}                             | ${{value: '@me', replace: true, filterForNegative: true}}            | ${'-assignee:@me'}
    ${'Assignees'} | ${'-assignee:"@me",'}                       | ${{value: 'test', replace: true, filterForNegative: true}}           | ${'-assignee:"@me",test'}
    ${'no'}        | ${'no'}                                     | ${{value: undefined, replace: true}}                                 | ${'no:'}
    ${'no'}        | ${'no:'}                                    | ${{value: 'assignee', replace: true}}                                | ${'no:assignee'}
    ${'no'}        | ${'no:assignee,'}                           | ${{value: 'status', replace: true}}                                  | ${'no:assignee,status'}
    ${'no'}        | ${'existing:field no:'}                     | ${{value: 'assignee', replace: true}}                                | ${'existing:field no:assignee'}
    ${'no'}        | ${'existing:field no:assignee,'}            | ${{value: 'status', replace: true}}                                  | ${'existing:field no:assignee,status'}
    ${'is'}        | ${'is'}                                     | ${{value: undefined, replace: true}}                                 | ${'is:'}
    ${'is'}        | ${'is:'}                                    | ${{value: 'open', replace: true}}                                    | ${'is:open'}
    ${'is'}        | ${'is:open,'}                               | ${{value: 'closed', replace: true}}                                  | ${'is:open,closed'}
    ${'is'}        | ${'existing:field is:'}                     | ${{value: 'open', replace: true}}                                    | ${'existing:field is:open'}
    ${'is'}        | ${'existing:field is:open,'}                | ${{value: 'closed', replace: true}}                                  | ${'existing:field is:open,closed'}
    ${'reason'}    | ${'rea'}                                    | ${{value: undefined, replace: true}}                                 | ${'reason:'}
    ${'Labels'}    | ${'status:done label:'}                     | ${{value: 'tech debt', replace: true}}                               | ${'status:done label:"tech debt"'}
    ${'Labels'}    | ${'status:done label:"tech debt",'}         | ${{value: 'enhancement ✨', replace: true}}                          | ${'status:done label:"tech debt","enhancement ✨"'}
    ${'Status'}    | ${'status:done status:'}                    | ${{value: 'Done', replace: true}}                                    | ${'status:done status:Done'}
    ${'Assignees'} | ${'status:done -'}                          | ${{value: undefined, replace: true, filterForNegative: true}}        | ${'status:done -assignee:'}
    ${'Assignees'} | ${'status:done -assignee:'}                 | ${{value: '@me', replace: true, filterForNegative: true}}            | ${'status:done -assignee:@me'}
    ${'Assignees'} | ${'status:done -assignee:"@me",'}           | ${{value: 'test', replace: true, filterForNegative: true}}           | ${'status:done -assignee:"@me",test'}
    ${'no'}        | ${'status:done no'}                         | ${{value: undefined, replace: true}}                                 | ${'status:done no:'}
    ${'is'}        | ${'status:done is'}                         | ${{value: undefined, replace: true}}                                 | ${'status:done is:'}
    ${'reason'}    | ${'status:done rea'}                        | ${{value: undefined, replace: true}}                                 | ${'status:done reason:'}
    ${'Status'}    | ${'status:'}                                | ${{value: 'empty-12', replace: true, filterForEmpty: true}}          | ${'no:status'}
    ${'Status'}    | ${'status:'}                                | ${{value: undefined, replace: true, filterForNegative: true}}        | ${'-status:'}
    ${'Status'}    | ${'status:done status:'}                    | ${{value: 'empty-12', replace: true, filterForEmpty: true}}          | ${'status:done no:status'}
    ${'Iteration'} | ${'iteration:'}                             | ${{value: '@next', replace: true}}                                   | ${'iteration:@next'}
    ${'Iteration'} | ${'iteration:'}                             | ${{value: '@current', replace: true}}                                | ${'iteration:@current'}
    ${'Iteration'} | ${'iteration:'}                             | ${{value: '@previous', replace: true}}                               | ${'iteration:@previous'}
    ${'Iteration'} | ${'iteration:@current,'}                    | ${{value: '@next', replace: true}}                                   | ${'iteration:@current,@next'}
    ${'Iteration'} | ${'iteration:"@current",'}                  | ${{value: '@next', replace: true}}                                   | ${'iteration:"@current",@next'}
    ${'Iteration'} | ${'iteration:<'}                            | ${{value: '@current', replace: true}}                                | ${'iteration:<@current'}
    ${'Iteration'} | ${'iteration:>'}                            | ${{value: '@current', replace: true}}                                | ${'iteration:>@current'}
    ${'Iteration'} | ${'iteration:>='}                           | ${{value: '@current', replace: true}}                                | ${'iteration:>=@current'}
    ${'Iteration'} | ${'iteration:<='}                           | ${{value: '@current', replace: true}}                                | ${'iteration:<=@current'}
    ${'Iteration'} | ${'iteration:..'}                           | ${{value: '@current', replace: true}}                                | ${'iteration:..@current'}
    ${'Iteration'} | ${'iteration:*..'}                          | ${{value: '@current', replace: true}}                                | ${'iteration:*..@current'}
    ${'Iteration'} | ${'iteration:@current..'}                   | ${{value: '@next', replace: true}}                                   | ${'iteration:@current..@next'}
    ${'Iteration'} | ${'iteration:"Iteration 1"..'}              | ${{value: 'Iteration 2', replace: true}}                             | ${'iteration:"Iteration 1".."Iteration 2"'}
    ${'Due Date'}  | ${'due-date:'}                              | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:"2020-01-01"'}
    ${'Due Date'}  | ${'due-date:>'}                             | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:>"2020-01-01"'}
    ${'Due Date'}  | ${'due-date:<'}                             | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:<"2020-01-01"'}
    ${'Due Date'}  | ${'due-date:>='}                            | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:>="2020-01-01"'}
    ${'Due Date'}  | ${'due-date:<='}                            | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:<="2020-01-01"'}
    ${'Due Date'}  | ${'due-date:..'}                            | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:.."2020-01-01"'}
    ${'Due Date'}  | ${'due-date:*..'}                           | ${{value: '2020-01-01', replace: true}}                              | ${'due-date:*.."2020-01-01"'}
    ${'Due Date'}  | ${'due-date:2020-01-01..'}                  | ${{value: '2021-01-01', replace: true}}                              | ${'due-date:2020-01-01.."2021-01-01"'}
    ${'Estimate'}  | ${'estimate:>1'}                            | ${{value: '10', replace: true}}                                      | ${'estimate:>10'}
    ${'Estimate'}  | ${'estimate:>=1'}                           | ${{value: '10', replace: true}}                                      | ${'estimate:>=10'}
    ${'Estimate'}  | ${'estimate:<1'}                            | ${{value: '10', replace: true}}                                      | ${'estimate:<10'}
    ${'Estimate'}  | ${'estimate:<=1'}                           | ${{value: '10', replace: true}}                                      | ${'estimate:<=10'}
    ${'Estimate'}  | ${'estimate:..1'}                           | ${{value: '10', replace: true}}                                      | ${'estimate:..10'}
    ${'Estimate'}  | ${'estimate:*..1'}                          | ${{value: '10', replace: true}}                                      | ${'estimate:*..10'}
    ${'Estimate'}  | ${'estimate:3..1'}                          | ${{value: '10', replace: true}}                                      | ${'estimate:3..10'}
    ${'is'}        | ${'estimate:>=1 is'}                        | ${{value: undefined, replace: true}}                                 | ${'estimate:>=1 is:'}
    ${'Estimate'}  | ${'-estimate:>'}                            | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:>10'}
    ${'Estimate'}  | ${'-estimate:>='}                           | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:>=10'}
    ${'Estimate'}  | ${'-estimate:<'}                            | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:<10'}
    ${'Estimate'}  | ${'-estimate:<='}                           | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:<=10'}
    ${'Estimate'}  | ${'-estimate:..'}                           | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:..10'}
    ${'Estimate'}  | ${'-estimate:*..'}                          | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:*..10'}
    ${'Estimate'}  | ${'-estimate:3..'}                          | ${{value: '10', replace: true, filterForNegative: true}}             | ${'-estimate:3..10'}
    ${'Estimate'}  | ${'existing:field estimate:>1'}             | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:>10'}
    ${'Estimate'}  | ${'existing:field estimate:>=1'}            | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:>=10'}
    ${'Estimate'}  | ${'existing:field estimate:<1'}             | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:<10'}
    ${'Estimate'}  | ${'existing:field estimate:<=1'}            | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:<=10'}
    ${'Estimate'}  | ${'existing:field estimate:..1'}            | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:..10'}
    ${'Estimate'}  | ${'existing:field estimate:*..1'}           | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:*..10'}
    ${'Estimate'}  | ${'existing:field estimate:3..1'}           | ${{value: '10', replace: true}}                                      | ${'existing:field estimate:3..10'}
    ${'Estimate'}  | ${'existing:field -estimate:>'}             | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:>10'}
    ${'Estimate'}  | ${'existing:field -estimate:>='}            | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:>=10'}
    ${'Estimate'}  | ${'existing:field -estimate:<'}             | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:<10'}
    ${'Estimate'}  | ${'existing:field -estimate:<='}            | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:<=10'}
    ${'Estimate'}  | ${'existing:field -estimate:..'}            | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:..10'}
    ${'Estimate'}  | ${'existing:field -estimate:*..'}           | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:*..10'}
    ${'Estimate'}  | ${'existing:field -estimate:3..'}           | ${{value: '10', replace: true, filterForNegative: true}}             | ${'existing:field -estimate:3..10'}
    ${'Fielded'}   | ${'fielded:@current..'}                     | ${{value: '@next', replace: true}}                                   | ${'fielded:@current..@next'}
    ${'Fielded'}   | ${'fielded:@current..@p'}                   | ${{value: '@previous', replace: true}}                               | ${'fielded:@current..@previous'}
    ${'Fielded'}   | ${'fielded:@current-2..'}                   | ${{value: '@next', replace: true}}                                   | ${'fielded:@current-2..@next'}
    ${'Fielded'}   | ${'fielded:@current-2..@n'}                 | ${{value: '@next', replace: true}}                                   | ${'fielded:@current-2..@next'}
    ${'Fielded'}   | ${'-fielded:@current..'}                    | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'-fielded:@current..@next'}
    ${'Fielded'}   | ${'-fielded:@current..27'}                  | ${{value: 'Week of Jun 27', replace: true, filterForNegative: true}} | ${'-fielded:@current.."Week of Jun 27"'}
    ${'Fielded'}   | ${'-fielded:@current-2..'}                  | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'-fielded:@current-2..@next'}
    ${'Fielded'}   | ${'-fielded:@current-2..@n'}                | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'-fielded:@current-2..@next'}
    ${'Fielded'}   | ${'existing:field fielded:@current..'}      | ${{value: '@next', replace: true}}                                   | ${'existing:field fielded:@current..@next'}
    ${'Fielded'}   | ${'existing:field fielded:@current..@p'}    | ${{value: '@previous', replace: true}}                               | ${'existing:field fielded:@current..@previous'}
    ${'Fielded'}   | ${'existing:field -fielded:@current..'}     | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'existing:field -fielded:@current..@next'}
    ${'Fielded'}   | ${'existing:field -fielded:@current..27'}   | ${{value: 'Week of Jun 27', replace: true, filterForNegative: true}} | ${'existing:field -fielded:@current.."Week of Jun 27"'}
    ${'Fielded'}   | ${'existing:field fielded:@current-2..'}    | ${{value: '@next', replace: true}}                                   | ${'existing:field fielded:@current-2..@next'}
    ${'Fielded'}   | ${'existing:field fielded:@current-2..@n'}  | ${{value: '@next', replace: true}}                                   | ${'existing:field fielded:@current-2..@next'}
    ${'Fielded'}   | ${'existing:field -fielded:@current-2..'}   | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'existing:field -fielded:@current-2..@next'}
    ${'Fielded'}   | ${'existing:field -fielded:@current-2..@n'} | ${{value: '@next', replace: true, filterForNegative: true}}          | ${'existing:field -fielded:@current-2..@next'}
  `(
    'replaces `$filter` in `$query` and turns it into `$result`',
    ({filter, query, options, result}: {filter: string; query: string; options: FilterOptions; result: string}) => {
      const replaced = replaceQuery(query, filter, options)
      expect(replaced).toEqual(result)
    },
  )
})

describe('removeFilterFromQuery', () => {
  it('preserves key:value pairs preceeding the removed filter', () => {
    const originalQuery = `custom-text:"value to keep","value to remove"`
    const newQuery = removeFilterFromQuery('custom-text', '"value to remove"', originalQuery)
    expect(newQuery).toEqual('custom-text:"value to keep"')
  })
  it('preserves key:value pairs following the removed filter', () => {
    const originalQuery = `custom-text:"value to remove","value to keep"`
    const newQuery = removeFilterFromQuery('custom-text', '"value to remove"', originalQuery)
    expect(newQuery).toEqual('custom-text:"value to keep"')
  })
  it("removes key and value if there's one filter pair", () => {
    const originalQuery = `assignee:talune custom-text:"value to remove"`
    const newQuery = removeFilterFromQuery('custom-text', 'value to remove', originalQuery)
    expect(newQuery).toEqual('assignee:talune')
  })
  it('cleans up dangling commas, but not ones that are part of filter values', () => {
    const longFilterValue = 'really really, really, really, really, really long custom text value'
    const originalQuery = `custom-text:${longFilterValue},"Another value"`
    const newQuery = removeFilterFromQuery('custom-text', '"Another value"', originalQuery)
    expect(newQuery).toEqual(`custom-text:${longFilterValue}`)
  })
  it('handles removal of values with special characters', () => {
    const originalQuery = `milestone:"What if?"`
    const newQuery = removeFilterFromQuery('milestone', `"What if?"`, originalQuery)
    expect(newQuery).toEqual('')
  })
  // regression test for https://github.com/github/memex/issues/10836
  it('can handle assignee:@me query without crashing', () => {
    // invalid matches were causing this function to crash, related to a mismatch between @me and the login
    const originalQuery = `assignee:@me`
    const newQuery = removeFilterFromQuery('assignee', `username`, originalQuery)
    // should pass through unchanged since the filter value doesn't match, the assignee
    // value needs to be handled at a higher level
    expect(newQuery).toEqual('assignee:@me')
  })
})

describe('splitFieldFilters', () => {
  it.each([
    {filter: 'changelog "dependencies" "in progress"', expected: 'changelog "dependencies" "in progress"'},
    {filter: 'test " test', expected: 'test " test'},
    {filter: 'test <" test', expected: 'test <" test'},
    {filter: 'test ">', expected: 'test ">'},
    {filter: '"test \'test\'"', expected: "test 'test'"},
  ])('should remove nested quotes for $filter', ({filter, expected}) => {
    expect(splitFieldFilters(filter)).toEqual([expected])
  })

  it('should not remove nested quotes with a filter containing html', () => {
    const filter = '<a href="https://google.ca">jon</a>'
    expect(splitFieldFilters(filter)).toEqual([filter])
  })

  it.each([
    {
      test: 'a filter',
      filter: '"tech debt"',
      expected: ['tech debt'],
    },
    {
      test: 'multiple filters',
      filter: '"tech debt","changelog:dependencies","in progress"',
      expected: ['tech debt', 'changelog:dependencies', 'in progress'],
    },
    {
      test: 'multiple filters containing html',
      filter: '"<a href="https://google.ca">jon</a>","<a href="https://google.ca">doe</a>"',
      expected: ['<a href="https://google.ca">jon</a>', '<a href="https://google.ca">doe</a>'],
    },
  ])('returns an array containing $test', ({filter, expected}) => {
    expect(splitFieldFilters(filter)).toEqual(expected)
  })
})

describe('filtersToQuery', () => {
  it('should not remove nested quotes with a filter containing html', () => {
    const orderedTokenizedFilters = parseFullTextQuery(
      `hello world status:Ready,"In Progress",Backlog`,
    ).orderedTokenizedFilters
    expect(filtersToQuery(orderedTokenizedFilters)).toEqual(`hello world status:Ready,"In Progress",Backlog`)
  })

  it('should correctly preserve other inclusive filter types (search, is, reason, no)', () => {
    const orderedTokenizedFilters = parseFullTextQuery(
      `hello world is:open reason:completed no:milestone status:Ready,"In Progress",Backlog`,
    ).orderedTokenizedFilters
    expect(filtersToQuery(orderedTokenizedFilters)).toEqual(
      `hello world is:open reason:completed no:milestone status:Ready,"In Progress",Backlog`,
    )
  })

  it('should correctly preserve other exclusive filter types (search, is, reason, no)', () => {
    const orderedTokenizedFilters = parseFullTextQuery(
      `hello world -is:open -reason:completed -no:milestone status:Ready,"In Progress",Backlog`,
    ).orderedTokenizedFilters
    expect(filtersToQuery(orderedTokenizedFilters)).toEqual(
      `hello world -is:open -reason:completed -no:milestone status:Ready,"In Progress",Backlog`,
    )
  })
})

describe('insertFilterIntoQuery', () => {
  it('should insert a new inclusive filter at the end of a query', () => {
    const query = insertFilterIntoQuery(`hello world status:Ready,"In Progress",Backlog`, 'label', 'bug')
    expect(query).toEqual(`hello world status:Ready,"In Progress",Backlog label:bug`)
  })

  it('should insert a new exclusive filter at the end of a query', () => {
    const query = insertFilterIntoQuery(`hello world status:Ready,"In Progress",Backlog`, '-label', 'bug')
    expect(query).toEqual(`hello world status:Ready,"In Progress",Backlog -label:bug`)
  })

  it('should insert a new value into an existing inclusive filter', () => {
    const query = insertFilterIntoQuery(`hello world status:"To Do","In Progress",Backlog`, 'status', 'Ready')
    expect(query).toEqual(`hello world status:"To Do","In Progress",Backlog,Ready`)
  })

  it('should insert a new value into an existing exclusive filter', () => {
    const query = insertFilterIntoQuery(`hello world -status:"To Do","In Progress",Backlog`, '-status', 'Ready')
    expect(query).toEqual(`hello world -status:"To Do","In Progress",Backlog,Ready`)
  })

  it('should remove an exclusive insertion from an inclusive filter', () => {
    const query = insertFilterIntoQuery(`hello world status:"To Do","In Progress",Backlog,Ready`, '-status', 'Ready')
    expect(query).toEqual(`hello world status:"To Do","In Progress",Backlog`)
  })

  it('should correctly diff complex exclusive/inclusive filters', () => {
    const query = insertFilterIntoQuery(
      `hello world status:"In Progress",Backlog,Ready -status:Ready,Backlog -status:Ready`,
      '-status',
      '"To do"',
    )
    expect(query).toEqual(`hello world status:"In Progress" -status:"To do"`)
  })

  it('should correctly remove all exclusive filters when compared with inclusive ones', () => {
    const query = insertFilterIntoQuery(
      `hello world status:"To do","In Progress",Backlog,Ready -status:Backlog,Ready`,
      '-status',
      '"In Progress"',
    )
    expect(query).toEqual(`hello world status:"To do"`)
  })
  // this ensures that an offset is applied when the inclusive filter is removed
  it('should update the exclusive filter index when the inclusive filter is removed and occurs before the exclusive filter', () => {
    const query = insertFilterIntoQuery(`status:Backlog -status:Ready`, '-status', 'Backlog')
    expect(query).toEqual(`-status:Ready`)
  })

  it('should support matching keys of different cases', () => {
    const query = insertFilterIntoQuery('status:Done', 'Status', 'Backlog')
    expect(query).toEqual(`status:Done,Backlog`)
  })

  it('should support matching values of different cases', () => {
    const query = insertFilterIntoQuery('-status:Done,backlog', '-status', 'Backlog', {
      // required to match columns with different cases
      columnOptions: ['Backlog', 'In Progress', 'Ready', 'Done'],
    })
    expect(query).toEqual(`-status:Done,Backlog`)
  })

  it('should when you add single exclusive filter to a single inclusive filter, it will be replaced', () => {
    const query = insertFilterIntoQuery('status:Backlog', '-status', 'Backlog')
    expect(query).toEqual(`-status:Backlog`)
  })
})

function trackedByColumnFixture() {
  return {
    dataType: MemexColumnDataType.TrackedBy,
    id: SystemColumnId.TrackedBy,
    databaseId: 10,
    name: 'Tracked by',
    position: 10,
    userDefined: false,
    defaultColumn: true,
  }
}

function labelsColumnFixture() {
  return {
    dataType: MemexColumnDataType.Labels,
    id: SystemColumnId.Labels,
    databaseId: 4,
    name: 'Labels',
    position: 4,
    userDefined: false,
    defaultColumn: true,
  }
}

function numberColumnFixture() {
  return {
    dataType: MemexColumnDataType.Number,
    id: CustomNumberColumnId,
    databaseId: 8,
    name: 'Estimate',
    position: 8,
    userDefined: true,
    defaultColumn: true,
  }
}

function dateColumnFixture() {
  return {
    dataType: MemexColumnDataType.Date,
    id: CustomDateColumnId,
    databaseId: 9,
    name: 'Due Date',
    position: 9,
    userDefined: true,
    defaultColumn: true,
  }
}

function assigneeColumnFixture() {
  return {
    dataType: MemexColumnDataType.Assignees,
    id: SystemColumnId.Assignees,
    databaseId: 2,
    name: 'Assignees',
    position: 2,
    userDefined: false,
    defaultColumn: true,
  }
}

function reviewersColumnFixture() {
  return {
    dataType: MemexColumnDataType.Reviewers,
    id: SystemColumnId.Reviewers,
    databaseId: 3,
    name: 'Reviewers',
    position: 3,
    userDefined: false,
    defaultColumn: false,
  }
}

function getDaysAgo(numberOfDays: number) {
  return new Date(new Date().setUTCDate(new Date().getUTCDate() - numberOfDays))
}
