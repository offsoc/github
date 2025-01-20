export interface ClientEnvironment {
  readonly locale: string
  readonly featureFlags: string[]
}

let env: ClientEnvironment | undefined

export function getEnv() {
  if (!env) {
    throw new Error(
      'Client env was requested before it was loaded. This likely means you are attempting to use client env at the module level in SSR, which is not supported. Please move your client env usage into a function.',
    )
  }

  return env
}

export function getLocale() {
  return env?.locale ?? 'en-US'
}

function loadEnv() {
  if (typeof document !== 'undefined') {
    const envTag = document.getElementById('client-env')
    if (envTag) {
      try {
        env = JSON.parse(envTag.textContent || '')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing client-env', error)
      }
    }
  }
}

// Automatically load the env on initial page load
loadEnv()

// This is a special helper method for setting the env in the SSR environment only
export function setClientEnvForSsr(clientEnv: ClientEnvironment | undefined) {
  env = clientEnv
}

// This env object is used as a default for tests only and is not included in production builds
export const clientEnvForTests: ClientEnvironment = {
  locale: 'en',
  featureFlags: ['test_flag'],
}

export function _resetForTests({loadNewEnv, forceUndefined}: {loadNewEnv: boolean; forceUndefined?: boolean}) {
  // forget the current env
  env = forceUndefined ? undefined : clientEnvForTests

  if (loadNewEnv) {
    // load the latest env
    loadEnv()
  }
}
