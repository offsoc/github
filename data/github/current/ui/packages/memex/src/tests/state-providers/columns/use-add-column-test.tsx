import {act, renderHook} from '@testing-library/react'

import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {useAddColumn} from '../../../client/state-providers/columns/use-add-column'
import {stageColumn, titleColumn} from '../../../mocks/data/columns'
import {stubCreateColumn} from '../../mocks/api/columns'
import {stubAllColumnsRef, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext, stubAddLoadedFieldId} from '../../mocks/state-providers/columns-stable-context'
import {defaultProjectDetails, existingProject, setProjectContext} from '../memex/helpers'
import {createWrapperWithProjectAndColumnsStableContext, expectMockWasCalledWithColumns} from './helpers'

describe('useAddColumn', () => {
  it('calls column client and updates all columns', async () => {
    stubCreateColumn(stageColumn)

    const allColumnsStub = stubAllColumnsRef([titleColumn])
    const setAllColumnsStub = stubSetAllColumnsFn()

    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const {result} = renderHook(useAddColumn, {
      wrapper: createWrapperWithProjectAndColumnsStableContext(
        setProjectContext(),
        existingProject(),
        defaultProjectDetails(),
        createColumnsStableContext({
          addLoadedFieldId: addLoadedFieldIdStub,
          allColumnsRef: allColumnsStub,
          setAllColumns: setAllColumnsStub,
        }),
      ),
    })

    await act(async () => {
      const {newColumn} = await result.current.addColumn({
        name: 'New column!',
        type: MemexColumnDataType.Text,
        settings: undefined,
      })

      expect(newColumn.id).toEqual(stageColumn.id)
    })

    expectMockWasCalledWithColumns(setAllColumnsStub, [titleColumn, stageColumn])
    expect(addLoadedFieldIdStub).toHaveBeenCalledWith(stageColumn.id)
  })
})
