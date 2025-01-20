import {disableFeatureInUrl} from '../urls'

describe('disableFeatureInUrl', () => {
  it('should disable feature to url without query string', () => {
    const url = 'https://github.com'
    const featureName = 'feature1'
    const expectedUrl = 'https://github.com?_features=!feature1'
    expect(disableFeatureInUrl(url, featureName)).toEqual(expectedUrl)
  })

  it('should disable feature to url with query string', () => {
    const url = 'https://github.com?param1=value1'
    const featureName = 'feature2'
    const expectedUrl = 'https://github.com?param1=value1&_features=!feature2'
    expect(disableFeatureInUrl(url, featureName)).toEqual(expectedUrl)
  })

  it('should not disable feature if already present in url', () => {
    const url = 'https://github.com?_features=!feature3'
    const featureName = 'feature3'
    expect(disableFeatureInUrl(url, featureName)).toBeUndefined()
  })

  it('should insert the feature toggle before the hash parameter', () => {
    const url = 'https://github.com/github/issues/123#hash'
    const featureName = 'feature4'
    const expectedUrl = 'https://github.com/github/issues/123?_features=!feature4#hash'
    expect(disableFeatureInUrl(url, featureName)).toEqual(expectedUrl)
  })
})
