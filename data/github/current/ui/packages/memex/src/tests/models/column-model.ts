import type {ColumnModel} from '../../client/models/column-model'
import {IterationColumnModel} from '../../client/models/column-model/custom/iteration'
import {SingleSelectColumnModel} from '../../client/models/column-model/custom/single-select'

export function assertSingleSelectColumnModel(column: ColumnModel): asserts column is SingleSelectColumnModel {
  expect(column).toBeInstanceOf(SingleSelectColumnModel)
}

export function assertIterationColumnModel(column: ColumnModel): asserts column is IterationColumnModel {
  expect(column).toBeInstanceOf(IterationColumnModel)
}
