import {isValidUrl, prefixUrl} from '../url'

describe('prefixUrl', () => {
  test('prefixes https:// to string beginning with www.', () => {
    expect(prefixUrl('www.something.com')).toBe('https://www.something.com')
  })

  test(`leaves string that don't begin with www. intact`, () => {
    expect(prefixUrl('https://something.com')).toBe('https://something.com')
    expect(prefixUrl('https://www.something.com')).toBe('https://www.something.com')
  })
})

describe('isValidUrl', () => {
  test('calls URL.canParse with the expected url param', () => {
    global.URL.canParse = jest.fn().mockReturnValue(true)

    isValidUrl('https://www.something.com')
    expect(global.URL.canParse).toHaveBeenCalledWith('https://www.something.com')
  })
})
