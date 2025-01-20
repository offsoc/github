import {makeScopingQuery, makeSourceRepos, reconstructDocsetRepos} from '../docset'

describe('makeScopingQuery', () => {
  it('does what it should', () => {
    expect(makeScopingQuery([{nameWithOwner: 'foo/bar', paths: []}])).toEqual('repo:foo/bar')
    expect(makeScopingQuery([{nameWithOwner: 'foo/bar', paths: ['baz']}])).toEqual('(repo:foo/bar path:baz)')
    expect(makeScopingQuery([{nameWithOwner: 'foo/bar', paths: ['baz', 'qux']}])).toEqual(
      '(repo:foo/bar (path:baz OR path:qux))',
    )
    expect(
      makeScopingQuery([
        {nameWithOwner: 'foo/bar', paths: ['baz', 'qux']},
        {nameWithOwner: 'foo/baz', paths: []},
      ]),
    ).toEqual('(repo:foo/bar (path:baz OR path:qux)) OR repo:foo/baz')
    expect(
      makeScopingQuery([
        {nameWithOwner: 'foo/bar', paths: ['baz', 'qux']},
        {nameWithOwner: 'foo/baz', paths: ['bing']},
      ]),
    ).toEqual('(repo:foo/bar (path:baz OR path:qux)) OR (repo:foo/baz path:bing)')
  })
})

describe('reconstructDocsetRepos', () => {
  const repos = [
    {
      databaseId: 1,
      name: 'bar',
      nameWithOwner: 'foo/bar',
      isInOrganization: true,
      shortDescriptionHTML: '',
      paths: undefined,
      owner: {
        databaseId: 2,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
    {
      databaseId: 2,
      name: 'baz',
      nameWithOwner: 'foo/baz',
      isInOrganization: true,
      shortDescriptionHTML: '',
      paths: undefined,
      owner: {
        databaseId: 3,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
    {
      databaseId: 3,
      name: 'bam',
      nameWithOwner: 'foo/bam',
      isInOrganization: true,
      shortDescriptionHTML: 'hello',
      paths: undefined,
      owner: {
        databaseId: 4,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
  ]

  it('handles a single repo', () => {
    const result = reconstructDocsetRepos('repo:foo/bar', repos)
    expect(result).toHaveLength(1)
    expect(result[0]).toStrictEqual({
      ...repos[0],
      paths: [],
    })
  })

  it('handles multiple repos with paths specified', () => {
    const result = reconstructDocsetRepos(
      'repo:foo/bar OR (repo:foo/baz path:docs/**) OR (repo:foo/bam (path:docs/** OR path:README.*))',
      repos,
    )

    expect(result).toHaveLength(3)
    expect(result[0]).toStrictEqual({
      ...repos[0],
      paths: [],
    })

    expect(result[1]).toStrictEqual({
      ...repos[1],
      paths: ['docs/**'],
    })
    expect(result[2]).toStrictEqual({
      ...repos[2],
      paths: ['docs/**', 'README.*'],
    })
  })

  it('ignores repos with no data available', () => {
    const result = reconstructDocsetRepos('repo:foo/bar OR repo:foo/asdf', repos)
    expect(result).toHaveLength(1)
  })

  it.each([
    ['repo:foo/bar path:*.txt', ['*.txt']],
    // eslint-disable-next-line no-useless-escape, prettier/prettier
    ['repo:foo/bar path:/(^|\/)README\.md$/', ['/(^|\/)README\.md$/']],
    ['repo:foo/bar path:/(^|/).*.(test|unit).(js|ts)$/', ['/(^|/).*.(test|unit).(js|ts)$/']],
    ['repo:foo/bar path:*.a?c', ['*.a?c']],
    ['repo:foo/bar path:"file?"', ['"file?"']],
    ['repo:foo/bar path:/^MIT.txt$/', ['/^MIT.txt$/']],
    ['repo:foo/bar path:docs', ['docs']],
    ['repo:foo/bar path:/docs', ['/docs']],
    ['repo:foo/bar path:/docs/', ['/docs/']],
    ['repo:foo/bar path:/docs$/', ['/docs$/']],
    ['repo:foo/bar path:/docs/**/*', ['/docs/**/*']],
    // eslint-disable-next-line no-useless-escape, prettier/prettier
    ['repo:foo/bar path:/\/docs\//', ['/\/docs\//']],
    ['repo:foo/bar path:/\\/docs\\/.*/', ['/\\/docs\\/.*/']],
    ['repo:foo/bar (path:/docs** OR path:/docs.*/)', ['/docs**', '/docs.*/']],
    ['(repo:foo/bar (path:/docs** OR path:/docs.*/))', ['/docs**', '/docs.*/']],
    ['repo:foo/baz OR (repo:foo/bar (path:/docs** OR path:/docs.*/))', ['/docs**', '/docs.*/']],
    ['(repo:foo/bar (path:/docs** OR path:/docs.*/)) OR (repo:foo/baz path:/notes/)', ['/docs**', '/docs.*/']],
  ])('parses path correctly: "%s"', (scopingQuery, expected) => {
    const repo = {
      databaseId: 1,
      name: 'bar',
      nameWithOwner: 'foo/bar',
      isInOrganization: true,
      shortDescriptionHTML: '',
      paths: undefined,
      owner: {
        databaseId: 2,
        login: 'foo',
        avatarUrl: '/foo',
      },
    }

    const result = reconstructDocsetRepos(scopingQuery, [repo])
    expect(result[0]?.paths).toStrictEqual(expected)
  })
})

describe('makeSourceRepos', () => {
  const repos = [
    {
      databaseId: 1,
      name: 'bar',
      nameWithOwner: 'foo/bar',
      isInOrganization: true,
      shortDescriptionHTML: '',
      paths: [],
      owner: {
        databaseId: 2,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
    {
      databaseId: 2,
      name: 'baz',
      nameWithOwner: 'foo/baz',
      isInOrganization: true,
      shortDescriptionHTML: '',
      paths: ['/docs/**'],
      owner: {
        databaseId: 3,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
    {
      databaseId: 3,
      name: 'bam',
      nameWithOwner: 'foo/bam',
      isInOrganization: true,
      shortDescriptionHTML: 'hello',
      paths: ['/docs/**', '/docs/'],
      owner: {
        databaseId: 4,
        login: 'foo',
        avatarUrl: '/foo',
      },
    },
  ]

  it('returns correct components', () => {
    const sourceRepos = makeSourceRepos(repos)

    expect(sourceRepos.length).toEqual(repos.length)
    for (const [i, repo] of repos.entries()) {
      expect(sourceRepos[i]).toEqual({
        id: repo.databaseId,
        ownerID: repo.owner.databaseId,
        paths: repo.paths,
      })
    }
  })
})
