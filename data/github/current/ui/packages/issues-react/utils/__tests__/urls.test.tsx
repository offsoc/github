import {QUERIES} from '@github-ui/query-builder/constants/queries'
import {
  explodeIssueNewPathToRepositoryData,
  getClosedHref,
  getCurrentRepoIssuesUrl,
  getHrefForTabs,
  getOpenHref,
  getUrlWithHash,
  isClosedQuery,
  isDefaultView,
  isNewIssuePathForRepo,
  isCustomViewIssuePathForRepo,
  cleanCustomViewIssueUrl,
  isOpenQuery,
  isNegatedOpenQuery,
  isNegatedClosedQuery,
  parseValidProjectNumbersFromUrlParameter,
  searchUrl,
  replaceAllFiltersByTypeInSearchQuery,
  validateSearchQuery,
  addPagingParams,
  type TokenType,
  getTokensByType,
  isUrlInRepoIssuesContext,
  replaceTokensDifferentially,
} from '../../utils/urls'
import {VIEW_IDS} from '../../constants/view-constants'
import {VALUES} from '../../constants/values'

const ssrSafeLocationMock = jest.fn()

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return ssrSafeLocationMock()
  },
}))

test('searchUrl returns default value', () => {
  const url = searchUrl({viewId: undefined, query: undefined})
  expect(url).toBe('/issues')
})

test('searchUrl returns clean url when query matched assignedToMe saved view', () => {
  const url = searchUrl({viewId: undefined, query: QUERIES.assignedToMe})
  expect(url).toBe('/issues/assigned')
})

test('searchUrl returns clean url when query matched createdByMe saved view', () => {
  const url = searchUrl({viewId: undefined, query: QUERIES.createdByMe})
  expect(url).toBe('/issues/createdByMe')
})

test('searchUrl returns clean url when query matched mentioned saved view', () => {
  const url = searchUrl({viewId: undefined, query: QUERIES.mentioned})
  expect(url).toBe('/issues/mentioned')
})

test('searchUrl returns url from assigned viewId', () => {
  const url = searchUrl({viewId: VIEW_IDS.assignedToMe, query: undefined})
  expect(url).toBe('/issues/assigned')
})

test('searchUrl returns url from createdByMe viewId', () => {
  const url = searchUrl({viewId: VIEW_IDS.createdByMe, query: undefined})
  expect(url).toBe('/issues/createdByMe')
})

test('searchUrl returns url from mentioned viewId', () => {
  const url = searchUrl({viewId: VIEW_IDS.mentioned, query: undefined})
  expect(url).toBe('/issues/mentioned')
})

test('searchUrl returns url from recentActivity viewId', () => {
  const url = searchUrl({viewId: VIEW_IDS.recentActivity, query: undefined})
  expect(url).toBe('/issues/recentActivity')
})

test('searchUrl returns view uid', () => {
  const url = searchUrl({viewId: 'some_global_id'})
  expect(url).toBe(`/issues/some_global_id`)
})

test('searchUrl does not return clean url when there is a custom view uid', () => {
  const url = searchUrl({viewId: 'some_global_id', query: QUERIES.assignedToMe})
  expect(url).toBe(`/issues/some_global_id?q=${encodeURIComponent(QUERIES.assignedToMe)}`)
})

test('searchUrl returns url when running at the repository level', () => {
  const repoNames = ['repo', 'repo.-_', '.repo', '_repo', '-repo_repo_-repo.repo-repo_repo', '-1-0']
  for (const repoName of repoNames) {
    ssrSafeLocationMock.mockImplementation(() => ({pathname: `/owner/${repoName}/issues`}))
    const url = searchUrl({viewId: VIEW_IDS.repository, query: 'state:closed'})
    expect(url).toBe(`/owner/${repoName}/issues?q=${encodeURIComponent('state:closed')}`)
  }
})

test('searchUrl returns dashboard url for invalid repo names', () => {
  const repoNames = ['|', 'new|repo', 'repo%name', '%%repo', 'repo/tt', 'repo/akenneth']
  for (const repoName of repoNames) {
    ssrSafeLocationMock.mockImplementation(() => ({pathname: `/owner/${repoName}/issues`}))
    const url = searchUrl({viewId: VIEW_IDS.repository, query: 'state:closed'})
    expect(url).toBe(`/issues?q=${encodeURIComponent('state:closed')}`)
  }
})

