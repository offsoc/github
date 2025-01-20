import {act, renderHook} from '@testing-library/react'
import {useValidateRulesetNameUnique} from '../use-validate-ruleset-name-unique'
import {mockFetch} from '@github-ui/mock-fetch'

describe('useValidateRulesetNameUnique', () => {
  test('should handle invalid names', async () => {
    mockFetch.mockRouteOnce('/validate_value/ruleset_name', {valid: false}, {ok: false, status: 400})

    const {result} = renderHook(() => useValidateRulesetNameUnique('/validate_value'))

    await act(() => expect(result.current.validate('name', undefined)).resolves.toBe(false))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(true)
  })

  test('should handle valid names', async () => {
    mockFetch.mockRouteOnce('/validate_value/ruleset_name', {valid: true})

    const {result} = renderHook(() => useValidateRulesetNameUnique('/validate_value'))

    await act(() => expect(result.current.validate('name', undefined)).resolves.toBe(true))
    expect(result.current.isValid).toBe(true)
    expect(result.current.showError).toBe(false)
  })

  test('should handle unexpected validation errors', async () => {
    mockFetch.mockRouteOnce('/validate_value/ruleset_name', undefined, {ok: false, status: 500})

    const {result} = renderHook(() => useValidateRulesetNameUnique('/validate_value'))

    await act(() => expect(result.current.validate('name', undefined)).resolves.toBe(true))
    expect(result.current.isValid).toBe(false)
    expect(result.current.showError).toBe(false)
  })
})
