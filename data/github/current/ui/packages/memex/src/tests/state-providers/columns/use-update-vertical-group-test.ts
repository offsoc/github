import {renderHook} from '@testing-library/react'

import {emptySingleSelectOption} from '../../../client/helpers/new-column'
import {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import {SingleSelectColumnModel} from '../../../client/models/column-model/custom/single-select'
import {TitleColumnModel} from '../../../client/models/column-model/system/title'
import {useUpdateColumnIterationTitle} from '../../../client/state-providers/columns/use-update-column-iteration-title'
import {useUpdateOptions} from '../../../client/state-providers/columns/use-update-options'
import {useUpdateVerticalGroup} from '../../../client/state-providers/columns/use-update-vertical-group'
import {customIterationColumn, titleColumn} from '../../../mocks/data/columns'
import {createColumnWithOptions, createOptions} from '../../mocks/models/column-options'
import {asMockHook} from '../../mocks/stub-utilities'

// we've tested these hooks independently
// so we don't have to test their implementation again
jest.mock('../../../client/state-providers/columns/use-update-options')
jest.mock('../../../client/state-providers/columns/use-update-column-iteration-title')

describe('useUpdateVerticalGroup', () => {
  describe('updateVerticalGroup', () => {
    it('should update the column option details if the column data type is `SingleSelect`', async () => {
      const [optionA] = createOptions([{...emptySingleSelectOption, name: 'A', color: 'YELLOW', description: 'a'}])

      const column = new SingleSelectColumnModel(createColumnWithOptions([]))
      const updateColumnOptionStub = jest.fn().mockResolvedValue(undefined)
      const updateColumnIterationTitleStub = jest.fn().mockResolvedValue(undefined)

      asMockHook(useUpdateColumnIterationTitle).mockReturnValue({
        updateColumnIterationTitle: updateColumnIterationTitleStub,
      })

      asMockHook(useUpdateOptions).mockReturnValue({
        updateColumnOption: updateColumnOptionStub,
      })

      const {result} = renderHook(useUpdateVerticalGroup)
      await result.current.updateVerticalGroup(column, optionA)

      expect(updateColumnIterationTitleStub).not.toHaveBeenCalled()

      expect(updateColumnOptionStub).toHaveBeenCalledTimes(1)
      expect(updateColumnOptionStub).toHaveBeenCalledWith(column, optionA, false)
    })

    it('should update the column iteration title if the column data type is `Iteration`', async () => {
      const column = new IterationColumnModel(customIterationColumn)
      const updateColumnOptionStub = jest.fn().mockResolvedValue(undefined)
      const updateColumnIterationTitleStub = jest.fn().mockResolvedValue(undefined)

      asMockHook(useUpdateColumnIterationTitle).mockReturnValue({
        updateColumnIterationTitle: updateColumnIterationTitleStub,
      })

      asMockHook(useUpdateOptions).mockReturnValue({
        updateColumnOption: updateColumnOptionStub,
      })

      const {result} = renderHook(useUpdateVerticalGroup)
      await result.current.updateVerticalGroup(column, {id: 'Iteration 4', name: 'New Iteration 4'})

      expect(updateColumnOptionStub).not.toHaveBeenCalled()
      expect(updateColumnIterationTitleStub).toHaveBeenCalledTimes(1)
      expect(updateColumnIterationTitleStub).toHaveBeenCalledWith(column, {id: 'Iteration 4', name: 'New Iteration 4'})
    })

    it('should ignore a state update if the column data type is not `SingleSelect` or `Iteration`', async () => {
      const column = new TitleColumnModel(titleColumn)
      const updateColumnOptionStub = jest.fn().mockResolvedValue(undefined)
      const updateColumnIterationTitleStub = jest.fn().mockResolvedValue(undefined)

      asMockHook(useUpdateColumnIterationTitle).mockReturnValue({
        updateColumnIterationTitle: updateColumnIterationTitleStub,
      })

      asMockHook(useUpdateOptions).mockReturnValue({
        updateColumnOption: updateColumnOptionStub,
      })

      const {result} = renderHook(useUpdateVerticalGroup)
      await result.current.updateVerticalGroup(column, {id: 'option-a', name: 'option A'})

      for (const stub of [updateColumnOptionStub, updateColumnIterationTitleStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })
  })
})
