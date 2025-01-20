import {isIgnoredAsset} from '../ignored-assets'

describe('ignored-assets', () => {
  it('Should ignore manifest files', () => {
    expect(isIgnoredAsset('manifest.json')).toBe(true)
    expect(isIgnoredAsset('manifest.css.json')).toBe(true)
    expect(isIgnoredAsset('manifest.alloy.json')).toBe(true)
  })

  it('Should not ignore normal files', () => {
    expect(isIgnoredAsset('my-file-abc123.css')).toBe(false)
    expect(isIgnoredAsset('my-file-abc123.js')).toBe(false)
    expect(isIgnoredAsset('my-file-abc123.json')).toBe(false)
  })
})
