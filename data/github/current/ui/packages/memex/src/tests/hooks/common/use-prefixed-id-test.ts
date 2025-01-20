import {renderHook} from '@testing-library/react'

import {usePrefixedId} from '../../../client/hooks/common/use-prefixed-id'

const renderUsePrefixedId = (prefix: string) => renderHook(({prefix: p}) => usePrefixedId(p), {initialProps: {prefix}})

describe('useId', () => {
  it('generates an ID that is stable across renders', () => {
    const {rerender, result} = renderUsePrefixedId('foo')
    const firstId = result.current
    rerender({prefix: 'foo'})
    expect(firstId).toBe(result.current)
  })

  it('generates an ID that contains the prefix', () => {
    const {result} = renderUsePrefixedId('foo')
    expect(result.current).toMatch(/foo/)
  })

  it('generates a unique ID', () => {
    const {result: firstResult} = renderUsePrefixedId('foo')
    const {result: secondResult} = renderUsePrefixedId('foo')
    expect(firstResult.current).not.toBe(secondResult.current)
  })
})
