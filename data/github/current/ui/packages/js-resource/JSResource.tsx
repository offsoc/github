/**
 * This is a basic JSResource implementation that satisfies the interface expected by Relay when defining an
 * entryPoint. Compared to a bare promise, this allows us to use an already-loaded resource synchronously (without
 * waiting for a callback to execute in the next tick).
 */

const resourceMap = new Map<string, Resource<unknown>>()

class Resource<T> {
  _moduleId: string
  _loader: () => Promise<T>
  _error: Error | null
  _promise: Promise<T> | null
  _result: T | null

  constructor(moduleId: string, loader: () => Promise<T>, result: T | null = null) {
    this._moduleId = moduleId
    this._loader = loader
    this._error = null
    this._promise = null
    this._result = result
  }

  load() {
    if (this._promise == null) {
      this._promise = this._loader()
      ;(async () => {
        try {
          this._result = await this._promise
        } catch (error) {
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          this._error = error
          throw error
        }
      })()
    }
    return this._promise
  }

  getModuleId() {
    return this._moduleId
  }

  get() {
    return this._result
  }

  getModuleIfRequired() {
    return this.get()
  }

  read() {
    if (this._result != null) {
      return this._result
    } else if (this._error != null) {
      throw this._error
    } else {
      /**
       * It's ok to throw a promise here, because we'll catch it and call `load` on the resource.
       * This is the 'suspense' pattern.
       */
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw this._promise
    }
  }
}

export default function JSResource<T>(
  moduleId: string,
  loader: () => Promise<T>,
  preloadedResult: T | null = null,
): Resource<T> {
  let resource = resourceMap.get(moduleId)
  if (resource == null) {
    resource = new Resource(moduleId, loader, preloadedResult)
    resourceMap.set(moduleId, resource)
  }
  return resource as Resource<T>
}
