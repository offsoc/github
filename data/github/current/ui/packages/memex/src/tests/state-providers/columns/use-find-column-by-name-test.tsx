import {act, renderHook} from '@testing-library/react'

import type {ColumnModel} from '../../../client/models/column-model'
import {useFindColumnByName} from '../../../client/state-providers/columns/use-find-column-by-name'
import {DefaultColumns} from '../../../mocks/mock-data'
import {stubAllColumnsRef} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useFindColumnByName', () => {
  it('returns undefined for a name not in the allColumns list', () => {
    const allColumnsStub = stubAllColumnsRef(DefaultColumns)

    const {result} = renderHook(useFindColumnByName, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    let columnModel: ColumnModel | undefined = undefined
    act(() => {
      columnModel = result.current.findColumnByName('Invalid column name')
    })

    expect(columnModel).toBeUndefined()
  })

  it('returns correct column model based on name parameter', () => {
    const allColumnsStub = stubAllColumnsRef(DefaultColumns)

    const {result} = renderHook(useFindColumnByName, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    let columnModel: ColumnModel | undefined = undefined
    act(() => {
      columnModel = result.current.findColumnByName(DefaultColumns[0].name)
    })

    expect(columnModel).toBeDefined()
    expect(columnModel!.id).toEqual(DefaultColumns[0].id)
  })
})
