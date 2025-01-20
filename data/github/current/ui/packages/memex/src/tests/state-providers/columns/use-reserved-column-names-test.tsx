import {renderHook} from '@testing-library/react'

import {useReservedColumnNames} from '../../../client/state-providers/columns/use-reserved-column-names'
import {createColumnsContext, stubReservedColumnNames} from '../../mocks/state-providers/columns-context'
import {createWrapperWithColumnsContext} from './helpers'

describe('useReservedColumnNames', () => {
  it('returns reserved names from ColumnsContext', () => {
    const reservedColumnNames = stubReservedColumnNames(['reserved-column-name'])

    const {result} = renderHook(useReservedColumnNames, {
      wrapper: createWrapperWithColumnsContext(createColumnsContext({reservedColumnNames})),
    })
    expect(result.current.reservedColumnNames.length).toEqual(1)
    expect(result.current.reservedColumnNames[0]).toEqual('reserved-column-name')
  })
})
