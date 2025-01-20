import {appendParam, appendQuery} from '../url'

describe('appendQuery', () => {
  it('appends new value to existing query parameter', () => {
    const actual = appendQuery({
      baseUrl: '/orgs/test/security/alerts/secret-scanning?query=bypassed%3Atrue',
      query: 'repo:test',
    })
    expect(actual).toBe('/orgs/test/security/alerts/secret-scanning?query=bypassed%3Atrue+repo%3Atest')
  })

  it('sets query parameter if none already exists', () => {
    const actual = appendQuery({
      baseUrl: '/orgs/test/security/alerts/secret-scanning?something=yes',
      query: 'repo:test',
    })
    expect(actual).toBe('/orgs/test/security/alerts/secret-scanning?something=yes&query=repo%3Atest')
  })
})

describe('appendParams', () => {
  it('appends param/value after existing search params', () => {
    const actual = appendParam({
      baseUrl: '/orgs/test/security/overview?archived=true',
      param: 'repo',
      value: 'test',
    })
    expect(actual).toBe('/orgs/test/security/overview?archived=true&repo=test')
  })

  it('sets search param if none already exists', () => {
    const actual = appendParam({
      baseUrl: '/orgs/test/security/overview',
      param: 'repo',
      value: 'test',
    })
    expect(actual).toBe('/orgs/test/security/overview?repo=test')
  })
})
