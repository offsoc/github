import {getFileExtension} from '../get-file-extension'

describe('getFileExtension', () => {
  test('when given a string as the path rather than a file object, return the file extension', () => {
    const newPath = 'newPath.js'

    expect(getFileExtension(newPath)).toBe('.js')
  })

  test('when given a string path without a file extension, returns "No extension"', () => {
    const newPath = 'CODEOWNERS'

    expect(getFileExtension(newPath)).toBe('No extension')
  })

  test('when new path and old path have different extensions, return the new path', () => {
    const file = {
      newPath: 'newPath.js',
      oldPath: 'oldPath.ts',
    }
    expect(getFileExtension(file)).toBe('.js')
  })

  test('when new path does not exist, return the old path file extension', () => {
    const file = {
      oldPath: 'oldPath.ts',
      newPath: undefined,
    }
    expect(getFileExtension(file)).toBe('.ts')
  })

  test('when there is no path, return an empty string', () => {
    // usually this means something is very wrong with the file
    const file = {
      oldPath: undefined,
      newPath: undefined,
    }
    expect(getFileExtension(file)).toBe('')
  })

  test('when the file has no extension, returns "No extension"', () => {
    const file = {
      oldPath: 'oldPath',
      newPath: 'newPath',
    }
    expect(getFileExtension(file)).toBe('No extension')
  })
})
