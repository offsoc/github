import {act, renderHook} from '@testing-library/react'

import {ToastType} from '../../../client/components/toasts/types'
import useToastsInternal from '../../../client/components/toasts/use-toasts-internal'

describe('useToastsInternal', () => {
  it('adds a toast to the container with addToast from the hook', () => {
    const {result} = renderHook(useToastsInternal)
    expect(result.current.toasts).toHaveLength(0)

    act(() => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      result.current.addToast({
        message: 'Changes Saved',
        type: ToastType.success,
      })
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('adds only one toast at a time to the container', () => {
    const {result} = renderHook(useToastsInternal)
    expect(result.current.toasts).toHaveLength(0)

    act(() => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      result.current.addToast({
        message: 'Changes Saved',
        type: ToastType.success,
      })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      result.current.addToast({
        message: 'Changes Saved',
        type: ToastType.success,
      })
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('respects autodismiss: false', () => {
    const {result} = renderHook(() => useToastsInternal({autoDismiss: false}))

    act(() => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      result.current.addToast({message: 'Changes Saved', type: ToastType.success})
    })

    expect(result.current.toasts[0].timeout).toBeUndefined()
  })

  it('adds timeout to new toasts by default', () => {
    const {result} = renderHook(useToastsInternal)

    act(() => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      result.current.addToast({
        message: 'Changes Saved',
        type: ToastType.success,
      })
    })

    expect(result.current.toasts[0].timeout).toBeDefined()
  })
})
