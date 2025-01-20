import {randPassword} from '@ngneat/falso'

export async function waitForFunction<Value>(
  fn: () => Promise<Value>,
  opts: {timeout?: number; interval?: number} = {},
): Promise<Value | null> {
  const start = Date.now()
  const timeout = opts.timeout ?? 5_000
  const interval = opts.interval ?? 50

  return new Promise<Value | null>((resolve, reject) => {
    let time = Date.now()

    // `tick` resolves our promise if the timeout is exceeded, or calls `fn`. If
    // `fn` returns a non-null value, the promise is resolved. Otherwise,
    // another `tick` is scheduled after `interval` ms.
    const tick = async () => {
      try {
        const value = await fn()

        if (value != null) {
          resolve(value)
          return
        }
      } catch (err) {
        reject(err)
        return
      }

      if (time - start > timeout) {
        resolve(null)
        return
      }

      time = Date.now()

      // muting this warning for now but ideally we can move away from tests
      // that spend a bunch of time waiting for some UI state
      //
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(tick, interval)
    }

    void tick()
  })
}

/**
 * Assert that an expectation eventually passes up to a given timeout.
 *
 * This is useful to avoid having to add delays to tests when asserting that
 * some asynchronous state will be in effect in the future.
 *
 * @param assertion The assertion to run until it succeeds
 * @param opts Options to configure the "eventually"
 */
export async function eventually(
  assertion: () => unknown,
  opts?: {timeout?: number; interval?: number},
): Promise<void> {
  opts = {timeout: 1_000, ...opts}

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let error: unknown | null = null

  await waitForFunction(async () => {
    try {
      await assertion()
      error = null
      return true
    } catch (caughtError: unknown) {
      error = caughtError
      return null
    }
  }, opts)

  if (error) {
    throw error
  }
}

/**
 * Is the current test running on MacOS?
 */
function isMacOS(): boolean {
  return process.platform === 'darwin'
}

/**
 * The meta key for the testing platform, to simplify tests using keyboard shortcuts.
 */
export const testPlatformMeta = isMacOS() ? 'Meta' : 'Control'

/**
 * Convert it to base 36 (numbers + letters), and grab the first 9 characters
 * @returns a random 9 digit string
 */
export const generateRandomName = (): string => randPassword({size: 9})

/**
 * Specialized function to locate a given element in the DOM, based on a dynamic
 * string.
 *
 * Duplicated into here because we are unable to transpile code from the main
 * project currently.
 */
export function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}