describe('isUrlInRepoIssuesContext', () => {
  // Mock window.location.origin
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = {origin: 'http://localhost'} as any
  })

  it('returns false if the URL does not start with the origin', () => {
    const url = 'http://notlocalhost/user/repo/issues'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(false)
  })

  it('returns false if the URL does not contain the repo issues path', () => {
    const url = 'http://localhost/user/repo/pulls'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(false)
  })

  it('returns false if the URL contains funky naming', () => {
    const url = 'http://localhost/repouser/repo/issues'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(false)
  })

  it('returns true if the URL is a repo issues URL', () => {
    const url = 'http://localhost/user/repo/issues'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(true)
  })

  it('returns true if the URL is a repo issue URL', () => {
    const url = 'http://localhost/user/repo/issues/34'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(true)
  })

  it('returns true if the URL is a repo issue comment URL', () => {
    const url = 'http://localhost/user/repo/issues/34#issue-comment-21'
    expect(isUrlInRepoIssuesContext(url, 'user', 'repo')).toBe(true)
  })
})

test('parseValidProjectNumbersFromUrlParameters correctly extracts numbers for valid owner', () => {
  expect(parseValidProjectNumbersFromUrlParameter('github/1', 'notgithub')).toEqual([])
  expect(parseValidProjectNumbersFromUrlParameter('github/1', undefined)).toEqual([])
  expect(parseValidProjectNumbersFromUrlParameter('github/1', 'github')).toEqual([1])
  expect(parseValidProjectNumbersFromUrlParameter('github/1,github/2,random/3', 'github')).toEqual([1, 2])
  expect(parseValidProjectNumbersFromUrlParameter('random,2/3,malformed123,random/2,3/random', 'random')).toEqual([2])
  expect(parseValidProjectNumbersFromUrlParameter('random,two/3,malformed123,random/2,3/random,two/-5', 'two')).toEqual(
    [3],
  )
})

test('isNewIssuePathForRepo', () => {
  expect(isNewIssuePathForRepo('/owner/repo/issues/new')).toBe(true)
  expect(isNewIssuePathForRepo('/owner/repo/issues/new/choose')).toBe(true)
  expect(isNewIssuePathForRepo('/owner/repo/issues/new?valid=param')).toBe(true)
  expect(isNewIssuePathForRepo('/owner/repo/issues/new/choose?valid=param')).toBe(true)
  expect(isNewIssuePathForRepo('/owner/repo/issues/new/choose?valid=param&valid2=param2')).toBe(true)

  expect(isNewIssuePathForRepo('/issues/new')).toBe(false)
  expect(isNewIssuePathForRepo('/issues/new/choose')).toBe(false)
  expect(isNewIssuePathForRepo('/issues/new?valid=param')).toBe(false)
  expect(isNewIssuePathForRepo('/owner/repo/issues')).toBe(false)
  expect(isNewIssuePathForRepo('/owner/issues')).toBe(false)
})

test('isCustomViewIssuePathForRepo', () => {
  expect(isCustomViewIssuePathForRepo('/owner/repo/issues/created_by/monalisa')).toBe(true)
  expect(isCustomViewIssuePathForRepo('/owner/repo/issues/created_by/monalisa?valid=param&valid2=param2')).toBe(true)
  expect(isCustomViewIssuePathForRepo('/owner/repo/issues/mentioned/monalisa?valid=param&valid2=param2')).toBe(true)
  expect(isCustomViewIssuePathForRepo('/owner/repo/issues/assigned/monalisa')).toBe(true)

  expect(isCustomViewIssuePathForRepo('/issues/created_by')).toBe(false)
  expect(isCustomViewIssuePathForRepo('/issues/assigned/monalisa')).toBe(false)
  expect(isCustomViewIssuePathForRepo('/issues/created_by?valid=param')).toBe(false)
  expect(isCustomViewIssuePathForRepo('/issues/mentioned?valid=param')).toBe(false)
})

