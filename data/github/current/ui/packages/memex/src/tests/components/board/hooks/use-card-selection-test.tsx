import {act, renderHook} from '@testing-library/react'
import {useRef} from 'react'

import {useCardSelection} from '../../../../client/components/board/hooks/use-card-selection'
import {CardSelectionProvider} from '../../../../client/components/board/selection'
import {DefaultColumns} from '../../../../mocks/mock-data'
import {createMockEnvironment} from '../../../create-mock-environment'
import {QueryClientWrapper} from '../../../test-app-wrapper'
import {createCardGrid} from '../board-test-helper'

const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  const meta = createCardGrid([
    {id: 'column1', items: [123]},
    {id: 'column2', items: [456, 789]},
  ])
  const metaRef = useRef(meta)
  return (
    <QueryClientWrapper>
      <CardSelectionProvider initialState={{selected: {}}} metaRef={metaRef}>
        {children}
      </CardSelectionProvider>
    </QueryClientWrapper>
  )
}

const getWrapper = () => {
  createMockEnvironment({
    jsonIslandData: {
      'memex-columns-data': DefaultColumns,
    },
  })
  return Wrapper
}

describe('useCardSelection', () => {
  const wrapper = getWrapper()
  describe('toggleCardSelected', () => {
    it('toggles the card id as selected when state is true', () => {
      const id = 123

      const {result} = renderHook(() => useCardSelection(), {wrapper})

      act(() => {
        result.current.toggleCardSelected(id, true)
      })

      expect(result.current.state[id]).toEqual(true)
    })

    it('toggles the card id as NOT selected when state is false', () => {
      const id = 123

      const {result} = renderHook(() => useCardSelection(), {wrapper})

      act(() => {
        result.current.toggleCardSelected(id, false)
      })

      expect(result.current.state[id]).toEqual(false)
    })

    it('inverts the current selected state when no state is passed', () => {
      const id = 123

      const {result} = renderHook(() => useCardSelection(), {wrapper})

      act(() => {
        result.current.toggleCardSelected(id)
      })

      expect(result.current.state[id]).toEqual(true)

      act(() => {
        result.current.toggleCardSelected(id)
      })

      expect(result.current.state[id]).toEqual(false)
    })
  })

  describe('toggleAllSelected', () => {
    it('select all cards when parameter is true', () => {
      const {result} = renderHook(() => useCardSelection(), {wrapper})

      act(() => {
        result.current.toggleAllSelected(true)
      })

      expect(result.current.state).toEqual({123: true, 456: true, 789: true})
    })

    it('clear selections when parameter is false', () => {
      const {result} = renderHook(() => useCardSelection(), {wrapper})

      act(() => {
        result.current.toggleAllSelected(false)
      })

      expect(result.current.state).toEqual({})
    })
  })

  describe('selectAllCycle', () => {
    it('select all cards in the column on first call', () => {
      const {result} = renderHook(() => useCardSelection(undefined, undefined, 0, 1), {wrapper})

      act(() => {
        result.current.selectAllCycle()
      })

      expect(result.current.state).toEqual({456: true, 789: true})
    })

    it('select all cards in the board on second call', () => {
      const {result} = renderHook(() => useCardSelection(undefined, undefined, 0, 1), {wrapper})

      act(() => {
        result.current.selectAllCycle()
        result.current.selectAllCycle()
      })

      expect(result.current.state).toEqual({123: true, 456: true, 789: true})
    })

    it('clear selection on third call', () => {
      const {result} = renderHook(() => useCardSelection(undefined, undefined, 0, 1), {wrapper})

      act(() => {
        result.current.selectAllCycle()
        result.current.selectAllCycle()
        result.current.selectAllCycle()
      })

      expect(result.current.state).toEqual({})
    })

    it('loop on fourth call', () => {
      const {result} = renderHook(() => useCardSelection(undefined, undefined, 0, 1), {wrapper})

      act(() => {
        result.current.selectAllCycle()
        result.current.selectAllCycle()
        result.current.selectAllCycle()
        result.current.selectAllCycle()
      })

      expect(result.current.state).toEqual({456: true, 789: true})
    })
  })
})
