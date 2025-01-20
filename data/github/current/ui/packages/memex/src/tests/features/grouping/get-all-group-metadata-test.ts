import {addDays} from 'date-fns'

import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {buildGroupingConfiguration} from '../../../client/features/grouping/grouping-metadata-configurations'
import type {
  AssigneesGrouping,
  GroupingMetadataWithSource,
  IterationGrouping,
  LabelsGrouping,
  SingleSelectGrouping,
} from '../../../client/features/grouping/types'
import {formatFullDate} from '../../../client/helpers/iterations'
import {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import {SingleSelectColumnModel} from '../../../client/models/column-model/custom/single-select'
import {AssigneesColumnModel} from '../../../client/models/column-model/system/assignees'
import {LabelsColumnModel} from '../../../client/models/column-model/system/labels'
import {createMemexItemModel, type MemexItemModel} from '../../../client/models/memex-item-model'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'

describe('getAllGroupMetadata', () => {
  it('getGroupValuesForSingleSelect', () => {
    const column = customColumnFactory
      .singleSelect({
        optionNames: ['Todo', 'Done'],
      })
      .build({name: 'Stage'})
    const columnModel = new SingleSelectColumnModel(column)

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['singleSelect']
    const groupingMetadataWithSource = groupingConfiguration.getAllGroupMetadata!(columnModel)
    const firstOption = column.settings!.options![0]
    const secondOption = column.settings!.options![1]
    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: firstOption.id,
        sourceObject: {
          dataType: 'singleSelect',
          kind: 'group',
          value: {
            columnId: column.id,
            option: firstOption,
          },
        } as SingleSelectGrouping,
      },
      {
        value: secondOption.id,
        sourceObject: {
          dataType: 'singleSelect',
          kind: 'group',
          value: {
            columnId: column.id,
            option: secondOption,
          },
        } as SingleSelectGrouping,
      },
    ]

    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)
  })

  it('getGroupValuesForIteration', () => {
    const today = new Date()
    const firstIteration = {
      id: 'iteration-7',
      title: 'Iteration 7',
      startDate: formatFullDate(today),
      titleHtml: 'Iteration 7',
      duration: 14,
    }

    const secondIteration = {
      id: 'iteration-8',
      title: 'Iteration 8',
      startDate: formatFullDate(addDays(today, 14)),
      titleHtml: 'Iteration 8',
      duration: 14,
    }

    const configuration: IterationConfiguration = {
      startDay: today.getDay() === 0 ? 7 : today.getDay(),
      duration: 14,
      iterations: [firstIteration, secondIteration],
      completedIterations: [],
    }

    const column = customColumnFactory
      .iteration({
        configuration,
      })
      .build({name: 'Iteration'})
    const columnModel = new IterationColumnModel(column)

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['iteration']
    const groupingMetadataWithSource = groupingConfiguration.getAllGroupMetadata!(columnModel)
    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: firstIteration.id,
        sourceObject: {
          dataType: 'iteration',
          kind: 'group',
          value: {
            columnId: column.id,
            iteration: firstIteration,
          },
        } as IterationGrouping,
      },
      {
        value: secondIteration.id,
        sourceObject: {
          dataType: 'iteration',
          kind: 'group',
          value: {
            columnId: column.id,
            iteration: secondIteration,
          },
        } as IterationGrouping,
      },
    ]

    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)
  })

  it('getGroupValuesForAssignees', () => {
    const column = systemColumnFactory.assignees().build()
    const columnModel = new AssigneesColumnModel(column)

    const columnValue1 = columnValueFactory.assignees(['user5', 'user2']).build()
    const item1 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const columnValue2 = columnValueFactory.assignees(['user3', 'user5', 'user1']).build()
    const item2 = createMemexItemModel(issueFactory.withColumnValues([columnValue2]).build())
    const item3 = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['assignees']
    const groupingMetadataWithSource = groupingConfiguration.getAllGroupMetadata!(columnModel, [item1, item2, item3])

    const [user1, user3, user5] = item2.getAssignees()
    const [user2, _] = item1.getAssignees()

    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: 'user1',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [user1],
        } satisfies AssigneesGrouping,
      },
      {
        value: 'user2',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [user2],
        } satisfies AssigneesGrouping,
      },
      {
        value: 'user3',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [user3],
        } satisfies AssigneesGrouping,
      },
      {
        value: 'user5',
        sourceObject: {
          dataType: 'assignees',
          kind: 'group',
          value: [user5],
        } satisfies AssigneesGrouping,
      },
    ]

    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)
  })

  it('getGroupValuesForLabels', () => {
    const column = systemColumnFactory.labels().build()
    const columnModel = new LabelsColumnModel(column)

    const columnValue1 = columnValueFactory.labels(['label5', 'label2']).build()
    const item1 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const columnValue2 = columnValueFactory.labels(['label3', 'label5', 'label1']).build()
    const item2 = createMemexItemModel(issueFactory.withColumnValues([columnValue2]).build())
    const item3 = createMemexItemModel(issueFactory.build())

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['labels']
    const groupingMetadataWithSource = groupingConfiguration.getAllGroupMetadata!(columnModel, [item1, item2, item3])

    const [label1, label3, label5] = item2.getLabels()
    const [label2, _] = item1.getLabels()

    const expectedGroupingMetadataWithSource: Array<GroupingMetadataWithSource> = [
      {
        value: 'label1',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: label1,
        } satisfies LabelsGrouping,
      },
      {
        value: 'label2',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: label2,
        } satisfies LabelsGrouping,
      },
      {
        value: 'label3',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: label3,
        } satisfies LabelsGrouping,
      },
      {
        value: 'label5',
        sourceObject: {
          dataType: 'labels',
          kind: 'group',
          value: label5,
        } satisfies LabelsGrouping,
      },
    ]

    expect(groupingMetadataWithSource).toMatchObject(expectedGroupingMetadataWithSource)
  })
})