test('cleanCustomViewIssueUrl', () => {
  expect(cleanCustomViewIssueUrl('/owner/repo/issues/created_by/monalisa', 'monalisa')).toBe('/owner/repo/issues')
  expect(cleanCustomViewIssueUrl('/owner/repo/issues/created_by/monalisa?valid=param', 'monalisa')).toBe(
    '/owner/repo/issues?valid=param',
  )
  expect(cleanCustomViewIssueUrl('/owner/repo/issues/created_by/monalisa?valid=param&valid2=param2', 'monalisa')).toBe(
    '/owner/repo/issues?valid=param&valid2=param2',
  )

  expect(cleanCustomViewIssueUrl('/owner/repo/issues/monalisa', 'monalisa')).toBe('/owner/repo/issues/monalisa')
  expect(cleanCustomViewIssueUrl('/owner/repo/issues/monalisa?valid=param', 'monalisa')).toBe(
    '/owner/repo/issues/monalisa?valid=param',
  )
})

test('explodeIssueNewPathToRepositoryData', () => {
  expect(explodeIssueNewPathToRepositoryData('/owner/repo/issues/new')).toEqual({
    owner: 'owner',
    name: 'repo',
  })
  expect(explodeIssueNewPathToRepositoryData('/special/repo2/issues/new')).toEqual({
    owner: 'special',
    name: 'repo2',
  })
  expect(explodeIssueNewPathToRepositoryData('/another/owner/issues')).toEqual(undefined)
  expect(explodeIssueNewPathToRepositoryData('/owner/repo/issues/new/choose')).toEqual({
    owner: 'owner',
    name: 'repo',
  })
  expect(explodeIssueNewPathToRepositoryData('/owner2/repo/issues/new?valid=param')).toEqual({
    owner: 'owner2',
    name: 'repo',
  })
  expect(explodeIssueNewPathToRepositoryData('')).toEqual(undefined)
  expect(explodeIssueNewPathToRepositoryData('/')).toEqual(undefined)
  expect(explodeIssueNewPathToRepositoryData('/owner')).toEqual(undefined)
})

test('getOpenHref', () => {
  expect(getOpenHref('is:issue state:open')).toBe('')
  expect(getOpenHref('is:issue is:open')).toBe('is:issue state:open')
  expect(getOpenHref('state:open  is:issue ')).toBe('')
  expect(getOpenHref('is:open  is:issue ')).toBe('state:open  is:issue')
  expect(getOpenHref('is:issue ')).toBe('is:issue state:open')
  expect(getOpenHref('state:closed ')).toBe('state:open')
  expect(getOpenHref('is:closed ')).toBe('state:open')
  expect(getOpenHref('is:issue state:closed assignee:@me')).toBe('is:issue state:open assignee:@me')
  expect(getOpenHref('is:issue is:closed assignee:@me ')).toBe('is:issue state:open assignee:@me')
  expect(getOpenHref('is:issue leadingis:open assignee:@me')).toBe('is:issue leadingis:open assignee:@me state:open')
  expect(getOpenHref('is:issue is:opentrailing assignee:@me')).toBe('is:issue is:opentrailing assignee:@me state:open')
  expect(getOpenHref('-state:closed')).toBe('-state:closed')
  expect(getOpenHref('-state:open')).toBe('-state:closed')
})

test('getClosedHref', () => {
  expect(getClosedHref('is:issue state:open')).toBe('is:issue state:closed')
  expect(getClosedHref('is:issue is:open')).toBe('is:issue state:closed')
  expect(getClosedHref('state:open  is:issue ')).toBe('is:issue state:closed')
  expect(getClosedHref('is:open  is:issue ')).toBe('is:issue state:closed')
  expect(getClosedHref('is:issue ')).toBe('is:issue state:closed')
  expect(getClosedHref('state:closed ')).toBe('state:closed')
  expect(getClosedHref('is:closed ')).toBe('state:closed')
  expect(getClosedHref('state:closed ')).toBe('state:closed')
  expect(getClosedHref('is:issue is:closed assignee:@me')).toBe('is:issue state:closed assignee:@me')
  expect(getClosedHref('is:issue state:closed assignee:@me')).toBe('is:issue state:closed assignee:@me')
  expect(getClosedHref('is:issue leadingis:open assignee:@me')).toBe(
    'is:issue leadingis:open assignee:@me state:closed',
  )
  expect(getClosedHref('is:issue is:opentrailing assignee:@me')).toBe(
    'is:issue is:opentrailing assignee:@me state:closed',
  )
  expect(getClosedHref('-state:open')).toBe('-state:open')
  expect(getClosedHref('-state:closed')).toBe('-state:open')
})

