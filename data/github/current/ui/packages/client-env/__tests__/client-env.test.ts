import {getEnv, clientEnvForTests} from '../client-env'
import {mockClientEnv} from '../mock-client-env'

describe('client-env', () => {
  test('returns a parsed version of the client-env script tag', async () => {
    mockClientEnv({
      locale: 'something',
    })

    expect(getEnv()).toEqual({
      ...clientEnvForTests,
      locale: 'something',
    })
  })
})
