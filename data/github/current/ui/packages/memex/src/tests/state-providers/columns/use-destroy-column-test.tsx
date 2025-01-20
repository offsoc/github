import {act, renderHook} from '@testing-library/react'

import {useDestroyColumn} from '../../../client/state-providers/columns/use-destroy-column'
import {stageColumn, titleColumn} from '../../../mocks/data/columns'
import {stubDestroyColumn} from '../../mocks/api/columns'
import {stubAllColumnsRef, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext, expectMockWasCalledWithColumns} from './helpers'

describe('useDestroyColumn', () => {
  it('calls client to destroy column and updates all columns to not have this column', async () => {
    const allColumnsStub = stubAllColumnsRef([titleColumn, stageColumn])
    const setAllColumnsStub = stubSetAllColumnsFn()
    const destroyColumnStub = stubDestroyColumn()

    const {result} = renderHook(useDestroyColumn, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
      ),
    })

    await act(async () => {
      await result.current.destroyColumn(stageColumn.id.toString())
    })

    expectMockWasCalledWithColumns(setAllColumnsStub, [titleColumn])
    expect(destroyColumnStub).toHaveBeenCalledWith({memexProjectColumnId: stageColumn.id})
  })
})
