import {getContentType} from '../content-types'

describe('content-types', () => {
  it('Should return the correct content type for a given file extension', () => {
    expect(getContentType('my-file.js')).toBe('application/javascript')
    expect(getContentType('my-file.css')).toBe('text/css')
    expect(getContentType('my-file.js.map')).toBe('application/json')
    expect(getContentType('my-file.css.map')).toBe('application/json')
    expect(getContentType('my-file.json')).toBe('application/json')
  })

  it('Should return the default content type for unknown file extensions', () => {
    expect(getContentType('my-file.unknown')).toBe('application/octet-stream')
  })
})
