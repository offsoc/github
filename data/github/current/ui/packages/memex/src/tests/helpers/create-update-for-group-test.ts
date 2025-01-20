import type {Iteration} from '../../client/api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {PersistedOption} from '../../client/api/columns/contracts/single-select'
import {
  type ExtendedRepository,
  type IssueType,
  type Milestone,
  MilestoneState,
  type User,
} from '../../client/api/common-contracts'
import {createUpdateForGroup} from '../../client/features/grouping/helpers'
import type {FieldGrouping} from '../../client/features/grouping/types'
import {
  ComplexFeatureTrackedItem,
  OldBugTrackedItem,
  StyleNitpickTrackedItem,
} from '../../mocks/memex-items/tracked-issues'
import {columnValueFactory} from '../factories/column-values/column-value-factory'
import {issueFactory} from '../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../mocks/models/memex-item-model'

describe('createUpdateForGroup', () => {
  describe('assignees', () => {
    const assignee: User = {
      id: 123,
      global_relay_id: 'MDQ6VXN',
      login: 'shiftkey',
      avatarUrl: 'some-url',
      name: 'shiftkey',
      isSpammy: false,
    }

    it('creates update for valid group', () => {
      const issue = issueFactory.build()
      const issueModel = createMemexItemModel(issue)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Assignees,
        kind: 'group',
        value: [assignee],
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Assignees,
        value: [assignee],
      })
    })

    it('merges assignees if feature flag is enabled', () => {
      const issue = issueFactory
        .withColumnValues([columnValueFactory.assignees(['dmarcey', 'j0siepy']).build()])
        .build()
      const issueModel = createMemexItemModel(issue)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Assignees,
        kind: 'group',
        value: [assignee],
      }

      const output = createUpdateForGroup(input, issueModel.columns, {memex_group_by_multi_value_changes: true})

      expect(output).toMatchObject({
        dataType: MemexColumnDataType.Assignees,
      })

      expect(output.value).toHaveLength(3)
    })

    it('creates update for empty group', () => {
      const issue = issueFactory.build()
      const issueModel = createMemexItemModel(issue)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Assignees,
        kind: 'empty',
        value: {
          titleHtml: 'Something goes here',
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Assignees,
        value: [],
      })
    })

    it('clears assignees if feature flag enabled and row dropped onto empty group', () => {
      const issue = issueFactory
        .withColumnValues([columnValueFactory.assignees(['dmarcey', 'j0siepy']).build()])
        .build()
      const issueModel = createMemexItemModel(issue)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Assignees,
        kind: 'empty',
        value: {
          titleHtml: 'Something goes here',
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns, {memex_group_by_multi_value_changes: true})

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Assignees,
        value: [],
      })
    })
  })

  describe('date', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const memexProjectColumnId = 24324242

    it('creates update for valid group', () => {
      const value = new Date(2022, 10, 4)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Date,
        kind: 'group',
        value: {
          date: {value},
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Date,
        memexProjectColumnId,
        value: {value},
      })
    })
    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Date,
        kind: 'empty',
        value: {
          titleHtml: 'Some title whatever',
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Date,
        memexProjectColumnId,
        value: undefined,
      })
    })
  })

  describe('iteration', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const memexProjectColumnId = 24324242

    const iteration: Iteration = {
      id: 'sagddsgdgs',
      title: 'Sprint 2',
      titleHtml: 'Sprint 2',
      startDate: '2022-01-01',
      duration: 7,
    }

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Iteration,
        kind: 'group',
        value: {
          iteration,
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Iteration,
        memexProjectColumnId,
        value: {id: iteration.id},
      })
    })
    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Iteration,
        kind: 'empty',
        value: {
          titleHtml: 'No Iteration',
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Iteration,
        memexProjectColumnId,
        value: undefined,
      })
    })
  })

  describe('milestone', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const milestone: Milestone = {
      id: 242424,
      title: 'Sprint 2',
      state: MilestoneState.Open,
      url: 'https://github.com/github/memex/milestone/1',
      repoNameWithOwner: 'github/memex',
    }

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Milestone,
        kind: 'group',
        value: milestone,
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Milestone,
        value: milestone,
      })
    })

    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Milestone,
        kind: 'empty',
        value: {
          titleHtml: 'No iteration',
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Milestone,
        value: undefined,
      })
    })
  })

  describe('issue type', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const issueType: IssueType = {
      id: 242424,
      name: 'Bug',
      color: 'RED',
    }

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.IssueType,
        kind: 'group',
        value: issueType,
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.IssueType,
        value: issueType,
      })
    })

    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.IssueType,
        kind: 'empty',
        value: {
          titleHtml: 'No iteration',
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.IssueType,
        value: undefined,
      })
    })
  })

  describe('number', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const memexProjectColumnId = 24324242
    const numberValue = 42424

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Number,
        kind: 'group',
        value: {
          columnId: memexProjectColumnId,
          number: {value: numberValue},
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Number,
        memexProjectColumnId,
        value: {value: numberValue},
      })
    })

    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Number,
        kind: 'empty',
        value: {
          titleHtml: 'No number',
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Number,
        memexProjectColumnId,
        value: undefined,
      })
    })
  })

  describe('repository', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const repository: ExtendedRepository = {
      id: 242424,
      name: 'memex',
      nameWithOwner: 'github/memex',
      url: 'https://github.com/github/memex',
      hasIssues: true,
      isArchived: false,
      isForked: false,
      isPublic: false,
    }

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Repository,
        kind: 'group',
        value: repository,
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Repository,
        value: repository,
      })
    })

    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Repository,
        kind: 'empty',
        value: {
          titleHtml: 'No Repository',
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Repository,
        value: undefined,
      })
    })
  })

  describe('single-select', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const option: PersistedOption = {
      id: 'gadgds',
      name: 'First',
      nameHtml: 'First',
      description: 'Description',
      descriptionHtml: 'Description',
      color: 'BLUE',
    }
    describe('custom field', () => {
      const memexProjectColumnId = 24324242

      it('creates update for valid group', () => {
        const input: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'group',
          value: {
            columnId: memexProjectColumnId,
            option,
          },
        }

        const output = createUpdateForGroup(input, issueModel.columns)

        expect(output).toStrictEqual({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId,
          value: {id: option.id},
        })
      })

      it('creates update for empty group', () => {
        const input: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'empty',
          value: {
            titleHtml: 'No Single Select',
            columnId: memexProjectColumnId,
          },
        }

        const output = createUpdateForGroup(input, issueModel.columns)

        expect(output).toStrictEqual({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId,
          value: undefined,
        })
      })
    })

    describe('system field', () => {
      it('creates update for valid group', () => {
        const input: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'group',
          value: {
            columnId: SystemColumnId.Status,
            option,
          },
        }

        const output = createUpdateForGroup(input, issueModel.columns)

        expect(output).toStrictEqual({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId: SystemColumnId.Status,
          value: {id: option.id},
        })
      })

      it('creates update for empty group', () => {
        const input: FieldGrouping = {
          dataType: MemexColumnDataType.SingleSelect,
          kind: 'empty',
          value: {
            titleHtml: 'No Status',
            columnId: SystemColumnId.Status,
          },
        }

        const output = createUpdateForGroup(input, issueModel.columns)

        expect(output).toStrictEqual({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId: SystemColumnId.Status,
          value: undefined,
        })
      })
    })
  })

  describe('text', () => {
    const issue = issueFactory.build()
    const issueModel = createMemexItemModel(issue)

    const memexProjectColumnId = 24324242
    const textValue = 'Some value'

    it('creates update for valid group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Text,
        kind: 'group',
        value: {
          columnId: memexProjectColumnId,
          text: {raw: textValue, html: 'Some other value'},
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Text,
        memexProjectColumnId,
        value: textValue,
      })
    })

    it('creates update for empty group', () => {
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.Text,
        kind: 'empty',
        value: {
          titleHtml: 'No text',
          columnId: memexProjectColumnId,
        },
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.Text,
        memexProjectColumnId,
        value: undefined,
      })
    })
  })

  describe('tracked by', () => {
    it('creates update for valid group', () => {
      const issue = issueFactory.build()
      const issueModel = createMemexItemModel(issue)
      const input: FieldGrouping = {
        dataType: MemexColumnDataType.TrackedBy,
        kind: 'group',
        value: OldBugTrackedItem,
      }

      const output = createUpdateForGroup(input, issueModel.columns)

      expect(output).toStrictEqual({
        dataType: MemexColumnDataType.TrackedBy,
        value: [OldBugTrackedItem],
        appendOnly: false,
      })
    })

    it('merges tracked-by if ctrl key is pressed', () => {
      const issue = issueFactory
        .withColumnValues([columnValueFactory.trackedBy([ComplexFeatureTrackedItem, StyleNitpickTrackedItem]).build()])
        .build()
      const issueModel = createMemexItemModel(issue)

      const input: FieldGrouping = {
        dataType: MemexColumnDataType.TrackedBy,
        kind: 'group',
        value: OldBugTrackedItem,
      }

      const output = createUpdateForGroup(input, issueModel.columns, {ctrlKeyPressed: true})

      expect(output).toMatchObject({
        dataType: MemexColumnDataType.TrackedBy,
      })

      expect(output.value).toHaveLength(3)
    })

    it('creates update by removing source tracked by group if ctrl key is not pressed', () => {
      const issue = issueFactory
        .withColumnValues([columnValueFactory.trackedBy([ComplexFeatureTrackedItem, StyleNitpickTrackedItem]).build()])
        .build()
      const issueModel = createMemexItemModel(issue)

      const targetGroup: FieldGrouping = {
        dataType: MemexColumnDataType.TrackedBy,
        kind: 'group',
        value: OldBugTrackedItem,
      }

      const sourceGroup: FieldGrouping = {
        dataType: MemexColumnDataType.TrackedBy,
        kind: 'group',
        value: ComplexFeatureTrackedItem,
      }

      const output = createUpdateForGroup(targetGroup, issueModel.columns, {}, sourceGroup)

      expect(output).toMatchObject({
        dataType: MemexColumnDataType.TrackedBy,
      })

      expect(output.value).toHaveLength(2)
      expect(output.value).toMatchObject([OldBugTrackedItem, StyleNitpickTrackedItem])
    })
  })
})