test('isDefaultView', () => {
  expect(isDefaultView('is:issue state:open')).toBeTruthy()
  expect(isDefaultView('is:issue state:closed')).toBeTruthy()
  expect(isDefaultView('is:issue state:open assignee:@me')).toBeFalsy()
  expect(isDefaultView('is:issue state:closed assignee:@me')).toBeFalsy()
})

test('isOpenQuery', () => {
  expect(isOpenQuery('is:issue state:open')).toBeTruthy()
  expect(isOpenQuery('is:issue state:closed')).toBeFalsy()
})

test('isClosedQuery', () => {
  expect(isClosedQuery('is:issue state:open')).toBeFalsy()
  expect(isClosedQuery('is:issue state:closed')).toBeTruthy()
})

test('isNegatedOpenQuery', () => {
  expect(isNegatedOpenQuery('is:issue -state:open')).toBeTruthy()
  expect(isNegatedOpenQuery('is:issue -state:closed')).toBeFalsy()
})

test('isNegatedClosedQuery', () => {
  expect(isNegatedClosedQuery('is:issue -state:open')).toBeFalsy()
  expect(isNegatedClosedQuery('is:issue -state:closed')).toBeTruthy()
})

test('href for default activeSearchQuery', () => {
  const [openHref, closedHref] = getHrefForTabs('is:issue state:open')
  expect(openHref).toBe('')
  expect(closedHref).toBe('is:issue state:closed')
})

test('href for default activeSearchQuery with spaces', () => {
  const [openHref, closedHref] = getHrefForTabs('state:open  is:issue ')
  expect(openHref).toBe('')
  expect(closedHref).toBe('is:issue state:closed')
})

test('href for default activeSearchQuery without state', () => {
  const [openHref, closedHref] = getHrefForTabs('is:issue ')
  expect(openHref).toBe('is:issue state:open')
  expect(closedHref).toBe('is:issue state:closed')
})

test('href for default activeSearchQuery with only state', () => {
  const [openHref, closedHref] = getHrefForTabs('state:closed ')
  expect(openHref).toBe('state:open')
  expect(closedHref).toBe('state:closed')
})

test('href for default activeSearchQuery with additional filters', () => {
  const [openHref, closedHref] = getHrefForTabs('is:issue state:closed assignee:@me')
  expect(openHref).toBe('is:issue state:open assignee:@me')
  expect(closedHref).toBe('is:issue state:closed assignee:@me')
})

test('href is str empty when activeSearchQuery is null', () => {
  const [openHref, closedHref] = getHrefForTabs(' ')
  expect(openHref).toBe('')
  expect(closedHref).toBe('')
})

test('gets a simple repo url from issue viewer hyperlist-web', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/hyperlist-web/issues/1'}))
  expect(getCurrentRepoIssuesUrl()).toBe('/github/hyperlist-web/issues')
})

test('gets a simple repo url from issue viewer with query', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/hyperlist-web/issues/144'}))
  expect(getCurrentRepoIssuesUrl({query: 'state:open'})).toBe('/github/hyperlist-web/issues?q=state%3Aopen')
})

test('doesnt include query if its the default repository query', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/hyperlist-web/issues/144'}))
  expect(getCurrentRepoIssuesUrl({query: 'is:issue state:open'})).toBe('/github/hyperlist-web/issues')
})

test('gets a simple repo url from issue viewer', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/issues/issues/13'}))
  expect(getCurrentRepoIssuesUrl()).toBe('/github/issues/issues')
})

test('gets a simple repo url from issue new', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/hyperlist-web/issues/new'}))
  expect(getCurrentRepoIssuesUrl()).toBe('/github/hyperlist-web/issues')
})

test('gets a simple repo url from issue new/choose', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/issues/issues/new/choose'}))
  expect(getCurrentRepoIssuesUrl()).toBe('/github/issues/issues')
})

