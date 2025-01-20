export class DeferredRegistry<T> {
  private registrationEntries: Record<
    string,
    {
      promise: Promise<T>
      resolve?: (r: T) => void
    }
  > = {}

  public register(name: string, registration: T) {
    const entry = this.registrationEntries[name]
    if (entry) {
      entry.resolve?.(registration)
    } else {
      this.registrationEntries[name] = {
        promise: Promise.resolve(registration),
      }
    }
  }

  public getRegistration(name: string): Promise<T> {
    this.registrationEntries[name] ||= new Deferred()
    return this.registrationEntries[name].promise
  }
}

class Deferred<T> {
  declare promise
  declare resolve: (r: T) => void

  constructor() {
    this.promise = new Promise<T>(resolve => {
      this.resolve = resolve
    })
  }
}
