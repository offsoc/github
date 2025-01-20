import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../client/models/column-model'
import {useFindColumn} from '../../../client/state-providers/columns/use-find-column'
import {DefaultColumns} from '../../../mocks/mock-data'
import {stubAllColumnsRef} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useFindColumn', () => {
  describe('findColumn', () => {
    it('returns undefined for a id not in the allColumns list', () => {
      const allColumnsStub = stubAllColumnsRef(DefaultColumns)

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      let columnModel: ColumnModel | undefined = undefined
      act(() => {
        columnModel = result.current.findColumn(-1)
      })

      expect(columnModel).toBeUndefined()
    })

    it('returns correct column model based on id parameter', () => {
      const allColumnsStub = stubAllColumnsRef(DefaultColumns)

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      let columnModel: ColumnModel | undefined = undefined
      act(() => {
        columnModel = result.current.findColumn(DefaultColumns[0].id)
      })

      expect(columnModel).toBeDefined()
      expect(columnModel).toMatchObject({name: DefaultColumns[0].name})
    })

    it('returns correct column model based on System column id parameter', () => {
      const allColumnsStub = stubAllColumnsRef(DefaultColumns)

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      let columnModel: ColumnModel | undefined = undefined
      act(() => {
        columnModel = result.current.findColumn(SystemColumnId.Assignees)
      })

      expect(columnModel).toBeDefined()
      expect(columnModel).toMatchObject({name: 'Assignees'})
    })
  })

  describe('findColumnIndex', () => {
    it('returns -1 for a column not found in the allColumns list', () => {
      const allColumnsStub = stubAllColumnsRef([])

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      let columnIndex: number | undefined = undefined

      act(() => {
        columnIndex = result.current.findColumnIndex(DefaultColumns[0].id)
      })

      expect(columnIndex).toBe(-1)
    })

    it('returns correct column index based on column id parameter', () => {
      const allColumnsStub = stubAllColumnsRef(DefaultColumns)

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      const expectedIndex = 0
      let columnIndex: number | undefined = undefined

      act(() => {
        columnIndex = result.current.findColumnIndex(DefaultColumns[expectedIndex].id)
      })

      expect(columnIndex).toBe(expectedIndex)
    })

    it('returns correct column index based on System column id parameter', () => {
      const allColumnsStub = stubAllColumnsRef(DefaultColumns)

      const {result} = renderHook(useFindColumn, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
      })

      let columnIndex: number | undefined = undefined

      act(() => {
        columnIndex = result.current.findColumnIndex(SystemColumnId.Assignees)
      })

      expect(columnIndex).toBe(1)
    })
  })
})
