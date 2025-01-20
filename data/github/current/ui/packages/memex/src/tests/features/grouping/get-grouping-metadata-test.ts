import invariant from 'tiny-invariant'

import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {
  type ExtendedRepository,
  IssueState,
  IssueStateReason,
  type Label,
  type Milestone,
  MilestoneState,
  type ParentIssue,
  type User,
} from '../../../client/api/common-contracts'
import type {TrackedByItem} from '../../../client/api/issues-graph/contracts'
import {getGroupingMetadataFromServerGroupValue} from '../../../client/features/grouping/get-grouping-metadata'
import {buildGroupingConfiguration} from '../../../client/features/grouping/grouping-metadata-configurations'
import type {
  AssigneesGrouping,
  DateGrouping,
  FieldGrouping,
  GroupingMetadataWithSource,
  IssueTypeGrouping,
  IterationGrouping,
  MilestoneGrouping,
  NumberGrouping,
  ParentIssueGrouping,
  RepositoryGrouping,
  SingleSelectGrouping,
  TextGrouping,
  TrackedByGrouping,
} from '../../../client/features/grouping/types'
import {formatFullDate} from '../../../client/helpers/iterations'
import {createColumnModel} from '../../../client/models/column-model'
import type {DateColumnModel} from '../../../client/models/column-model/custom/date'
import type {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import type {NumberColumnModel} from '../../../client/models/column-model/custom/number'
import type {SingleSelectColumnModel} from '../../../client/models/column-model/custom/single-select'
import type {TextColumnModel} from '../../../client/models/column-model/custom/text'
import type {AssigneesColumnModel} from '../../../client/models/column-model/system/assignees'
import type {LabelsColumnModel} from '../../../client/models/column-model/system/labels'
import type {MilestoneColumnModel} from '../../../client/models/column-model/system/milestone'
import type {RepositoryColumnModel} from '../../../client/models/column-model/system/repository'
import type {MemexItemModel} from '../../../client/models/memex-item-model'
import {todayISOString} from '../../../mocks/data/dates'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'

const repository: ExtendedRepository = {
  hasIssues: true,
  id: 1,
  name: 'Repo1',
  nameWithOwner: 'github/Repo1',
  url: '',
  isArchived: false,
  isForked: false,
  isPublic: true,
}

const milestone: Milestone = {
  title: 'Milestone 1',
  id: 1,
  state: MilestoneState.Open,
  url: '',
  repoNameWithOwner: 'github/memex',
}

describe('getGroupingMetadata', () => {
  it('getAssigneesGroupingMetadata', () => {
    const column = systemColumnFactory.assignees().build()
    const columnModel = createColumnModel(column)
    const assignees = ['user1', 'user2']

    const columnValue = columnValueFactory.assignees(assignees).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['assignees']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: 'user1_user2',
      sourceObject: {
        dataType: 'assignees',
        kind: 'group',
        value: columnValue.value as Array<User>,
      } as AssigneesGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getAssigneesGroupingMetadata with useDistinctAssigneesGrouping', () => {
    const column = systemColumnFactory.assignees().build()
    const columnModel = createColumnModel(column)
    const assignees = ['user2', 'user1']

    const columnValue = columnValueFactory.assignees(assignees).build()
    const sourceValues = columnValue.value as Array<User>

    invariant(sourceValues.length === 2, 'Must have two column values')

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns, {
      useDistinctAssigneesGrouping: true,
    })['assignees']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: 'user1',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [sourceValues[0]],
        },
      },
      {
        value: 'user2',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [sourceValues[1]],
        },
      },
    ]

    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getDateGroupingMetadata', () => {
    const column = customColumnFactory.date().build({name: 'Start Date'})
    const columnModel = createColumnModel(column)
    const date = todayISOString

    const columnValue = columnValueFactory.date(date, column.name, [columnModel]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['date']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: date,
      sourceObject: {
        dataType: 'date',
        kind: 'group',
        value: {
          columnId: column.id,
          date: {
            value: new Date(date),
          },
        },
      } as DateGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getIterationGroupingMetadata', () => {
    const today = new Date()
    const iteration = {
      id: 'iteration-7',
      title: 'Iteration 7',
      startDate: formatFullDate(today),
      titleHtml: 'Iteration 7',
      duration: 14,
    }

    const configuration: IterationConfiguration = {
      startDay: today.getDay() === 0 ? 7 : today.getDay(),
      duration: 14,
      iterations: [iteration],
      completedIterations: [],
    }

    const column = customColumnFactory
      .iteration({
        configuration,
      })
      .build({name: 'Iteration'})
    const columnModel = createColumnModel(column)

    const columnValue = columnValueFactory.iteration(iteration.title, column.name, [columnModel]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['iteration']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: iteration.id,
      sourceObject: {
        dataType: 'iteration',
        kind: 'group',
        value: {
          columnId: column.id,
          iteration,
        },
      } as IterationGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getMilestoneGroupingMetadata', () => {
    const column = systemColumnFactory.milestone().build()
    const columnModel = createColumnModel(column)

    const columnValue = columnValueFactory.milestone(milestone).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['milestone']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: milestone.title,
      sourceObject: {
        dataType: 'milestone',
        kind: 'group',
        value: milestone,
      } as MilestoneGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getGroupValuesForIssueTypes', () => {
    const column = systemColumnFactory.issueType().build()
    const columnModel = createColumnModel(column)

    const bug = {
      name: 'bug',
      id: 1,
      description: 'Bug',
    }

    const columnValue = columnValueFactory.issueType(bug).build()
    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)[
      MemexColumnDataType.IssueType
    ]
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)

    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: bug.name,
      sourceObject: {
        dataType: MemexColumnDataType.IssueType,
        kind: 'group',
        value: bug,
      } satisfies IssueTypeGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getGroupValuesForParentIssues', () => {
    const column = systemColumnFactory.parentIssue().build()
    const columnModel = createColumnModel(column)

    const nwoReference = 'github/sriracha-4#10'

    const parentIssue = {
      id: 1,
      number: 10,
      title: 'Parent One',
      state: 'open',
      nwoReference,
      url: 'http://github.localhost:80/github/sriracha-4/issues/14',
    } as ParentIssue

    const columnValue = columnValueFactory.parentIssue(parentIssue).build()
    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)[
      MemexColumnDataType.ParentIssue
    ]
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)

    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: nwoReference,
      sourceObject: {
        dataType: MemexColumnDataType.ParentIssue,
        kind: 'group',
        value: parentIssue,
      } satisfies ParentIssueGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getNumberGroupingMetadata', () => {
    const column = customColumnFactory.number().build({name: 'Points'})
    const columnModel = createColumnModel(column)
    const number = 15

    const columnValue = columnValueFactory.number(number, column.name, [columnModel]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['number']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: number.toString(),
      sourceObject: {
        dataType: 'number',
        kind: 'group',
        value: {
          columnId: column.id,
          number: {
            value: number,
          },
        },
      } as NumberGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getRepositoryGroupingMetadata', () => {
    const column = systemColumnFactory.repository().build()
    const columnModel = createColumnModel(column)

    const columnValue = columnValueFactory.repository(repository).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['repository']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: repository.nameWithOwner,
      sourceObject: {
        dataType: 'repository',
        kind: 'group',
        value: repository,
      } as RepositoryGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getSingleSelectGroupingMetadata', () => {
    const column = customColumnFactory
      .singleSelect({
        optionNames: ['Todo', 'Done'],
      })
      .build({name: 'Stage'})
    const columnModel = createColumnModel(column)

    const columnValue = columnValueFactory.singleSelect('Todo', column.name, [columnModel]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['singleSelect']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const option = column.settings!.options![0]
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: option.id,
      sourceObject: {
        dataType: 'singleSelect',
        kind: 'group',
        value: {
          columnId: column.id,
          option,
        },
      } as SingleSelectGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getTextGroupingMetadata', () => {
    const column = customColumnFactory.text().build({name: 'Team'})
    const columnModel = createColumnModel(column)
    const textValue = 'textValue1'

    const columnValue = columnValueFactory.text(textValue, column.name, [columnModel]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['text']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: textValue,
      sourceObject: {
        dataType: 'text',
        kind: 'group',
        value: {
          columnId: column.id,
          text: {
            html: textValue,
            raw: textValue,
          },
        },
      } as TextGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getTrackedByGroupingMetadata', () => {
    const column = systemColumnFactory.trackedBy().build()
    const columnModel = createColumnModel(column)

    const trackedByItem1: TrackedByItem = {
      key: {ownerId: 1, itemId: 1, primaryKey: {uuid: '1234-5678-9012-3456'}},
      state: IssueState.Closed,
      title: 'test',
      url: 'example.com',
      repoName: 'memex',
      repoId: 1,
      userName: 'github',
      number: 123,
      labels: [],
      assignees: [],
      stateReason: IssueStateReason.Completed,
      completion: undefined,
    }

    const columnValue = columnValueFactory.trackedBy([trackedByItem1]).build()

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['trackedBy']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)
    const expectedGroupingMetadataWithSource: GroupingMetadataWithSource = {
      value: trackedByItem1.url,
      sourceObject: {
        dataType: 'trackedBy',
        kind: 'group',
        value: trackedByItem1,
      } as TrackedByGrouping,
    }

    expect(groupingMetadataWithSource).toMatchObject([expectedGroupingMetadataWithSource])

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  it('getLabelsGroupingMetadata', () => {
    const column = systemColumnFactory.labels().build()
    const columnModel = createColumnModel(column)
    const labels = ['tech debt', 'enhancement']

    const columnValue = columnValueFactory.labels(labels).build()
    const sourceValues = columnValue.value as Array<Label>

    invariant(sourceValues.length === 2, 'Must have two column values')

    const issueWithValue = createMemexItemModel(issueFactory.withColumnValues([columnValue]).build())
    const issueWithoutValue = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['labels']
    const groupingMetadataWithSource = groupingConfiguration.getGroupingMetadata(columnModel, issueWithValue)

    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: 'tech debt',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: sourceValues[0],
        },
      },
      {
        value: 'enhancement',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: sourceValues[1],
        },
      },
    ]
    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)

    expect(groupingConfiguration.getGroupingMetadata(columnModel, issueWithoutValue)).toBeUndefined()
  })

  describe('getGroupingMetadataFromServerGroupValue', () => {
    it('for groupValue of "_noValue"', () => {
      const column = customColumnFactory
        .singleSelect({
          optionNames: ['Todo', 'Done'],
        })
        .build({name: 'Stage'})
      const columnModel = createColumnModel(column) as SingleSelectColumnModel
      const expectedMetadata: FieldGrouping = {
        dataType: 'singleSelect',
        kind: 'empty',
        value: {
          columnId: columnModel.id,
          titleHtml: 'No Stage',
        },
      }

      const metadata = getGroupingMetadataFromServerGroupValue(columnModel, '_noValue')
      expect(metadata).toMatchObject(expectedMetadata)
    })

    describe('for assignees', () => {
      const columnModel = systemColumnFactory.assignees().build() as AssigneesColumnModel
      it('returns server-side group metadata', () => {
        const assignees = columnValueFactory.assignees(['talune']).build().value as Array<User>

        const expectedMetadata: FieldGrouping = {
          dataType: 'assignees',
          kind: 'group',
          value: assignees,
        }

        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'talune', assignees[0])
        expect(metadata).toMatchObject(expectedMetadata)
      })
      it('return undefined if no server-side metadata is provided', () => {
        expect(getGroupingMetadataFromServerGroupValue(columnModel, 'talune')).toBeUndefined()
      })
    })

    it('for date', () => {
      const column = customColumnFactory.date().build({name: 'Start Date'})
      const columnModel = createColumnModel(column) as DateColumnModel
      const dateObject = new Date()

      const expectedMetadata: FieldGrouping = {
        dataType: 'date',
        kind: 'group',
        value: {
          columnId: columnModel.id,
          date: {
            value: dateObject,
          },
        },
      }

      const metadata = getGroupingMetadataFromServerGroupValue(columnModel, dateObject.valueOf().toString())
      expect(metadata).toMatchObject(expectedMetadata)
    })

    describe('for issueType', () => {
      const columnModel = systemColumnFactory.issueType().build() as AssigneesColumnModel
      it('returns server-side group metadata', () => {
        const bugType = {name: 'bug', id: 1, description: ''}
        const expectedMetadata: FieldGrouping = {
          dataType: 'issueType',
          kind: 'group',
          value: bugType,
        }

        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'bug', bugType)
        expect(metadata).toMatchObject(expectedMetadata)
      })
      it('returns undefined if no server-side metadata is provided', () => {
        expect(getGroupingMetadataFromServerGroupValue(columnModel, 'bug')).toBeUndefined()
      })
    })

    describe('for iteration', () => {
      const today = new Date()
      const iteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [iteration],
        completedIterations: [],
      }

      const column = customColumnFactory
        .iteration({
          configuration,
        })
        .build()
      const columnModel = createColumnModel(column) as IterationColumnModel

      const expectedMetadata: FieldGrouping = {
        dataType: 'iteration',
        kind: 'group',
        value: {
          columnId: columnModel.id,
          iteration,
        },
      }

      it('derives iteration client-side from groupValue', () => {
        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'Iteration 7')
        expect(metadata).toMatchObject(expectedMetadata)
      })

      it('returns server-side group metadata', () => {
        const serverMetadata = getGroupingMetadataFromServerGroupValue(columnModel, 'Iteration 7', iteration)
        expect(serverMetadata).toMatchObject(expectedMetadata)
      })
    })

    describe('for label', () => {
      const column = systemColumnFactory.labels().build() as LabelsColumnModel
      const columnModel = createColumnModel(column)
      it('returns server-side group metadata', () => {
        const labels = columnValueFactory.labels(['tech debt']).build().value as Array<Label>

        const expectedMetadata: FieldGrouping = {
          dataType: 'labels',
          kind: 'group',
          value: labels[0],
        }

        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'tech debt', labels[0])
        expect(metadata).toMatchObject(expectedMetadata)
      })
      it('returns undefined if no server-side metadata is provided', () => {
        expect(getGroupingMetadataFromServerGroupValue(columnModel, 'tech debt')).toBeUndefined()
      })
    })

    describe('for milestone', () => {
      const column = systemColumnFactory.milestone().build() as MilestoneColumnModel
      const columnModel = createColumnModel(column)

      it('returns server-side group metadata', () => {
        const expectedMetadata: FieldGrouping = {
          dataType: 'milestone',
          kind: 'group',
          value: milestone,
        }

        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, milestone.title, milestone)
        expect(metadata).toMatchObject(expectedMetadata)
      })
      it('returns undefined if no server-side metadata is provided', () => {
        expect(getGroupingMetadataFromServerGroupValue(columnModel, milestone.title)).toBeUndefined()
      })
    })

    it('for number', () => {
      const column = customColumnFactory.number().build()
      const columnModel = createColumnModel(column) as NumberColumnModel

      const expectedMetadata: FieldGrouping = {
        dataType: 'number',
        kind: 'group',
        value: {
          columnId: columnModel.id,
          number: {
            value: 1.0,
          },
        },
      }

      const metadata = getGroupingMetadataFromServerGroupValue(columnModel, '1.0')
      expect(metadata).toMatchObject(expectedMetadata)
    })

    describe('for repository', () => {
      const columnModel = systemColumnFactory.repository().build() as RepositoryColumnModel

      it('returns server-side group metadata', () => {
        const expectedMetadata: FieldGrouping = {
          dataType: 'repository',
          kind: 'group',
          value: repository,
        }

        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, repository.nameWithOwner, repository)
        expect(metadata).toMatchObject(expectedMetadata)
      })
      it('returns undefined if no server-side metadata is provided', () => {
        expect(getGroupingMetadataFromServerGroupValue(columnModel, repository.nameWithOwner)).toBeUndefined()
      })
    })

    describe('for single select', () => {
      const column = customColumnFactory
        .singleSelect({
          optionNames: ['Todo', 'Done'],
        })
        .build()
      const columnModel = createColumnModel(column) as SingleSelectColumnModel
      const option = columnModel.settings.options[0]

      const expectedMetadata: FieldGrouping = {
        dataType: 'singleSelect',
        kind: 'group',
        value: {
          columnId: columnModel.id,
          option,
        },
      }

      it('derives option client-side from groupValue', () => {
        const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'Todo')
        expect(metadata).toMatchObject(expectedMetadata)
      })

      it('returns server-side group metadata', () => {
        const serverMetadata = getGroupingMetadataFromServerGroupValue(columnModel, 'Todo', option)
        expect(serverMetadata).toMatchObject(expectedMetadata)
      })
    })

    it('for text', () => {
      const column = customColumnFactory.text().build()
      const columnModel = createColumnModel(column) as TextColumnModel

      const expectedMetadata: FieldGrouping = {
        dataType: 'text',
        kind: 'group',
        value: {
          columnId: columnModel.id,
          text: {
            html: 'Text Value',
            raw: 'Text Value',
          },
        },
      }

      const metadata = getGroupingMetadataFromServerGroupValue(columnModel, 'Text Value')
      expect(metadata).toMatchObject(expectedMetadata)
    })
  })
})
