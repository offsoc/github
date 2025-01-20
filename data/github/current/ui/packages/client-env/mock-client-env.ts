import {type ClientEnvironment, _resetForTests, clientEnvForTests, setClientEnvForSsr} from './client-env'

export function mockClientEnv(envOverrides?: Partial<ClientEnvironment>) {
  // extend the default env with the overrides so that we have a full and valid env
  const env = {
    ...clientEnvForTests,
    ...envOverrides,
  }

  if (typeof document !== 'undefined') {
    // Browser mock
    // eslint-disable-next-line github/no-dynamic-script-tag
    const envTag = document.createElement('script')
    envTag.type = 'application/json'
    envTag.id = 'client-env'
    envTag.textContent = JSON.stringify(env)
    document.head.appendChild(envTag)

    // reset, which will cause the new env to be pulled from the DOM
    _resetForTests({loadNewEnv: true})
  } else {
    // SSR mock
    _resetForTests({loadNewEnv: false})

    if (env) {
      // We only require a partial env in the mock so that consumers don't have to
      // provide a full env just to test a single value. This means we need to cast to any
      // when setting the env below.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setClientEnvForSsr(env as any)
    }
  }
}

// This is intended to be used in the test setup file
export function applyDefaultClientEnvMock() {
  _resetForTests({loadNewEnv: false})

  // Reset the env before each test
  beforeEach(() => {
    if (typeof document !== 'undefined') {
      const envTag = document.getElementById('client-env')
      if (envTag) {
        envTag.remove()
      }
    }

    _resetForTests({loadNewEnv: false})
  })
}
