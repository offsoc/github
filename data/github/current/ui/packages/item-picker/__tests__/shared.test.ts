import {getRepositorySearchQuery, getIssueSearchQueries, maybeIssueUrl} from '../shared'

describe('getRepositorySearchQuery', () => {
  test('returns simple string with no archived', () => {
    const query = getRepositorySearchQuery('test')

    expect(query).toMatchInlineSnapshot(`"in:name archived:false test"`)
  })

  test('simplify query for nameWithOwner search', () => {
    const query = getRepositorySearchQuery('cool-org/test')

    expect(query).toMatchInlineSnapshot(`"in:name archived:false org:cool-org test"`)
  })

  describe('organization', () => {
    test('adds organization filter', () => {
      const query = getRepositorySearchQuery('test', 'cool-org')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false org:cool-org test"`)
    })

    test('overwrites organization on nameWithOwner search', () => {
      const query = getRepositorySearchQuery('stinky-org/test', 'cool-org')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false org:stinky-org test"`)
    })
  })
  describe('excludeRepo', () => {
    test('adds repository exclusion filter', () => {
      const query = getRepositorySearchQuery('test', undefined, 'org/bad-repo')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false -repo:org/bad-repo test"`)
    })

    test('adds repository exclusion filter with nameWithOwner search', () => {
      const query = getRepositorySearchQuery('cool-org/test', undefined, 'org/bad-repo')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false -repo:org/bad-repo org:cool-org test"`)
    })
  })

  describe('all filters', () => {
    test('supports all filters', () => {
      const query = getRepositorySearchQuery('test', 'cool-org', 'org/bad-repo')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false -repo:org/bad-repo org:cool-org test"`)
    })

    test('supports all filters and nameWithOwner search', () => {
      const query = getRepositorySearchQuery('stinky-org/test', 'cool-org', 'cool-org/bad-repo')

      expect(query).toMatchInlineSnapshot(`"in:name archived:false -repo:cool-org/bad-repo org:stinky-org test"`)
    })
  })
})

describe('getIssueSearchQueries', () => {
  test('returns correct query with all parameters', () => {
    const query = getIssueSearchQueries('github', 'my issue', 'github/cool-repo')

    expect(query).toEqual({
      assignee: 'owner:github repo:github/cool-repo is:issue in:title assignee:@me my issue',
      author: 'owner:github repo:github/cool-repo is:issue in:title author:@me my issue',
      commenters: 'owner:github repo:github/cool-repo is:issue in:title commenter:@me my issue',
      mentions: 'owner:github repo:github/cool-repo is:issue in:title mentions:@me my issue',
      open: 'owner:github repo:github/cool-repo is:issue in:title state:open my issue',
      resource: '',
      queryIsUrl: false,
    })
  })

  test('returns correct query with only owner', () => {
    const query = getIssueSearchQueries('github')

    expect(query).toEqual({
      assignee: 'owner:github is:issue in:title assignee:@me',
      author: 'owner:github is:issue in:title author:@me',
      commenters: 'owner:github is:issue in:title commenter:@me',
      mentions: 'owner:github is:issue in:title mentions:@me',
      open: 'owner:github is:issue in:title state:open',
      resource: '',
      queryIsUrl: false,
    })
  })

  test('returns correct query with only query', () => {
    const query = getIssueSearchQueries('', 'super cool search terms')

    expect(query).toEqual({
      assignee: 'is:issue in:title assignee:@me super cool search terms',
      author: 'is:issue in:title author:@me super cool search terms',
      commenters: 'is:issue in:title commenter:@me super cool search terms',
      mentions: 'is:issue in:title mentions:@me super cool search terms',
      open: 'is:issue in:title state:open super cool search terms',
      resource: '',
      queryIsUrl: false,
    })
  })

  test('returns correct query with only repositoryFilter', () => {
    const query = getIssueSearchQueries('', '', 'github/another-cool-repo')

    expect(query).toEqual({
      assignee: 'repo:github/another-cool-repo is:issue in:title assignee:@me',
      author: 'repo:github/another-cool-repo is:issue in:title author:@me',
      commenters: 'repo:github/another-cool-repo is:issue in:title commenter:@me',
      mentions: 'repo:github/another-cool-repo is:issue in:title mentions:@me',
      open: 'repo:github/another-cool-repo is:issue in:title state:open',
      resource: '',
      queryIsUrl: false,
    })
  })

  test('returns correct query with no parameters', () => {
    const query = getIssueSearchQueries()

    expect(query).toEqual({
      assignee: 'is:issue in:title assignee:@me',
      author: 'is:issue in:title author:@me',
      commenters: 'is:issue in:title commenter:@me',
      mentions: 'is:issue in:title mentions:@me',
      open: 'is:issue in:title state:open',
      resource: '',
      queryIsUrl: false,
    })
  })

  test('returns correct query when query is valid issue URL', () => {
    const query = getIssueSearchQueries('', 'https://github.com/github/github/issues/1')

    expect(query).toEqual({
      assignee: 'is:issue in:title assignee:@me https://github.com/github/github/issues/1',
      author: 'is:issue in:title author:@me https://github.com/github/github/issues/1',
      commenters: 'is:issue in:title commenter:@me https://github.com/github/github/issues/1',
      mentions: 'is:issue in:title mentions:@me https://github.com/github/github/issues/1',
      open: 'is:issue in:title state:open https://github.com/github/github/issues/1',
      resource: 'https://github.com/github/github/issues/1',
      queryIsUrl: true,
    })
  })

  test('returns correct query when query is invalid issue URL', () => {
    const query = getIssueSearchQueries('', 'https://github.com/github/github/issues/x')

    expect(query).toEqual({
      assignee: 'is:issue in:title assignee:@me https://github.com/github/github/issues/x',
      author: 'is:issue in:title author:@me https://github.com/github/github/issues/x',
      commenters: 'is:issue in:title commenter:@me https://github.com/github/github/issues/x',
      mentions: 'is:issue in:title mentions:@me https://github.com/github/github/issues/x',
      open: 'is:issue in:title state:open https://github.com/github/github/issues/x',
      resource: '',
      queryIsUrl: false,
    })
  })
})

describe('isIssueUrl', () => {
  test('returns true for valid issue URL', () => {
    expect(maybeIssueUrl('https://github.com/github/github/issues/1')).toBe(true)
    expect(maybeIssueUrl('https://github.localhost/github/github/issues/1')).toBe(true)
    expect(maybeIssueUrl('https://monalisa.review-lab.github.com/github/github/issues/1')).toBe(true)
    expect(maybeIssueUrl('https://staffship-01.ghe.com/github/github/issues/1')).toBe(true)
    expect(maybeIssueUrl('https://me.io/github/github/issues/1')).toBe(true)
  })

  test('returns false for invalid issue URL', () => {
    expect(maybeIssueUrl('/github/github/issues/1')).toBe(false)
    expect(maybeIssueUrl('https://github.localhost/github/github/issues/x')).toBe(false)
    expect(maybeIssueUrl('https://staffship-01.ghe.com/github/github/pulls/1')).toBe(false)
    expect(maybeIssueUrl('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH')).toBe(false)
  })
})
