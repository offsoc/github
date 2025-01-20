import {act, renderHook} from '@testing-library/react'

import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {useSidePanelDirtyState} from '../../../client/hooks/use-side-panel-dirty-state'
import {setupEnvironment} from './side-panel-test-helpers'

jest.mock('@primer/react', () => {
  const original = jest.requireActual('@primer/react') // Step 2.
  return {
    ...original,
    useConfirm: jest.fn().mockReturnValue(() => false),
  }
})

describe('useSidePanelDirtyState', () => {
  it('is not dirty by default', () => {
    const {result} = renderHook(() => useSidePanelDirtyState(), {wrapper: setupEnvironment().wrapper})
    const [dirty] = result.current

    expect(dirty).toBeFalsy()
  })
  it('reflects the dirty state', () => {
    const {result} = renderHook(() => useSidePanelDirtyState(), {wrapper: setupEnvironment().wrapper})

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBeTruthy()
  })
  it('only updates state when necessary', () => {
    const useSharedHook = () => {
      const paneState = useSidePanelDirtyState()
      const itemPanel = useSidePanel()

      return {paneState, itemPanel}
    }
    const {result} = renderHook(useSharedHook, {wrapper: setupEnvironment().wrapper})
    const originalResult = result.current.itemPanel.dirtyItems

    // when updating an ID to be different, the dirty state should update and therefore the new
    // object in state should be referentially different
    act(() => {
      result.current.paneState[1](true)
    })
    // specifically use `toBe` here because the object in state should be referentially different
    expect(result.current.itemPanel.dirtyItems).not.toBe(originalResult)

    // when updating an ID to be the same, the dirty state should not update, and therefore the
    // object in state should be referentially the same
    const updatedResult = result.current.itemPanel.dirtyItems
    act(() => {
      result.current.paneState[1](true)
    })
    // specifically use `toBe` here because the object in state should be referentially the same
    expect(result.current.itemPanel.dirtyItems).toBe(updatedResult)

    expect(result.current.paneState[0]).toBeTruthy()
  })
  it('reflects only its own dirty state', () => {
    const useSharedHook = () => {
      const firstResult = useSidePanelDirtyState()
      const secondResult = useSidePanelDirtyState()
      return {firstResult, secondResult}
    }

    const {result} = renderHook(() => useSharedHook(), {wrapper: setupEnvironment().wrapper})

    act(() => {
      result.current.firstResult[1](true)
    })

    expect(result.current.firstResult[0]).toBeTruthy()
    expect(result.current.secondResult[0]).toBeFalsy()
  })
  it('has all states reflected in hasUnsavedChanges', () => {
    const useSharedHook = () => {
      const paneState = useSidePanelDirtyState()
      const itemPanel = useSidePanel()
      return {paneState, itemPanel}
    }
    const {result} = renderHook(useSharedHook, {wrapper: setupEnvironment().wrapper})

    act(() => {
      result.current.paneState[1](true)
    })

    expect(result.current.itemPanel.hasUnsavedChanges).toBeTruthy()
  })

  it('should confirm item pane closure when the state is dirty', async () => {
    const useSharedHook = () => {
      const paneState = useSidePanelDirtyState()
      const itemPanel = useSidePanel()

      return {paneState, itemPanel}
    }
    const {result} = renderHook(useSharedHook, {wrapper: setupEnvironment().wrapper})

    act(() => {
      result.current.paneState[1](true)
    })
    const didClose = await act(result.current.itemPanel.closePane)
    // we have mocked the confirmation dialog to always cancel
    expect(didClose).toBeFalsy()
  })

  it('should not confirm item pane closure when the state is clean', async () => {
    const useSharedHook = () => {
      const paneState = useSidePanelDirtyState()
      const itemPanel = useSidePanel()

      return {paneState, itemPanel}
    }
    const {result} = renderHook(useSharedHook, {wrapper: setupEnvironment().wrapper})

    const didClose = await act(result.current.itemPanel.closePane)
    // we have mocked the confirmation dialog to always cancel
    expect(didClose).toBeTruthy()
  })
})
