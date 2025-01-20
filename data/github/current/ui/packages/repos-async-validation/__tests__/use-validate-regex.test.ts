import {act, renderHook} from '@testing-library/react'
import {useValidateRegex} from '@github-ui/repos-async-validation/use-validate-regex'
import {mockFetch} from '@github-ui/mock-fetch'

describe('useValidateRegex', () => {
  test('should handle invalid patterns', async () => {
    mockFetch.mockRouteOnce('/repos/validate_regex/pattern', {valid: false}, {ok: false, status: 400})

    const {result} = renderHook(() => useValidateRegex())

    await act(() => expect(result.current.validate('*')).resolves.toBe(false))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(true)
  })

  test('should handle valid patterns', async () => {
    mockFetch.mockRouteOnce('/repos/validate_regex/pattern', {valid: true})

    const {result} = renderHook(() => useValidateRegex())

    await act(() => expect(result.current.validate('.*')).resolves.toBe(true))
    expect(result.current.isValid).toBe(true)
    expect(result.current.showError).toBe(false)
  })

  test('should handle unexpected validation errors', async () => {
    mockFetch.mockRouteOnce('/repos/validate_regex/pattern', undefined, {ok: false, status: 500})

    const {result} = renderHook(() => useValidateRegex())

    await act(() => expect(result.current.validate('.*')).resolves.toBe(true))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(false)
  })
})