test('gets a simple repo url from issue viewer with query hyperlist-web', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/hyperlist-web/issues/1'}))
  expect(getCurrentRepoIssuesUrl({query: 'state:open'})).toBe('/github/hyperlist-web/issues?q=state%3Aopen')
})

test('gets a simple repo url from issue viewer with query when the repo is called issues', () => {
  ssrSafeLocationMock.mockImplementation(() => ({pathname: '/github/issues/issues/155'}))
  expect(getCurrentRepoIssuesUrl({query: 'state:open'})).toBe('/github/issues/issues?q=state%3Aopen')
})

test('parse url with no hash', () => {
  const url = '/github/issues/issues/155'
  let href = 'https://github/issues/issues/155'

  let result = getUrlWithHash(url, href)

  expect(result).toBe(url)

  href = 'https://github/issues/issues/155#'

  result = getUrlWithHash(url, href)

  expect(result).toBe(url)
})

test('parse url with hash', () => {
  const url = '/github/issues/issues/155'
  const href = 'https://github/issues/issues/155#issuecomment-1234'

  const result = getUrlWithHash(url, href)

  expect(result).toBe(`${url}#issuecomment-1234`)
})

// replaceTokensDifferentially
test('replaces multiple occurences spaces in a query & trims', () => {
  const query = ' is:open   type:issue  state:open '
  const result = replaceTokensDifferentially(query, [], 'label')
  expect(result).toBe('is:open type:issue state:open')
})

test('replaces multiple occurences spaces in a query, ignoring spaces within quotes', () => {
  const query = ' is:open   type:issue'
  const result = replaceTokensDifferentially(query, ['"💯  spaces  inside"'], 'label')
  expect(result).toBe('is:open type:issue label:"💯  spaces  inside"')
})

// replaceAllFiltersByTypeInSearchQuery
test('add tokens in a clean query', () => {
  const query = 'is:issue state:open'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['bug', 'test'], 'label')
  expect(result).toBe('is:issue state:open label:bug,test')
})

test('replaces multiple occurences of one filter type', () => {
  const query = 'is:issue label:test state:open label:bug'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['ladybug'], 'label')
  expect(result).toBe('is:issue state:open label:ladybug')
})

test('replaces multiple occurences of one filter type with spaces', () => {
  const query = 'is:issue label:test state:open label:bug'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['lady bug'], 'label')
  expect(result).toBe('is:issue state:open label:"lady bug"')
})

test('replaces multiple occurences of one filter type with spaces and commas', () => {
  const query = 'is:issue label:test state:open label:bug'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['lady bug', 'insect'], 'label')
  expect(result).toBe('is:issue state:open label:"lady bug",insect')
})

test('replaces multiple occurences of one filter type with spaces and commas, ignoring spaces within quotes', () => {
  const query = 'is:issue label:test state:open something:"a  space" label:bug'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['lady  bug', 'insect'], 'label')
  expect(result).toBe('is:issue state:open something:"a  space" label:"lady  bug",insect')
})

test('replaces multi values with multiple new values', () => {
  const query = 'is:issue label:running state:open label:bug,test,doc'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['lady bug', 'insect'], 'label')
  expect(result).toBe('is:issue state:open label:"lady bug",insect')
})

test('replaces tokens when emojis are involed', () => {
  const query = 'is:issue label:running state:open label:bug🐛,test,doc'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['lady bug 🐞', 'insect'], 'label')
  expect(result).toBe('is:issue state:open label:"lady bug 🐞",insect')
})

test('clears the type if no values are passed', () => {
  const query = 'is:issue label:test state:open label:bug'
  const result = replaceAllFiltersByTypeInSearchQuery(query, [], 'label')
  expect(result).toBe('is:issue state:open')
})

test('replaces a negative filter with value of same type', () => {
  const query = 'is:issue state:open no:milestone'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['Milestone1'], 'milestone')
  expect(result).toBe('is:issue state:open milestone:Milestone1')
})

test('does not replace a negative filter with value of different type', () => {
  const query = 'is:issue state:open no:milestone'
  const result = replaceAllFiltersByTypeInSearchQuery(query, ['insect'], 'label')
  expect(result).toBe('is:issue state:open no:milestone label:insect')
})

