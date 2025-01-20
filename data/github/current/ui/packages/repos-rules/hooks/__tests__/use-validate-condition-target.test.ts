import {act, renderHook} from '@testing-library/react'
import {useValidateConditionTarget} from '../use-validate-condition-target'
import {mockFetch} from '@github-ui/mock-fetch'

describe('useValidateConditionTarget', () => {
  test('should handle invalid patterns', async () => {
    mockFetch.mockRouteOnce('/validate_value/condition_target', {valid: false}, {ok: false, status: 400})

    const {result} = renderHook(() => useValidateConditionTarget('/validate_value'))

    await act(() => expect(result.current.validate('refs/heads/HEAD', 'ref_name', undefined)).resolves.toBe(false))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(true)
  })

  test('should handle valid patterns', async () => {
    mockFetch.mockRouteOnce('/validate_value/condition_target', {valid: true})

    const {result} = renderHook(() => useValidateConditionTarget('/validate_value'))

    await act(() => expect(result.current.validate('pattern', 'ref_name', undefined)).resolves.toBe(true))
    expect(result.current.isValid).toBe(true)
    expect(result.current.showError).toBe(false)
  })

  test('should handle unexpected validation errors', async () => {
    mockFetch.mockRouteOnce('/validate_value/condition_target', undefined, {ok: false, status: 500})

    const {result} = renderHook(() => useValidateConditionTarget('/validate_value'))

    await act(() => expect(result.current.validate('pattern', 'ref_name', undefined)).resolves.toBe(true))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(false)
  })
})
