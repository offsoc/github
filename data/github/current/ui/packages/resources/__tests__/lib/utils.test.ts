import {replacePageNumberInUrl, appendFeatureFlagsToUrl} from '../../lib/utils'

describe('replacePageNumberInUrl', () => {
  it('replaces the page number if it exists in the URL', () => {
    const url = 'http://example.com?page=2'
    const pageNumber = 5
    const expected = 'http://example.com/?page=5'
    expect(replacePageNumberInUrl(url, pageNumber)).toBe(expected)
  })

  it('appends the page number if it does not exist in the URL', () => {
    const url = 'http://example.com'
    const pageNumber = 1
    const expected = 'http://example.com/?page=1'
    expect(replacePageNumberInUrl(url, pageNumber)).toBe(expected)
  })

  it('appends the page number if other query parameters exist in the URL', () => {
    const url = 'http://example.com?foo=bar'
    const pageNumber = 3
    const expected = 'http://example.com/?foo=bar&page=3'
    expect(replacePageNumberInUrl(url, pageNumber)).toBe(expected)
  })
})

describe('appendFeatureFlagsToUrl', () => {
  it('appends feature flags if they do not exist in the URL', () => {
    const url = 'http://example.com'
    const featureFlags = 'new-feature'
    const expected = 'http://example.com/?_features=new-feature'
    expect(appendFeatureFlagsToUrl(url, featureFlags)).toBe(expected)
  })

  it('replaces feature flags if they exist in the URL', () => {
    const url = 'http://example.com?_features=old-feature'
    const featureFlags = 'new-feature'
    const expected = 'http://example.com/?_features=new-feature'
    expect(appendFeatureFlagsToUrl(url, featureFlags)).toBe(expected)
  })

  it('appends feature flags if other query parameters exist in the URL', () => {
    const url = 'http://example.com?foo=bar'
    const featureFlags = 'new-feature'
    const expected = 'http://example.com/?foo=bar&_features=new-feature'
    expect(appendFeatureFlagsToUrl(url, featureFlags)).toBe(expected)
  })
})
