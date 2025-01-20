import type {IterationConfiguration} from '../../client/api/columns/contracts/iteration'
import type {ColumnData} from '../../client/api/columns/contracts/storage'
import {countAffectedIterationsUsed} from '../../client/helpers/options'
import {type ColumnModel, createColumnModel} from '../../client/models/column-model'
import {customColumnFactory} from '../factories/columns/custom-column-factory'

const testData = {
  iterationColumn: createColumnModel(
    customColumnFactory
      .iteration({
        configuration: {
          completedIterations: [],
          iterations: [
            {
              duration: 14,
              id: 'iteration-1',
              startDate: '2021-09-01',
              title: 'Iteration 1',
              titleHtml: 'Iteration 1',
            },
          ],
          duration: 14,
          startDay: 1,
        },
      })
      .build(),
  ),
}

describe('countAffectedIterationsUsed', () => {
  it('returns 0 if there are no items', () => {
    const changedIterations: Partial<IterationConfiguration> = {}
    const itemColumns: Array<ColumnData> = []
    expect(countAffectedIterationsUsed(testData.iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
  it('returns 0 if there are no iterations assigned', () => {
    const changedIterations: Partial<IterationConfiguration> = {}
    const itemColumns: Array<ColumnData> = [
      {
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              html: 'Test',
              raw: 'Test',
            },
          },
        },
      },
    ]
    expect(countAffectedIterationsUsed(testData.iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
  it('returns 0 items affected when an iteration is just updated', () => {
    const changedIterations: Partial<IterationConfiguration> = {
      iterations: [
        {
          duration: 14,
          id: 'iteration-1',
          startDate: '2021-09-01',
          title: 'Iteration 1',
          titleHtml: 'Iteration 1',
        },
      ],
    }
    const itemColumns: Array<ColumnData> = [
      {
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              html: 'Test',
              raw: 'Test',
            },
          },
        },
        [testData.iterationColumn.databaseId]: {
          id: 'iteration-1',
        },
      },
    ]
    expect(countAffectedIterationsUsed(testData.iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
  it('counts the number of items when an iteration is removed', () => {
    const changedIterations: Partial<IterationConfiguration> = {
      iterations: [],
    }
    const itemColumns: Array<ColumnData> = [
      {
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              html: 'Test',
              raw: 'Test',
            },
          },
        },
        [testData.iterationColumn.databaseId]: {
          id: 'iteration-1',
        },
      },
    ]
    expect(countAffectedIterationsUsed(testData.iterationColumn, changedIterations, itemColumns)).toBe(1)
  })
  it('returns 0 when an iteration is added', () => {
    const changedIterations: Partial<IterationConfiguration> = {
      iterations: [
        {
          duration: 14,
          id: 'iteration-1',
          startDate: '2021-09-01',
          title: 'Iteration 1',
          titleHtml: 'Iteration 1',
        },
        {
          duration: 14,
          id: 'iteration-2',
          startDate: '2021-09-15',
          title: 'Iteration 2',
          titleHtml: 'Iteration 2',
        },
      ],
    }
    const itemColumns: Array<ColumnData> = [
      {
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              html: 'Test',
              raw: 'Test',
            },
          },
        },
        [testData.iterationColumn.databaseId]: {
          id: 'iteration-1',
        },
      },
    ]
    expect(countAffectedIterationsUsed(testData.iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
  // regression test for https://github.com/github/memex/issues/15051
  it('returns 0 items affected if an iteration is moved from completed to active', () => {
    const iterationColumn: ColumnModel = {
      id: 32407045,
      databaseId: 32407045,
      name: 'Iteration',
      dataType: 'iteration',
      userDefined: true,
      defaultColumn: false,
      position: 1,
      settings: {
        width: 200,
        configuration: {
          duration: 14,
          iterations: [
            {
              id: '88c7f255',
              title: 'Iteration 2',
              titleHtml: 'Iteration 2',
              startDate: '2023-03-15',
              duration: 1,
            },
            {
              id: '7a00a9e5',
              title: 'Iteration 3',
              titleHtml: 'Iteration 3',
              startDate: '2023-03-16',
              duration: 14,
            },
          ],
          startDay: 2,
          completedIterations: [
            {
              id: 'db8b8913',
              title: 'Iteration 1',
              titleHtml: 'Iteration 1',
              startDate: '2023-01-12',
              duration: 1,
            },
          ],
        },
      },
    }
    const changedIterations: Partial<IterationConfiguration> = {
      duration: 14,
      iterations: [
        {
          id: 'db8b8913',
          title: 'Iteration 1',
          titleHtml: 'Iteration 1',
          startDate: '2023-01-12',
          duration: 50,
        },
        {
          id: '88c7f255',
          title: 'Iteration 2',
          titleHtml: 'Iteration 2',
          startDate: '2023-03-15',
          duration: 1,
        },
        {
          id: '7a00a9e5',
          title: 'Iteration 3',
          titleHtml: 'Iteration 3',
          startDate: '2023-03-16',
          duration: 14,
        },
      ],
      startDay: 2,
      completedIterations: [],
    }
    const itemColumns: Array<ColumnData> = [
      {
        '32407045': {
          id: 'db8b8913',
        },
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              raw: 'test',
              html: 'test',
            },
          },
        },
      },
    ]
    expect(countAffectedIterationsUsed(iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
  it('counts the number of items affected if a completed iteration is removed', () => {
    const iterationColumn: ColumnModel = {
      id: 32407045,
      databaseId: 32407045,
      name: 'Iteration',
      dataType: 'iteration',
      userDefined: true,
      defaultColumn: false,
      position: 1,
      settings: {
        width: 200,
        configuration: {
          duration: 14,
          iterations: [
            {
              id: '88c7f255',
              title: 'Iteration 2',
              titleHtml: 'Iteration 2',
              startDate: '2023-03-15',
              duration: 1,
            },
            {
              id: '7a00a9e5',
              title: 'Iteration 3',
              titleHtml: 'Iteration 3',
              startDate: '2023-03-16',
              duration: 14,
            },
          ],
          startDay: 2,
          completedIterations: [
            {
              id: 'db8b8913',
              title: 'Iteration 1',
              titleHtml: 'Iteration 1',
              startDate: '2023-01-12',
              duration: 1,
            },
          ],
        },
      },
    }
    const changedIterations: Partial<IterationConfiguration> = {
      duration: 14,
      iterations: [
        {
          id: '88c7f255',
          title: 'Iteration 2',
          titleHtml: 'Iteration 2',
          startDate: '2023-03-15',
          duration: 1,
        },
        {
          id: '7a00a9e5',
          title: 'Iteration 3',
          titleHtml: 'Iteration 3',
          startDate: '2023-03-16',
          duration: 14,
        },
      ],
      startDay: 2,
      completedIterations: [],
    }
    const itemColumns: Array<ColumnData> = [
      {
        '32407045': {
          id: 'db8b8913',
        },
        Title: {
          contentType: 'DraftIssue',
          value: {
            title: {
              raw: 'test',
              html: 'test',
            },
          },
        },
      },
    ]
    expect(countAffectedIterationsUsed(iterationColumn, changedIterations, itemColumns)).toBe(1)
  })

  // regression test for hhttps://github.com/github/memex/issues/15300
  it('returns 0 items affected if an iteration is moved from active to completed', () => {
    const iterationColumn: ColumnModel = {
      id: 100,
      name: 'Iteration 2',
      dataType: 'iteration',
      userDefined: true,
      databaseId: 100,
      position: 10,
      defaultColumn: true,
      settings: {
        width: 200,
        configuration: {
          startDay: 4,
          duration: 14,
          iterations: [
            {
              title: 'Iteration 2 1',
              startDate: '2024-05-16',
              duration: 14,
              id: 'iteration_option_0',
              titleHtml: 'Iteration 2 1',
            },
            {
              title: 'Iteration 2 2',
              startDate: '2024-05-30',
              duration: 14,
              id: 'iteration_option_1',
              titleHtml: 'Iteration 2 2',
            },
            {
              title: 'Iteration 2 3',
              startDate: '2024-06-13',
              duration: 14,
              id: 'iteration_option_2',
              titleHtml: 'Iteration 2 3',
            },
          ],
          completedIterations: [],
        },
      },
    }
    const changedIterations: Partial<IterationConfiguration> = {
      startDay: 4,
      duration: 14,
      iterations: [
        {
          title: 'Iteration 2 2',
          startDate: '2024-05-30',
          duration: 14,
          id: 'iteration_option_1',
          titleHtml: 'Iteration 2 2',
        },
        {
          title: 'Iteration 2 3',
          startDate: '2024-06-13',
          duration: 14,
          id: 'iteration_option_2',
          titleHtml: 'Iteration 2 3',
        },
      ],
      completedIterations: [
        {
          title: 'Iteration 2 1',
          startDate: '2024-05-01',
          duration: 15,
          id: 'iteration_option_0',
          titleHtml: 'Iteration 2 1',
        },
      ],
    }
    const itemColumns: Array<ColumnData> = [
      {
        '100': {id: 'iteration_option_0'},
        Title: {
          contentType: 'Issue',
          value: {
            number: 2,
            state: 'closed',
            title: {
              raw: "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!",
              html: "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!",
            },
            issueId: 2524242,
          },
        },
      },
    ]
    expect(countAffectedIterationsUsed(iterationColumn, changedIterations, itemColumns)).toBe(0)
  })
})
