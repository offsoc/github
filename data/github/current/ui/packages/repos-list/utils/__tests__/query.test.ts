import {addSortToQuery, getSortFromQuery} from '../query'

describe('addSortToQuery', () => {
  it('adds the new sort term', () => {
    expect(addSortToQuery(undefined, 'name')).toBe('sort:name')
    expect(addSortToQuery('github', 'name')).toBe('github sort:name')
    expect(addSortToQuery('fork:only', 'name')).toBe('fork:only sort:name')
    expect(addSortToQuery('github fork:only pretty', 'name')).toBe('github fork:only pretty sort:name')
  })

  it('replaces one existing sort term', () => {
    expect(addSortToQuery('sort:updated', 'name')).toBe('sort:name')
    expect(addSortToQuery('sort:updated github', 'name')).toBe('github sort:name')
    expect(addSortToQuery('sort:updated fork:only', 'name')).toBe('fork:only sort:name')
    expect(addSortToQuery('github sort:updated', 'name')).toBe('github sort:name')
    expect(addSortToQuery('fork:only sort:updated', 'name')).toBe('fork:only sort:name')
  })

  it('replaces many existing sort terms', () => {
    expect(addSortToQuery('sort:updated sort:stars', 'name')).toBe('sort:name')
    expect(addSortToQuery('sort:updated github sort:stars', 'name')).toBe('github sort:name')
  })

  it('empty sort does not add any term', () => {
    expect(addSortToQuery(undefined, '')).toBe('')
    expect(addSortToQuery('github', '')).toBe('github')
    expect(addSortToQuery('fork:only', '')).toBe('fork:only')
    expect(addSortToQuery('github fork:only pretty', '')).toBe('github fork:only pretty')
  })

  it('empty sort removes any existing sort', () => {
    expect(addSortToQuery('sort:updated', '')).toBe('')
    expect(addSortToQuery('sort:updated github', '')).toBe('github')
    expect(addSortToQuery('sort:one sort:two github', '')).toBe('github')
  })
})

describe('getSortFromQuery', () => {
  it('gets nothing is no sort', () => {
    expect(getSortFromQuery(undefined)).toBe('')
    expect(getSortFromQuery('github')).toBe('')
    expect(getSortFromQuery('fork:only')).toBe('')
    expect(getSortFromQuery('github fork:only pretty')).toBe('')
  })

  it('gets sort content if solo', () => {
    expect(getSortFromQuery('sort:name')).toBe('name')
    expect(getSortFromQuery('sort:anything')).toBe('anything')
  })

  it('gets first sort content if many', () => {
    expect(getSortFromQuery('sort:one sort:two')).toBe('one')
    expect(getSortFromQuery('sort:one sort:two sort:three')).toBe('one')
  })

  it('an empty sort term is considered', () => {
    expect(getSortFromQuery('sort: sort:two sort:three')).toBe('')
  })

  it('gets sort when mixed with other filters', () => {
    expect(getSortFromQuery('a sort:one b')).toBe('one')
    expect(getSortFromQuery('fork:only sort:one sort')).toBe('one')
  })

  it('sort without colon is not a term', () => {
    expect(getSortFromQuery('sort one')).toBe('')
    expect(getSortFromQuery('sort sort:one sort')).toBe('one')
  })

  it('gets first sort when many mixed with other filters', () => {
    expect(getSortFromQuery('a sort:one b sort:two c')).toBe('one')
    expect(getSortFromQuery('fork:true sort:one fork:true sort:two fork:true sort:three')).toBe('one')
  })
})
