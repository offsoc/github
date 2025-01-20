import {isCurrentLink} from '../../../../../components/contentful/ContentfulSubnav/utils'

describe('isCurrentLink', () => {
  it('returns false if the current URL is not available', () => {
    expect(isCurrentLink({url: 'https://example.com', actual: undefined})).toBe(false)
  })

  it('returns false if the URL is not the current', () => {
    expect(isCurrentLink({url: 'https://example.com', actual: 'https://example.org'})).toBe(false)
  })

  it('returns true if the URL is the current', () => {
    const URL = 'https://example.com/flagship/page'

    expect(isCurrentLink({url: URL, actual: 'https://example.com/flagship/page'})).toBe(true)
    expect(isCurrentLink({url: URL, actual: 'https://example.com/flagship/page?utm_source=example'})).toBe(true)
    expect(isCurrentLink({url: URL, actual: 'https://example.com/flagship/page#example'})).toBe(true)
  })
})
