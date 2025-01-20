import {act, renderHook} from '@testing-library/react'

import {useFormField} from '../use-form-field'

describe('useFormField', () => {
  it('updates field', async () => {
    const {result} = renderHook(() => useFormField(''))
    expect(result.current.value).toEqual('')

    await act(() => result.current.update('test'))

    expect(result.current.value).toEqual('test')
  })

  it('validates field', async () => {
    const {result} = renderHook(() => useFormField('', {validator: () => 'validationError'}))
    expect(result.current.validationError).toBeUndefined()
    expect(result.current.isValid()).toBeTruthy()

    await act(async () => expect(await result.current.validate()).toEqual('validationError'))

    expect(result.current.validationError).toEqual('validationError')
    expect(result.current.isValid()).toBeFalsy()
  })

  it('validates field on update', async () => {
    const {result} = renderHook(() => useFormField('', {validator: () => 'validationError'}))
    expect(result.current.validationError).toBeUndefined()
    expect(result.current.isValid()).toBeTruthy()

    await act(() => result.current.update('test'))

    expect(result.current.validationError).toEqual('validationError')
    expect(result.current.isValid()).toBeFalsy()
    expect(result.current.value).toEqual('test')
  })

  it('when no validator provided, does not clear existing "external" validation on update', async () => {
    const {result} = renderHook(() => useFormField(''))
    expect(result.current.validationError).toBeUndefined()
    expect(result.current.isValid()).toBeTruthy()

    act(() => result.current.setFieldError('outsideValidationError'))

    expect(result.current.validationError).toEqual('outsideValidationError')
    expect(result.current.isValid()).toBeFalsy()

    act(() => result.current.update('test'))

    expect(result.current.validationError).toEqual('outsideValidationError')
    expect(result.current.isValid()).toBeFalsy()
    expect(result.current.value).toEqual('test')
  })

  it('resets field', async () => {
    const {result} = renderHook(() => useFormField('', {validator: () => 'validationError'}))

    await act(() => result.current.update('test'))
    await act(() => result.current.validate())

    expect(result.current.validationError).toEqual('validationError')
    expect(result.current.value).toEqual('test')

    act(() => result.current.reset())

    expect(result.current.validationError).toBeUndefined()
    expect(result.current.value).toEqual('')
  })
})
