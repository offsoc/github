import {reactFetch, reactFetchJSON, verifiedFetch, verifiedFetchJSON} from '../verified-fetch'

let originalFetch: typeof fetch

beforeEach(() => {
  originalFetch = globalThis.fetch
  globalThis.fetch = jest.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('verifiedFetch', () => {
  test('calls fetch with verification headers', () => {
    verifiedFetch('/', {method: 'POST', headers: {'Content-Type': 'text/html'}})

    expect(globalThis.fetch).toHaveBeenCalledWith('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  })

  test('calls fetch with verification header and an absolute path', () => {
    verifiedFetch('http://localhost/', {method: 'POST', headers: {'Content-Type': 'text/html'}})

    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  })

  test('rejects an attempt to make a cross-origin request via an absolute URL', () => {
    expect(() => {
      verifiedFetch('https://evilcorp.com', {method: 'POST', headers: {'Content-Type': 'text/html'}})
    }).toThrow('Can not make cross-origin requests from verifiedFetch')
  })

  test('rejects an attempt to make a cross-origin request via a protocol-relative URL', () => {
    expect(() => {
      verifiedFetch('//evilcorp.com', {method: 'POST', headers: {'Content-Type': 'text/html'}})
    }).toThrow('Can not make cross-origin requests from verifiedFetch')
  })
})

describe('verifiedFetchJSON', () => {
  test('stringifies bodies and appends JSON headers', () => {
    verifiedFetchJSON('/', {method: 'POST', body: {foo: 'bar'}})

    expect(globalThis.fetch).toHaveBeenCalledWith('/', {
      method: 'POST',
      body: JSON.stringify({foo: 'bar'}),
      headers: {
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })
})

describe('reactFetch', () => {
  test('marks as React request and makes a verifiedFetch request', () => {
    reactFetch('/', {method: 'POST', headers: {'Content-Type': 'text/html'}})

    expect(globalThis.fetch).toHaveBeenCalledWith('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
        'GitHub-Is-React': 'true',
      },
    })
  })
})

describe('reactFetchJSON', () => {
  test('marks as React request and makes a verifiedFetchJSON request', () => {
    reactFetchJSON('/', {method: 'POST', body: {foo: 'bar'}})

    expect(globalThis.fetch).toHaveBeenCalledWith('/', {
      method: 'POST',
      body: JSON.stringify({foo: 'bar'}),
      headers: {
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'GitHub-Is-React': 'true',
      },
    })
  })
})
