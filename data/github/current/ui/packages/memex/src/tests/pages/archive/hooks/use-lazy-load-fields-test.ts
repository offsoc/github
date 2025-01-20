import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {type UseLazyLoadFields, useLazyLoadFields} from '../../../../client/pages/archive/hooks/use-lazy-load-fields'
import {DefaultColumns} from '../../../../mocks/mock-data'
import {createColumnsContext, stubAllColumnsRef} from '../../../mocks/state-providers/columns-context'
import {createWrapperWithContexts} from '../../../wrapper-utils'

const wrapper = createWrapperWithContexts({
  Columns: createColumnsContext({
    allColumns: [...stubAllColumnsRef(DefaultColumns).current],
  }),
})

test('marks initial fields as required and not loaded', () => {
  const {result} = renderHook(() => useLazyLoadFields({initialFields: [SystemColumnId.Title]}), {wrapper})
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title],
  })
})

test('can mark fields as loaded', () => {
  const {result} = renderHook(() => useLazyLoadFields({initialFields: [SystemColumnId.Title, SystemColumnId.Labels]}), {
    wrapper,
  })
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Labels],
  })
  act(() => result.current.markFieldsAsLoaded([SystemColumnId.Title]))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [SystemColumnId.Title],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Labels],
  })
  act(() => result.current.markFieldsAsLoaded([SystemColumnId.Labels]))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: true,
    loadedFields: [SystemColumnId.Title, SystemColumnId.Labels],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Labels],
  })
})

test('can mark fields as required and needing to be loaded', () => {
  const {result} = renderHook(() => useLazyLoadFields({initialFields: [SystemColumnId.Title]}), {wrapper})
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title],
  })
  act(() => result.current.addRequiredFieldsFromFilter('assignee:user1'))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Assignees],
  })
})

test('requiring a field twice does not change its loaded status', () => {
  const {result} = renderHook(() => useLazyLoadFields({initialFields: [SystemColumnId.Title]}), {wrapper})
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title],
  })
  act(() => result.current.addRequiredFieldsFromFilter('assignee:user1'))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Assignees],
  })
  act(() => result.current.addRequiredFieldsFromFilter('assignee:user1'))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title, SystemColumnId.Assignees],
  })
})

test('loading a field twice does not change its status', () => {
  const {result} = renderHook(() => useLazyLoadFields({initialFields: [SystemColumnId.Title]}), {wrapper})
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: false,
    loadedFields: [],
    requiredFields: [SystemColumnId.Title],
  })
  act(() => result.current.markFieldsAsLoaded([SystemColumnId.Title]))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: true,
    loadedFields: [SystemColumnId.Title],
    requiredFields: [SystemColumnId.Title],
  })
  act(() => result.current.markFieldsAsLoaded([SystemColumnId.Title]))
  expect(result.current).toMatchObject<Partial<UseLazyLoadFields>>({
    hasAllFieldsLoaded: true,
    loadedFields: [SystemColumnId.Title],
    requiredFields: [SystemColumnId.Title],
  })
})
