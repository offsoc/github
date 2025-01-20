import type {Iteration} from '../../client/api/columns/contracts/iteration'
import {type MemexColumn, MemexColumnDataType} from '../../client/api/columns/contracts/memex-column'
import {compareAscending} from '../../client/helpers/iterations'
import {createColumnModel} from '../../client/models/column-model'
import {
  buildVerticalGroupForIteration,
  buildVerticalGroupForOption,
  getVerticalGroupsForField,
} from '../../client/models/vertical-group'

const otherColumValues: Omit<MemexColumn, 'dataType' | 'name'> = {
  id: 1234,
  userDefined: false,
  position: -1,
  databaseId: 56768,
  defaultColumn: true,
}

describe('VerticalGroup', () => {
  it('returns empty array when no field specified', () => {
    expect(getVerticalGroupsForField()).toHaveLength(0)
  })

  describe('for single-select fields', () => {
    const singleSelectData: MemexColumn = {
      ...otherColumValues,
      dataType: MemexColumnDataType.SingleSelect,
      name: 'Status',
      settings: {
        ...otherColumValues.settings,
        options: [],
      },
    }

    it('returns one group when field does not have settings', () => {
      const singleSelectField = createColumnModel(singleSelectData)

      expect(getVerticalGroupsForField(singleSelectField)).toMatchObject([
        {
          id: 'no_vertical_group',
          name: 'No Status',
          nameHtml: 'No Status',
          groupMetadata: undefined,
        },
      ])
    })

    it('returns a group for each option when found', () => {
      const option = {
        id: 'first',
        name: 'First option',
        nameHtml: 'First option as HTML',
        description: 'Description',
        descriptionHtml: 'Description',
        color: 'BLUE',
      } as const

      const singleSelectField = createColumnModel({
        ...singleSelectData,
        settings: {
          options: [option],
        },
      })

      expect(getVerticalGroupsForField(singleSelectField)).toMatchObject([
        {
          id: 'no_vertical_group',
          name: 'No Status',
          nameHtml: 'No Status',
          groupMetadata: undefined,
        },

        buildVerticalGroupForOption(option),
      ])
    })

    it('matches order of options in settings', () => {
      const options = [
        {
          id: 'to-do',
          name: 'ToDo',
          nameHtml: 'ToDo as HTML',
          description: 'Description',
          descriptionHtml: 'Description',
          color: 'BLUE',
        },

        {
          id: 'doing',
          name: 'Doing',
          nameHtml: 'Doing as HTML',
          description: 'Description',
          descriptionHtml: 'Description',
          color: 'GREEN',
        },

        {
          id: 'done',
          name: 'Done',
          nameHtml: 'Done as HTML',
          description: 'Description',
          descriptionHtml: 'Description',
          color: 'RED',
        },
      ] as const

      const singleSelectField = createColumnModel({
        ...singleSelectData,
        settings: {
          options: [...options],
        },
      })

      expect(getVerticalGroupsForField(singleSelectField)).toMatchObject([
        {
          id: 'no_vertical_group',
          name: 'No Status',
          nameHtml: 'No Status',
          groupMetadata: undefined,
        },

        ...options.map(o => buildVerticalGroupForOption(o)),
      ])
    })
  })

  describe('for iteration fields', () => {
    const iterationData: MemexColumn = {
      ...otherColumValues,
      dataType: MemexColumnDataType.Iteration,
      name: 'Sprint',
      settings: {
        configuration: {
          startDay: 1,
          duration: 7,
          iterations: [],
          completedIterations: [],
        },
      },
    }

    const expectedEmptyGroup = {
      id: 'no_vertical_group',
      name: 'No Sprint',
      nameHtml: 'No Sprint',
      groupMetadata: undefined,
    }

    it('returns one group when no iterations are found', () => {
      const iterationField = createColumnModel(iterationData)

      expect(getVerticalGroupsForField(iterationField)).toMatchObject([expectedEmptyGroup])
    })

    it('returns a group for each planned option when found', () => {
      const iterations = [
        {
          id: 'first',
          title: 'First iteration',
          titleHtml: 'First iteration as HTML',
          startDate: '2021-12-01',
          duration: 7,
        },
      ]

      const iterationField = createColumnModel({
        ...iterationData,
        settings: {
          configuration: {
            startDay: 1,
            duration: 7,
            iterations,
            completedIterations: [],
          },
        },
      })

      const expectedGroups = iterations.map(buildVerticalGroupForIteration)

      expect(getVerticalGroupsForField(iterationField)).toMatchObject([expectedEmptyGroup, ...expectedGroups])
    })

    it('returns a group for only the three most recent completed iterations or all iterations depending on the flag', () => {
      const completedIterations = [
        {
          id: 'first',
          title: 'First iteration',
          titleHtml: 'First iteration as HTML',
          startDate: '2021-10-01',
          duration: 7,
        },

        {
          id: 'second',
          title: 'Second iteration',
          titleHtml: 'Second iteration as HTML',
          startDate: '2021-10-08',
          duration: 7,
        },

        {
          id: 'third',
          title: 'Third iteration',
          titleHtml: 'Third iteration as HTML',
          startDate: '2021-10-15',
          duration: 7,
        },

        {
          id: 'fourth',
          title: 'Fourth iteration',
          titleHtml: 'Fourth iteration as HTML',
          startDate: '2021-10-22',
          duration: 7,
        },
      ]

      const iterationField = createColumnModel({
        ...iterationData,
        settings: {
          configuration: {
            startDay: 1,
            duration: 7,
            iterations: [],
            completedIterations,
          },
        },
      })

      // the first iteration is the earliest one and should be removed when filtering
      const expectedGroups = completedIterations.slice(1).map(buildVerticalGroupForIteration)

      expect(getVerticalGroupsForField(iterationField)).toMatchObject([expectedEmptyGroup, ...expectedGroups])
      expect(getVerticalGroupsForField(iterationField, {includeAllCompletedIterations: true})).toMatchObject([
        expectedEmptyGroup,
        ...completedIterations.map(buildVerticalGroupForIteration),
      ])
    })

    it('returns groups in expected order - no iteration, then by start date of iteration', () => {
      const completedIterations: Array<Iteration> = [
        {
          id: 'first',
          title: 'First iteration',
          titleHtml: 'First iteration as HTML',
          startDate: '2021-11-01',
          duration: 7,
        },

        {
          id: 'second',
          title: 'Second iteration',
          titleHtml: 'Second iteration as HTML',
          startDate: '2021-11-08',
          duration: 7,
        },

        {
          id: 'third',
          title: 'Third iteration',
          titleHtml: 'Third iteration as HTML',
          startDate: '2021-11-15',
          duration: 7,
        },

        {
          id: 'fourth',
          title: 'Fourth iteration',
          titleHtml: 'Fourth iteration as HTML',
          startDate: '2021-11-22',
          duration: 7,
        },
      ]

      // these entries are out of order to ensure the client does sort them
      // correctly
      const iterations: Array<Iteration> = [
        {
          id: 'next',
          title: 'Next iteration',
          titleHtml: 'Next iteration as HTML',
          startDate: '2021-12-06',
          duration: 7,
        },

        {
          id: 'current',
          title: 'Current iteration',
          titleHtml: 'Current iteration as HTML',
          startDate: '2021-11-29',
          duration: 7,
        },

        {
          id: 'next-next',
          title: 'Next Next iteration',
          titleHtml: ' Next iteration as HTML',
          startDate: '2021-12-13',
          duration: 7,
        },
      ]

      const iterationField = createColumnModel({
        ...iterationData,
        settings: {
          configuration: {
            startDay: 1,
            duration: 7,
            iterations,
            completedIterations,
          },
        },
      })

      // the first iteration is the earliest one and should be removed when filtering
      const expectedGroups = [...completedIterations.slice(1), ...iterations]
        .sort(compareAscending)
        .map(buildVerticalGroupForIteration)

      expect(getVerticalGroupsForField(iterationField)).toMatchObject([expectedEmptyGroup, ...expectedGroups])
    })
  })

  describe('not supported cases', () => {
    it('throws an error for assignees field', () => {
      const assigneesData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Assignees,
        name: 'Assignees',
      }

      const assigneesField = createColumnModel(assigneesData)

      expect(() => getVerticalGroupsForField(assigneesField)).toThrow(
        'Unable to obtain vertical groups for field type: assignees',
      )
    })

    it('throws an error for milestone field', () => {
      const milestoneData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Milestone,
        name: 'Milestone',
      }

      const milestoneField = createColumnModel(milestoneData)

      expect(() => getVerticalGroupsForField(milestoneField)).toThrow(
        'Unable to obtain vertical groups for field type: milestone',
      )
    })

    it('throws an error for labels field', () => {
      const labelsData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Labels,
        name: 'Labels',
      }

      const labelsField = createColumnModel(labelsData)

      expect(() => getVerticalGroupsForField(labelsField)).toThrow(
        'Unable to obtain vertical groups for field type: labels',
      )
    })

    it('throws an error for linked pull requests field', () => {
      const linkedPullRequestsData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.LinkedPullRequests,
        name: 'Linked pull requests',
      }

      const linkedPullRequestsField = createColumnModel(linkedPullRequestsData)

      expect(() => getVerticalGroupsForField(linkedPullRequestsField)).toThrow(
        'Unable to obtain vertical groups for field type: linkedPullRequests',
      )
    })

    it('throws an error for title field', () => {
      const titleData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Title,
        name: 'Title',
      }

      const titleField = createColumnModel(titleData)

      expect(() => getVerticalGroupsForField(titleField)).toThrow(
        'Unable to obtain vertical groups for field type: title',
      )
    })

    it('throws an error for text field', () => {
      const textData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Text,
        name: 'Custom text',
      }

      const textField = createColumnModel(textData)

      expect(() => getVerticalGroupsForField(textField)).toThrow(
        'Unable to obtain vertical groups for field type: text',
      )
    })

    it('throws an error for number field', () => {
      const numberData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Number,
        name: 'Custom number',
      }

      const numberField = createColumnModel(numberData)

      expect(() => getVerticalGroupsForField(numberField)).toThrow(
        'Unable to obtain vertical groups for field type: number',
      )
    })

    it('throws an error for date field', () => {
      const dateData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.Date,
        name: 'Custom date',
      }

      const dateField = createColumnModel(dateData)

      expect(() => getVerticalGroupsForField(dateField)).toThrow(
        'Unable to obtain vertical groups for field type: date',
      )
    })

    it('throws an error for issue type field', () => {
      const issueTypeData: MemexColumn = {
        ...otherColumValues,
        dataType: MemexColumnDataType.IssueType,
        name: 'Type',
      }

      const issueTypeField = createColumnModel(issueTypeData)

      expect(() => getVerticalGroupsForField(issueTypeField)).toThrow(
        'Unable to obtain vertical groups for field type: issueType',
      )
    })
  })
})
