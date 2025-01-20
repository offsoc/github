import {renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {useCountItemsWithColumnValue} from '../../../client/state-providers/column-values/use-count-items-with-column-value'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../../mocks/memex-items'
import {QueryClientWrapper} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useCountItemsWithColumnValue', () => {
  it('returns -1 if list of items is empty', () => {
    const {result} = renderHook(useCountItemsWithColumnValue, {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.getCountOfItemsWithColumnValue(1)).toEqual(0)
  })

  it('can count items with a custom field assigned', () => {
    const columnId = 12425242

    const firstItem = createMemexItemModel(DefaultOpenIssue)
    firstItem.setColumnValueForItemColumnType({
      memexProjectColumnId: columnId,
      value: {raw: 'some text', html: 'some text'},
    })

    const secondItem = createMemexItemModel(DefaultOpenPullRequest)

    const {result} = renderHook(useCountItemsWithColumnValue, {
      wrapper: createWrapperWithContexts({
        QueryClient: {memexItems: [firstItem, secondItem]},
      }),
    })

    expect(result.current.getCountOfItemsWithColumnValue(columnId)).toEqual(1)
  })

  it('can count items with a system field assigned', () => {
    const columnId = SystemColumnId.Status

    const firstItem = createMemexItemModel(DefaultOpenIssue)
    // clear the value from the first item as it appears to be set elsewhere
    firstItem.setColumnValueForItemColumnType({
      memexProjectColumnId: columnId,
      value: undefined,
    })

    const secondItem = createMemexItemModel(DefaultOpenPullRequest)
    // set the value on the second item
    secondItem.setColumnValueForItemColumnType({
      memexProjectColumnId: columnId,
      value: {id: '2424242'},
    })

    const {result} = renderHook(useCountItemsWithColumnValue, {
      wrapper: createWrapperWithContexts({
        QueryClient: {memexItems: [firstItem, secondItem]},
      }),
    })

    expect(result.current.getCountOfItemsWithColumnValue(columnId)).toEqual(1)
  })
})
