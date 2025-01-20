import {renderHook} from '@testing-library/react'

import {useMemexItemsQuery} from '../../../../client/state-providers/memex-items/queries/use-memex-items-query'
import {DefaultClosedIssue} from '../../../../mocks/memex-items'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {QueryClientWrapper} from '../../../test-app-wrapper'

describe('useMemexItemsQuery', () => {
  it('should initialize items read from "memex-items-data" JSON Island', () => {
    seedJSONIsland('memex-items-data', [DefaultClosedIssue])

    const {result} = renderHook(() => useMemexItemsQuery(), {
      wrapper: QueryClientWrapper,
    })
    const queryData = result.current.data

    expect(queryData?.pages[0].nodes).toHaveLength(1)
    expect(queryData?.pages[0].nodes[0].content.id).toEqual(DefaultClosedIssue.id)
  })
})
