import {act, renderHook} from '@testing-library/react'

import {useFindLoadedFieldIds} from '../../../client/state-providers/columns/use-find-loaded-field-ids'
import {createColumnsStableContext, stubLoadedFieldIdsRef} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useFindLoadedFieldIds', () => {
  it('calls through to ColumnsStableContext and turns into array', () => {
    const loadedFieldIdsRefStub = stubLoadedFieldIdsRef(new Set([1, 2, 3]))

    const {result} = renderHook(useFindLoadedFieldIds, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({loadedFieldIdsRef: loadedFieldIdsRefStub}),
      ),
    })

    act(() => {
      const loadedFieldIds = result.current.findLoadedFieldIds()
      expect(loadedFieldIds).toBeDefined()
      expect(loadedFieldIds).toEqual([1, 2, 3])
    })
  })
})
