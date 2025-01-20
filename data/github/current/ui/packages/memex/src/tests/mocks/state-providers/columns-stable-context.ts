import type {MutableRefObject} from 'react'

import type {MemexProjectColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../client/models/column-model'
import type {ColumnsStableContextType} from '../../../client/state-providers/columns/columns-state-provider'
import {stubFnReturnValue} from '../stub-utilities'

export function stubAddLoadedFieldId() {
  return stubFnReturnValue<ColumnsStableContextType['addLoadedFieldId']>(undefined)
}

export function stubLoadedFieldIdsRef(
  loadedFieldIds: Set<MemexProjectColumnId>,
): ColumnsStableContextType['loadedFieldIdsRef'] {
  return {
    current: loadedFieldIds,
  }
}

export function createColumnsStableContext(mocks?: Partial<ColumnsStableContextType>): ColumnsStableContextType {
  const allColumnsRef: MutableRefObject<Array<ColumnModel>> = {
    current: [],
  }

  const loadedFieldIdsRef: MutableRefObject<Set<MemexProjectColumnId>> = {
    current: new Set([]),
  }

  return {
    setAllColumns: jest.fn(),
    allColumnsRef,
    addLoadedFieldId: jest.fn(),
    loadedFieldIdsRef,
    ...mocks,
  }
}
