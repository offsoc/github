import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {MemexColumnData} from '../../../client/api/columns/contracts/storage'
import {IssueState, MilestoneState} from '../../../client/api/common-contracts'
import {useSetColumnValue} from '../../../client/state-providers/column-values/use-set-column-value'
import {DefaultDraftIssue, DefaultOpenIssue} from '../../../mocks/memex-items'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {QueryClientWrapper} from '../../test-app-wrapper'

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({children}) => (
  <QueryClientWrapper>{children}</QueryClientWrapper>
)

describe('useSetColumnValue', () => {
  describe('setColumnValue', () => {
    it('should set a column value and call through', () => {
      const setColumnValueForItemColumnTypeStub = stubSetColumnValueForItemColumnType()
      const itemModel = createMemexItemModel(DefaultOpenIssue, {
        setColumnValueForItemColumnType: setColumnValueForItemColumnTypeStub,
      })

      const {result} = renderHook(useSetColumnValue, {wrapper: Wrapper})

      const expected = {
        memexProjectColumnId: SystemColumnId.Title,
        value: {
          number: 3,
          state: IssueState.Open,
          title: {html: 'updated title', raw: 'updated title'},
        },
      } as MemexColumnData

      act(() => {
        result.current.setColumnValue(itemModel, expected)
      })

      expect(setColumnValueForItemColumnTypeStub).toHaveBeenCalledTimes(1)
      expect(setColumnValueForItemColumnTypeStub).toHaveBeenCalledWith(expected)
    })

    it('should allow column updates to Assignees', () => {
      const setColumnValueForItemColumnTypeStub = stubSetColumnValueForItemColumnType()
      const itemModel = createMemexItemModel(DefaultDraftIssue, {
        setColumnValueForItemColumnType: setColumnValueForItemColumnTypeStub,
      })

      const {result} = renderHook(useSetColumnValue, {wrapper: Wrapper})

      const expected = {
        memexProjectColumnId: SystemColumnId.Assignees,
        value: [{id: 1, login: 'some-assignee', name: 'Somebody', avatarUrl: 'some-avatar-url'}],
      } as MemexColumnData

      act(() => {
        result.current.setColumnValue(itemModel, expected)
      })

      expect(setColumnValueForItemColumnTypeStub).toHaveBeenCalledTimes(1)
      expect(setColumnValueForItemColumnTypeStub).toHaveBeenCalledWith(expected)
    })

    it.each([
      {
        columnId: SystemColumnId.Milestone,
        value: {id: 1, title: 'some milestone', url: 'some-url', state: MilestoneState.Open},
      },
      {
        columnId: SystemColumnId.Labels,
        value: [{id: 1, name: 'foo', nameHtml: 'foo', color: 'red', url: 'some-url'}],
      },
    ])('should prevent column updates to $columnId', ({columnId, value}) => {
      const setColumnValueForItemColumnTypeStub = stubSetColumnValueForItemColumnType()
      const itemModel = createMemexItemModel(DefaultDraftIssue, {
        setColumnValueForItemColumnType: setColumnValueForItemColumnTypeStub,
      })

      const {result} = renderHook(useSetColumnValue, {wrapper: Wrapper})

      act(() => {
        result.current.setColumnValue(itemModel, {memexProjectColumnId: columnId, value} as MemexColumnData)
      })

      expect(setColumnValueForItemColumnTypeStub).not.toHaveBeenCalled()
    })
  })
})
