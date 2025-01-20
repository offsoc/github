import type {BrowserContext, Page} from '@playwright/test'

export class ClipboardFixture {
  #context: BrowserContext
  #page: Page

  constructor(context: BrowserContext, page: Page) {
    this.#context = context
    this.#page = page
  }

  /** Grant permission to read and write the clipboard. Will reject if not supported. */
  async grantPermissions() {
    await this.#context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }

  /** Copy the current selection to the clipboard. */
  copySelection() {
    return this.#page.keyboard.press('Control+c')
  }

  /** Write some text directly to the clipboard. */
  writeText(text: string) {
    return this.#page.evaluate(_text => navigator.clipboard.writeText(_text), text)
  }

  /** Paste the contents of the clipboard. */
  paste() {
    return this.#page.keyboard.press('Control+v')
  }

  /** Get the text contents of the clipboard. */
  getText() {
    return this.#page.evaluate(() => navigator.clipboard.readText())
  }

  /**
   * Get the full contents of the clipboard if the browser supports it.
   * @returns An array of objects, where each object represents a single clipboard entry and is a map of media types to
   * string representations of those values (note that this won't work for binary data like images). For example:
   * ```js
   * [{'text/html': '<b>hello</b>', 'text/plain': 'hello'}]
   * ```
   */
  async getContents() {
    return this.#page.evaluate(async () => {
      const clipboard = await navigator.clipboard.read()

      // We can't just return `clipboard` now because it's an array of `ClipboardItem` class instances. This can't be
      // serialized to JSON to send back to the test runner, so we map it into a plain old array of objects
      return Promise.all(
        clipboard.map(async item => {
          const entries = await Promise.all(
            item.types.map(async type => {
              const blob = await item.getType(type)
              const text = await blob.text()
              return [type, text] as const
            }),
          )

          return Object.fromEntries(entries)
        }),
      )
    })
  }
}
