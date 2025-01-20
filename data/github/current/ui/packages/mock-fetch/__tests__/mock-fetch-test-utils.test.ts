import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '../index'

describe('expectMockFetchCalledTimes', () => {
  it('throws if no requests to the path', () => {
    expect(() => expectMockFetchCalledTimes('/my/path', 1)).toThrow()
    expectMockFetchCalledTimes('/my/path', 0)
  })

  it('checks if path was requested at least once', () => {
    mockFetch.fetch('/my/path')
    mockFetch.fetch('/other/path')

    expect(() => expectMockFetchCalledTimes('/my/path', 0)).toThrow()
    expectMockFetchCalledTimes('/my/path', 1)
  })

  it('checks if path was requested at several times', () => {
    mockFetch.fetch('/my/path')
    mockFetch.fetch('/my/path')
    mockFetch.fetch('/other/path')

    expectMockFetchCalledTimes('/my/path', 2)
    expect(() => expectMockFetchCalledTimes('/my/path', 3)).toThrow()
  })

  it('works with regexp', () => {
    mockFetch.fetch('/my/settings')

    expectMockFetchCalledTimes(/settings/, 1)
    expect(() => expectMockFetchCalledTimes(/account/, 3)).toThrow()
  })
})

describe('expectMockFetchCalledWith', () => {
  it('throws if no requests to the path', () => {
    expect(() => expectMockFetchCalledWith('/my/path', {})).toThrow()
  })

  it('checks if path was requested at least once with provided body', () => {
    mockFetch.fetch('/my/path', {body: JSON.stringify({property: 'value'})})
    mockFetch.fetch('/other/path')

    expectMockFetchCalledWith('/my/path', {property: 'value'})
  })

  it('throws if actual body is not equal to expected', () => {
    mockFetch.fetch('/my/path', {body: JSON.stringify({property: 'value'})})

    expect(() => expectMockFetchCalledWith('/my/path', {property: 'test'})).toThrow()
  })

  it('tolerates different key value order', () => {
    mockFetch.fetch('/my/path', {body: JSON.stringify({property: 'value', attribute: 'value'})})

    expectMockFetchCalledWith('/my/path', {attribute: 'value', property: 'value'})
  })

  it('works in different comparison modes', () => {
    mockFetch.fetch('/my/path', {body: JSON.stringify({property: 'value', attribute: 'value'})})

    expectMockFetchCalledWith('/my/path', {property: 'value'}, 'match')
    expectMockFetchCalledWith('/my/path', {property: 'value', attribute: 'value'}, 'equal')
    expect(() => expectMockFetchCalledWith('/my/path', {attribute: 'value'}, 'equal')).toThrow()
  })

  it('works with regexp', () => {
    mockFetch.fetch('/my/settings', {body: JSON.stringify({property: 'value'})})

    expectMockFetchCalledWith(/settings/, {property: 'value'})
    expect(() => expectMockFetchCalledWith(/account/, {property: 'value'})).toThrow()
  })
})
