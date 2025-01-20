import type {UpdateColumnValueAction} from '../../client/api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {PersistedOption} from '../../client/api/columns/contracts/single-select'
import {MilestoneState} from '../../client/api/common-contracts'
import {getDraftItemUpdateColumnAction} from '../../client/features/grouping/helpers'
import type {FieldGrouping, ParentIssueGrouping} from '../../client/features/grouping/types'

describe('useGroupedColumnUpdate', () => {
  describe('getDraftItemUpdateColumnAction', () => {
    describe('single select', () => {
      it('returns undefined when grouping is set and undefined group provided', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'empty',
          value: {
            titleHtml: 'No Column',
            columnId: 1234,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })

      it('returns expected value when grouping is set and grouping value is provided', () => {
        const backlog: PersistedOption = {
          id: '424242',
          name: 'Backlog',
          nameHtml: 'Backlog',
          description: 'Description',
          descriptionHtml: 'Description',
          color: 'BLUE',
        }
        expect(backlog).toBeDefined()

        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'group',
          value: {option: backlog, columnId: SystemColumnId.Status},
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId: SystemColumnId.Status,
          value: {id: sourceObject.value.option.id},
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })
    })

    describe('text', () => {
      it('returns undefined when grouping is set and undefined group provided', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Text,
          kind: 'empty',
          value: {
            titleHtml: 'No Column',
            columnId: 1234,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })

      it('returns expected value when grouping is set and grouping value is provided', () => {
        const textValue = {raw: 'Some text value', html: 'Some text value'}
        const columnId = 523535353

        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Text,
          kind: 'group',
          value: {
            text: textValue,
            columnId,
          },
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: columnId,
          value: textValue.raw,
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })
    })

    describe('number', () => {
      it('returns undefined when grouping is set and undefined group provided', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Number,
          kind: 'empty',
          value: {
            titleHtml: 'No Column',
            columnId: 1333,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })

      it('returns expected value when grouping is set and grouping value is provided', () => {
        const value = {value: 1234}
        const columnId = 5253355353

        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Number,
          kind: 'group',
          value: {
            number: value,
            columnId,
          },
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.Number,
          memexProjectColumnId: columnId,
          value,
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })

      it('returns undefined value when grouping is set and grouping value is not a number', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Number,
          kind: 'empty',
          value: {
            titleHtml: 'Group Name',
            columnId: 1232132,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })
    })
    describe('milestone', () => {
      it('returns the correct default group-by value for the milestone field', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Milestone,
          kind: 'group',
          value: {
            id: 2,
            title: 'v0.1 - Prioritized Lists?',
            url: 'https://github.com/github/memex/milestone/2',
            state: MilestoneState.Open,
            repoNameWithOwner: 'github/memex',
          },
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.Milestone,
          value: sourceObject.value,
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })
    })

    describe('date', () => {
      it('returns undefined when grouping is set and undefined group provided', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Date,
          kind: 'empty',
          value: {
            titleHtml: 'No Column',
            columnId: 123232,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })

      it('returns expected value when grouping is set and grouping value is provided', () => {
        const dateValue = {value: new Date('2020-01-01')}
        const columnId = 24252523452

        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Date,
          kind: 'group',
          value: {
            date: dateValue,
            columnId,
          },
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: columnId,
          value: dateValue,
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })

      it('returns undefined value when grouping is set and grouping value is not a number', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.Date,
          kind: 'empty',
          value: {
            titleHtml: 'Group Name',
            columnId: 12113,
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })
    })

    describe('parent issue', () => {
      it('returns undefined when grouping is set and undefined group provided', () => {
        const sourceObject: FieldGrouping = {
          dataType: MemexColumnDataType.ParentIssue,
          kind: 'empty',
          value: {
            titleHtml: 'No parent issue',
          },
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toBeUndefined()
      })

      it('returns expected value when grouping is set and grouping value is provided', () => {
        const sourceObject: ParentIssueGrouping = {
          dataType: MemexColumnDataType.ParentIssue,
          kind: 'group',
          value: {
            id: 123,
            globalRelayId: 'I_123',
            number: 213,
            nwoReference: 'github/github#123',
            owner: 'github',
            repository: 'github',
            state: 'open',
            title: 'Parent',
            url: 'github.com',
            subIssueList: {total: 1, completed: 0, percentCompleted: 0},
          },
        }

        const expected: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.ParentIssue,
          value: sourceObject.value,
        }

        expect(getDraftItemUpdateColumnAction(sourceObject)).toMatchObject(expected)
      })
    })
  })
})
