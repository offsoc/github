import {act, renderHook} from '@testing-library/react'

import {
  type DragState,
  DragStateActionTypes,
  useBoardDndReducer,
} from '../../../../client/components/board/hooks/use-board-dnd-reducer'
import {DropSide} from '../../../../client/helpers/dnd-kit/drop-helpers'

const initialState: DragState = {
  dropId: undefined,
  dropSide: undefined,
}

describe('useBoardDndReducer', () => {
  it('is initialized with an initial state', () => {
    const {result} = renderHook(() => useBoardDndReducer())

    expect(result.current[0]).toEqual(initialState)
  })

  it('should reset state when dispatched', () => {
    const {result} = renderHook(() => useBoardDndReducer())

    act(() => result.current[1]({type: DragStateActionTypes.SET_DROP, dropId: 1, dropSide: DropSide.BEFORE}))

    expect(result.current[0]).not.toEqual(initialState)

    act(() => result.current[1]({type: DragStateActionTypes.RESET_STATE}))

    expect(result.current[0]).toEqual(initialState)
  })

  it('should set drop state when dispatched', () => {
    const {result} = renderHook(() => useBoardDndReducer())

    expect(result.current[0]).toEqual(initialState)

    act(() => result.current[1]({type: DragStateActionTypes.SET_DROP, dropId: 1, dropSide: DropSide.BEFORE}))

    expect(result.current[0].dropId).toEqual(1)
    expect(result.current[0].dropSide).toEqual(DropSide.BEFORE)
  })
})
