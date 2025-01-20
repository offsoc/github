import {act, renderHook} from '@testing-library/react'

import type {ColumnModel} from '../../../client/models/column-model'
import {useFindColumnByDatabaseId} from '../../../client/state-providers/columns/use-find-column-by-database-id'
import {DefaultColumns} from '../../../mocks/mock-data'
import {stubAllColumnsRef} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useFindColumnByDatabaseId', () => {
  it('returns undefined for a database id not in the allColumns list', () => {
    const allColumnsStub = stubAllColumnsRef(DefaultColumns)

    const {result} = renderHook(useFindColumnByDatabaseId, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    let columnModel: ColumnModel | undefined = undefined
    act(() => {
      columnModel = result.current.findColumnByDatabaseId(-1)
    })

    expect(columnModel).toBeUndefined()
  })

  it('returns correct column model based on database id parameter', () => {
    const allColumnsStub = stubAllColumnsRef(DefaultColumns)

    const {result} = renderHook(useFindColumnByDatabaseId, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    let columnModel: ColumnModel | undefined = undefined
    act(() => {
      columnModel = result.current.findColumnByDatabaseId(DefaultColumns[0].databaseId)
    })

    expect(columnModel).toBeDefined()
    expect(columnModel!.name).toEqual(DefaultColumns[0].name)
  })
})
