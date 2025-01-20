/** @jest-environment node */
import {getEnv, clientEnvForTests, _resetForTests} from '../client-env'
import {mockClientEnv} from '../mock-client-env'

describe('client-env in SSR', () => {
  test('throws by default if the env has not been set', async () => {
    _resetForTests({loadNewEnv: false, forceUndefined: true})
    expect(getEnv).toThrow()
  })

  test('can be updated with the setEnvForSsr method', async () => {
    mockClientEnv({
      locale: 'ssr-locale',
    })

    expect(getEnv()).toEqual({
      ...clientEnvForTests,
      locale: 'ssr-locale',
    })
  })
})
