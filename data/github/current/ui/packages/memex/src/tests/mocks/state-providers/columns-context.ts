import type {MutableRefObject} from 'react'

import type {MemexColumn, MemexProjectColumnId} from '../../../client/api/columns/contracts/memex-column'
import {type ColumnModel, createColumnModel} from '../../../client/models/column-model'
import type {ColumnsContextType} from '../../../client/state-providers/columns/columns-state-provider'
import {stubFnReturnValue} from '../stub-utilities'

export function stubAllColumnsRef(columns: Array<MemexColumn>): ColumnsContextType['allColumnsRef'] {
  return stubAllColumnsRefWithColumnModels(columns.map(column => createColumnModel(column)))
}

export function stubAllColumnsRefWithColumnModels(
  columnModels: Array<ColumnModel>,
): ColumnsContextType['allColumnsRef'] {
  return {
    current: columnModels,
  }
}

export function stubReservedColumnNames(reservedNames: Array<string>): ColumnsContextType['reservedColumnNames'] {
  return reservedNames
}

export function stubSetAllColumnsFn() {
  return stubFnReturnValue<ColumnsContextType['setAllColumns']>(undefined)
}

export function createColumnsContext(mocks?: Partial<ColumnsContextType>): ColumnsContextType {
  const allColumnsRef: MutableRefObject<Array<ColumnModel>> = {
    current: [],
  }

  const loadedFieldIdsRef: MutableRefObject<Set<MemexProjectColumnId>> = {
    current: new Set([]),
  }

  return {
    reservedColumnNames: [],
    setAllColumns: jest.fn(),
    allColumnsRef,
    addLoadedFieldId: jest.fn(),
    loadedFieldIdsRef,
    allColumns: [],
    ...mocks,
  }
}