// addPagingParams
test('parse pagination params from url correctly setting `skip` and `first` as expected', () => {
  ;[
    {url: 'page=1&pageSize=25', expected: {first: 25, skip: 0}},
    {url: 'page=2&pageSize=25', expected: {first: 25, skip: 25}},
    {url: 'page=3&pageSize=3', expected: {first: 3, skip: 6}},
    {url: 'page=50&pageSize=5', expected: {first: 5, skip: 245}},
    {url: 'page=4', expected: {skip: VALUES.issuesPageSizeDefault * 3}},
    {url: 'pageSize=3', expected: {skip: 0, first: 3}},
    {url: 'page=-3&pageSize=-2', expected: {skip: 0}},
    {url: 'page=x&pageSize=y', expected: {skip: 0}},
    {url: '', expected: {skip: 0}},
  ].map(({url, expected}) => {
    const urlParams = new URLSearchParams(url)
    const variables = {} as Record<string, string | number | boolean | undefined>
    addPagingParams(urlParams, variables)
    expect(variables).toEqual(expected)
  })
})

// validateSearchQuery
test('returns the valid query', () => {
  const query = 'is:issue state:open'
  const result = validateSearchQuery(query)
  expect(result).toBe('is:issue state:open')
})

test('removes the state in the query if is invalid', () => {
  const query = 'is:issue state:bla'
  const result = validateSearchQuery(query)
  expect(result).toBe('is:issue')
})

test('removes the is in the query if is invalid', () => {
  const query = 'is:bla state:open'
  const result = validateSearchQuery(query)
  expect(result).toBe('state:open')
})

test('removes the state in the query if is invalid and leaves other filters', () => {
  const query = 'is:pr state:open. bug'
  const result = validateSearchQuery(query)
  expect(result).toBe('is:pr bug')
})

test('removes the state in the query if is invalid and doesnt break quoted filters', () => {
  const query = 'is:pr state:open. bug label:"good first issue"'
  const result = validateSearchQuery(query)
  expect(result).toBe('is:pr bug label:"good first issue"')
})

test('removes the state in the query if has special characters', () => {
  const query = 'is:pr state:.&//) bug label:"good first issue"'
  const result = validateSearchQuery(query)
  expect(result).toBe('is:pr bug label:"good first issue"')
})

describe('getTokensByType', () => {
  test('should return correct tokens for a given type', () => {
    const input = 'is:issue label:bug,"something new"'
    const type: TokenType = 'label'
    const expectedOutput = ['bug', '"something new"']

    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })

  test('should return empty array if no tokens of the given type exist', () => {
    const input = 'is:issue label:bug,"something new"'
    const type: TokenType = 'assignee'

    const result = getTokensByType(input, type)
    expect(result).toEqual([])
  })

  test('should return all tokens of a given type', () => {
    const input = 'is:issue label:bug,"something new","something old"'
    const type: TokenType = 'label'
    const expectedOutput = ['bug', '"something new"', '"something old"']

    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })

  test('should return all tokens of a given type when the type is repeated', () => {
    const input = 'is:issue label:bug,"something new" label:"something old"'
    const type: TokenType = 'label'
    const expectedOutput = ['bug', '"something new"', '"something old"']

    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })

  test('should work for labels with : inside', () => {
    const input = 'is:issue label:bug,"something::new" label:"something:old"'
    const type: TokenType = 'label'
    const expectedOutput = ['bug', '"something::new"', '"something:old"']

    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })

  test('should return empty array for empty input string', () => {
    const input = ''
    const type: TokenType = 'label'
    const result = getTokensByType(input, type)
    expect(result).toEqual([])
  })

  test('should return empty array for input string without any tokens', () => {
    const input = 'This is a test string without any tokens'
    const type: TokenType = 'label'
    const result = getTokensByType(input, type)
    expect(result).toEqual([])
  })

  test('should return correct tokens for input string with different types of tokens', () => {
    const input = 'is:issue label:"something new" assignee:johndoe'
    const type: TokenType = 'label'
    const expectedOutput = ['"something new"']
    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })

  test('should handle case sensitivity correctly', () => {
    const input = 'is:issue Label:bug label:test'
    const type: TokenType = 'label'
    const expectedOutput = ['bug', 'test'] // assuming the function is case-sensitive
    const result = getTokensByType(input, type)
    expect(result).toEqual(expectedOutput)
  })
})
