export class Deferred<T> {
  declare resolve: (value: T) => unknown
  declare reject: (reason?: unknown) => unknown
  declare promise: Promise<T>

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
