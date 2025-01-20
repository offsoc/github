type PlatformReportBrowserErrorInputWithId = {id: number} & PlatformReportBrowserErrorInput

export class FailbotCollection {
  #map = new Map<number, PlatformReportBrowserErrorInputWithId>()
  #list = new Array<PlatformReportBrowserErrorInputWithId>()

  all() {
    return this.#list
  }

  get(id: number) {
    const item = this.#map.get(id)
    if (!item) throw new Error(`BrowserError not found: ${id}`)
    return item
  }

  create(error: PlatformReportBrowserErrorInput): void {
    const id = this.#list.length
    const errorWithId = {
      id,
      ...error,
    }
    this.#map.set(id, errorWithId)
    this.#list.push(errorWithId)
  }
}
