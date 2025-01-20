import {renderHook} from '@testing-library/react'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {useLocale} from '../use-locale'

describe('useLocale', () => {
  it('should use the locale from the client config', () => {
    mockClientEnv({locale: 'en-US'})
    const {result} = renderHook(() => useLocale())
    expect(result.current).toEqual('en-US')
  })
})
