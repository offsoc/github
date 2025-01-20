import {act, renderHook} from '@testing-library/react'

import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {createColumnsStableContext, stubLoadedFieldIdsRef} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useHasColumnData', () => {
  it('uses loadedFieldIdsRef to determine if id is present', () => {
    const loadedFieldIdsRefStub = stubLoadedFieldIdsRef(new Set([10, 20]))

    const {result} = renderHook(useHasColumnData, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({loadedFieldIdsRef: loadedFieldIdsRefStub}),
      ),
    })

    let hasData: boolean | undefined = undefined

    act(() => {
      hasData = result.current.hasColumnData(10)
    })

    expect(hasData).toBeTruthy()

    act(() => {
      hasData = result.current.hasColumnData(30)
    })

    expect(hasData).toBeFalsy()
  })
})
