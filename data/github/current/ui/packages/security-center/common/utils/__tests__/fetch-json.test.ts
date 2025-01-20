import {tryFetchJson} from '../fetch-json'

let originalFetch: typeof fetch

beforeEach(() => {
  originalFetch = globalThis.fetch
  globalThis.fetch = jest.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('tryFetchJson', () => {
  it('uses expected defaults', () => {
    tryFetchJson('/foo')

    expect(globalThis.fetch).toHaveBeenCalledWith('/foo', {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  })

  it('uses specified options', () => {
    tryFetchJson('/bar', {method: 'HEAD'})

    expect(globalThis.fetch).toHaveBeenCalledWith('/bar', {
      method: 'HEAD',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  })
})
