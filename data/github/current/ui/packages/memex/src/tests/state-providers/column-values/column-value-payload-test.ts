import type {UpdateColumnValueAction} from '../../../client/api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {IAssignee, Label, Milestone} from '../../../client/api/common-contracts'
import {mapToLocalUpdate, mapToRemoteUpdate} from '../../../client/state-providers/column-values/column-value-payload'
import {getLabel} from '../../../mocks/data/labels'
import {getMilestoneByRepository} from '../../../mocks/data/milestones'
import {getRepository} from '../../../mocks/data/repositories'
import {statusOptions} from '../../../mocks/data/single-select'
import {getUser} from '../../../mocks/data/users'

describe('mapping actions to update payload', () => {
  const actions = [
    {
      action: {
        dataType: MemexColumnDataType.Assignees,
        value: [getUser('stephenotalora')],
      },
      expectedColumnId: SystemColumnId.Assignees,
    },
    {
      action: {
        dataType: MemexColumnDataType.Labels,
        value: [getLabel(22)],
      },
      expectedColumnId: SystemColumnId.Labels,
    },
    {
      action: {
        dataType: MemexColumnDataType.Milestone,
        value: getMilestoneByRepository(1, 2),
      },
      expectedColumnId: SystemColumnId.Milestone,
    },
    {
      action: {
        dataType: MemexColumnDataType.Title,
        value: {title: 'memex'},
      },
      expectedColumnId: SystemColumnId.Title,
    },
  ]

  describe('mapToLocalUpdate', () => {
    it.each(actions)(
      'should return the correct payload for the "$action.dataType" action',
      ({action, expectedColumnId}) => {
        const {value} = action
        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: expectedColumnId,
          value,
        })
      },
    )

    it.each([
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: 4,
        value: {id: statusOptions[0].id},
      },
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: SystemColumnId.Status,
        value: {id: statusOptions[1].id},
      },
      {
        dataType: MemexColumnDataType.Iteration,
        memexProjectColumnId: 5,
        value: {id: '1'},
      },
    ])('should return the correct payload for the "$dataType"', action => {
      const {memexProjectColumnId, value} = action

      expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
        memexProjectColumnId,
        value,
      })
    })

    describe(`with ${MemexColumnDataType.Repository} action`, () => {
      it('should return the correct payload', () => {
        const action = {
          dataType: MemexColumnDataType.Repository,
          value: getRepository(1),
        }

        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: SystemColumnId.Repository,
          value: action.value,
        })
      })

      it('should assign null to the payload value when the action value is falsy', () => {
        const action = {
          dataType: MemexColumnDataType.Repository,
          value: undefined,
        }

        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: SystemColumnId.Repository,
          value: null,
        })
      })
    })

    describe(`with ${MemexColumnDataType.Text} action`, () => {
      it(`should return the correct payload`, () => {
        const action = {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: 1,
          value: 'memex',
        }

        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: {raw: action.value, html: action.value},
        })
      })

      it(`should assign undefined to the payload value when the action value is falsy`, () => {
        const action = {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: 1,
          value: undefined,
        }

        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: undefined,
        })
      })
    })

    describe(`with ${MemexColumnDataType.Date} action`, () => {
      it(`should return the correct payload`, () => {
        const action = {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: 1,
          value: {value: new Date('2022-02-15')},
        }

        const {value} = action.value
        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: {value: value.toISOString().slice(0, 10)},
        })
      })

      it(`should assign undefined to the payload value when the action value is falsy`, () => {
        const action = {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: 1,
          value: undefined,
        }

        expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: undefined,
        })
      })
    })

    it(`should return the correct payload for the "${MemexColumnDataType.Number}" action`, () => {
      const action = {
        dataType: MemexColumnDataType.Number,
        memexProjectColumnId: 1,
        value: {value: 10},
      }

      expect(mapToLocalUpdate(action as UpdateColumnValueAction)).toEqual({
        memexProjectColumnId: action.memexProjectColumnId,
        value: action.value,
      })
    })
  })

  describe('mapToRemoteUpdate', () => {
    it.each([
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: 4,
        value: {id: statusOptions[0].id},
      },
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: SystemColumnId.Status,
        value: {id: statusOptions[1].id},
      },
      {
        dataType: MemexColumnDataType.Iteration,
        memexProjectColumnId: 5,
        value: {id: '1'},
      },
    ])('should return the correct payload for the "$dataType" action', action => {
      const {memexProjectColumnId, value} = action

      expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
        memexProjectColumnId,
        value: value.id,
      })
    })

    it.each([
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: 4,
        value: undefined,
      },
      {
        dataType: MemexColumnDataType.SingleSelect,
        memexProjectColumnId: SystemColumnId.Status,
        value: undefined,
      },
      {
        dataType: MemexColumnDataType.Iteration,
        memexProjectColumnId: 5,
        value: undefined,
      },
    ])(
      'should assign an empty string to the payload value for the "$dataType" action when the action value is falsy',
      action => {
        const {memexProjectColumnId} = action

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId,
          value: '',
        })
      },
    )

    it(`should return the correct payload for the "${MemexColumnDataType.Assignees}" action`, () => {
      const [ASSIGNEES_ACTION] = actions
      const {action, expectedColumnId} = ASSIGNEES_ACTION
      const assignees = action.value as Array<IAssignee>

      expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
        memexProjectColumnId: expectedColumnId,
        value: [assignees[0].id],
      })
    })

    it(`should return the correct payload for the "${MemexColumnDataType.Labels}" action`, () => {
      const [, LABELS_ACTION] = actions
      const {action, expectedColumnId} = LABELS_ACTION
      const labels = action.value as Array<Label>

      expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
        memexProjectColumnId: expectedColumnId,
        value: [labels[0].id],
      })
    })

    describe(`with ${MemexColumnDataType.Milestone} action`, () => {
      it(`should return the correct payload`, () => {
        const [, , MILESTONE_ACTION] = actions
        const {action, expectedColumnId} = MILESTONE_ACTION
        const milestone = action.value as Milestone

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: expectedColumnId,
          value: milestone.id,
        })
      })

      it(`should assign an empty string to the payload value when the action value is falsy`, () => {
        const [, , MILESTONE_ACTION] = actions
        const {action, expectedColumnId} = MILESTONE_ACTION

        expect(mapToRemoteUpdate({...action, value: undefined} as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: expectedColumnId,
          value: '',
        })
      })
    })

    describe(`with ${MemexColumnDataType.Number} action`, () => {
      it('should return the correct payload', () => {
        const action = {
          dataType: MemexColumnDataType.Number,
          memexProjectColumnId: 1,
          value: {value: 10},
        }

        const {value} = action.value
        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value,
        })
      })

      it(`should assign an empty string to the payload value when the action value is falsy`, () => {
        const action = {
          dataType: MemexColumnDataType.Number,
          memexProjectColumnId: 1,
          value: undefined,
        }

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: '',
        })
      })
    })

    describe(`with ${MemexColumnDataType.Date} action`, () => {
      it('should return the correct payload', () => {
        const action = {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: 1,
          value: {value: new Date('2022-02-15')},
        }

        const {value} = action.value
        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: value.toISOString(),
        })
      })

      it('should assign an empty string to the payload value when the action value is falsy', () => {
        const action = {
          dataType: MemexColumnDataType.Date,
          memexProjectColumnId: 1,
          value: undefined,
        }

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: '',
        })
      })
    })

    describe(`with ${MemexColumnDataType.Title} action`, () => {
      it(`should return the correct payload`, () => {
        const action: UpdateColumnValueAction = {
          dataType: MemexColumnDataType.Title,
          value: {title: {raw: 'memex', html: 'memex'}},
        }

        expect(mapToRemoteUpdate(action)).toEqual({
          memexProjectColumnId: SystemColumnId.Title,
          value: {title: 'memex'},
        })
      })

      it('should use the raw title when the title value is enriched text', () => {
        const action = {
          dataType: MemexColumnDataType.Title,
          value: {title: {raw: 'memex', html: 'should not be used'}},
        }

        const {value} = action
        const result = mapToRemoteUpdate(action as UpdateColumnValueAction)

        expect(result!.value).not.toEqual({title: value.title.html})
        expect(result).toEqual({
          memexProjectColumnId: SystemColumnId.Title,
          value: {title: value.title.raw},
        })
      })
    })

    describe(`with ${MemexColumnDataType.Text} action`, () => {
      it(`should return the correct payload`, () => {
        const action = {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: 10,
          value: 'memex',
        }

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: action.value,
        })
      })

      it('should assign an empty string to the payload value when the action value is falsy', () => {
        const action = {
          dataType: MemexColumnDataType.Text,
          memexProjectColumnId: 10,
          value: undefined,
        }

        expect(mapToRemoteUpdate(action as UpdateColumnValueAction)).toEqual({
          memexProjectColumnId: action.memexProjectColumnId,
          value: '',
        })
      })
    })
  })
})
