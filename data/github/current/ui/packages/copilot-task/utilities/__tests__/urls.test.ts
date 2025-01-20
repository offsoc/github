import {fileUrl, newFileUrl, overviewUrl} from '../urls'

describe('overview', () => {
  const args = {owner: 'owner', repo: 'repo', pullNumber: '1'}

  test('plain', () => {
    const location = {search: ''}
    expect(overviewUrl({...args, location})).toBe('/owner/repo/pull/1/edit')
  })

  test('with query params', () => {
    const location = {search: '?stuff=things'}
    expect(overviewUrl({...args, location})).toBe('/owner/repo/pull/1/edit?stuff=things')
  })
})

describe('fileUrl', () => {
  const args = {owner: 'owner', repo: 'repo', pullNumber: '1', path: 'README.md'}

  test('plain', () => {
    const location = {search: ''}
    expect(fileUrl({...args, location})).toBe('/owner/repo/pull/1/edit/file/README.md')
  })

  test('with query params', () => {
    const location = {search: '?stuff=things'}
    expect(fileUrl({...args, location})).toBe('/owner/repo/pull/1/edit/file/README.md?stuff=things')
  })
})

describe('newFileUrl', () => {
  const args = {owner: 'owner', repo: 'repo', pullNumber: '1'}

  test('plain', () => {
    const location = {search: ''}
    expect(newFileUrl({...args, location})).toBe('/owner/repo/pull/1/edit/new')
  })

  test('with query params', () => {
    const location = {search: '?stuff=things'}
    expect(newFileUrl({...args, location})).toBe('/owner/repo/pull/1/edit/new?stuff=things')
  })
})
