import {checkIfQuerySupportsPr, checkIfStateReasonPresent, getQuery, parseQuery} from '../query'
import {isFeatureEnabled} from '@github-ui/feature-flags'

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockedIsFeatureEnabled = jest.mocked(isFeatureEnabled)

test('returns correct text query, no scoped repository', () => {
  const query = getQuery('test')
  expect(query).toEqual('test')
})

test('returns correct repo query, no scoped repository', () => {
  const query = getQuery('repo:github/issues')
  expect(query).toEqual('repo:github/issues')
})

test('returns correct assignee query, no scoped repository', () => {
  const query = getQuery('assignee:monalisa')
  expect(query).toEqual('assignee:monalisa')
})

test('returns correct org query, no scoped repository', () => {
  const query = getQuery('org:github')
  expect(query).toEqual('org:github')
})

test('returns correct user query, no scoped repository', () => {
  const query = getQuery('user:monalisa')
  expect(query).toEqual('user:monalisa')
})

test('returns correct query, scoped repository', () => {
  const query = getQuery('test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')
})

test('scoped repository overwrite existing repo', () => {
  const query = getQuery('test repo:facebook/react', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')
})

test('scoped repository overwrite existing org', () => {
  const query = getQuery('test repo:facebook/react', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')
})

test('scoped repository overwrite existing user', () => {
  const query = getQuery('test user:facebook', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')
})

test('do not group search qualifiers is', () => {
  const query = getQuery('test is:issue state:open', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue state:open repo:github/issues sort:created-desc')
})

test('do not group search assignees', () => {
  const query = getQuery('test assignee:monalisa assignee:octocat', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test assignee:monalisa assignee:octocat repo:github/issues sort:created-desc')
})

test('scoped repository overwrite multiples', () => {
  const query = getQuery(
    'test with multiple entries repo:facebook/react assignee:monalisa user:microsoft org:facebook repo:microsoft/vscode more content',
    {
      owner: 'github',
      name: 'issues',
    },
  )
  expect(query).toEqual(
    'test with multiple entries more content assignee:monalisa repo:github/issues sort:created-desc',
  )
})

test('no scoped repository multiple entries, no overwrite', () => {
  const query = getQuery('test with multiple entries repo:facebook/react assignee:monalisa user:facebook more content')
  expect(query).toEqual('test with multiple entries repo:facebook/react assignee:monalisa user:facebook more content')
})

test('space with sort', () => {
  const query = getQuery('is:issue state:open sort:created-desc', {
    owner: 'github',
    name: 'issues',
  })
  expect(query).toEqual('is:issue state:open sort:created-desc repo:github/issues')
})

test('parsing query with value that has colon returns correct result', () => {
  const query = parseQuery('label:new:experience assignee:username:with_colon')
  expect(query.get('assignee')).toEqual(['username:with_colon'])
  expect(query.get('label')).toEqual(['new:experience'])
})

test('parsing query with value that has space returns correct result', () => {
  const query = parseQuery('is:issue label:"p2 bug" milestone:"ship it 2024"')
  expect(query.get('label')).toEqual(['"p2 bug"'])
  expect(query.get('milestone')).toEqual(['"ship it 2024"'])
})

test('in repo index scope, does not remove pr type if present', () => {
  let query = getQuery('test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')

  query = getQuery('type:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test type:pr repo:github/issues sort:created-desc')

  query = getQuery('is:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:pr repo:github/issues sort:created-desc')

  query = getQuery('type:issue test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test type:issue repo:github/issues sort:created-desc')

  query = getQuery('is:issue test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue repo:github/issues sort:created-desc')

  query = getQuery('is:issue type:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue type:pr repo:github/issues sort:created-desc')

  query = getQuery('is:issue is:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue is:pr repo:github/issues sort:created-desc')

  query = getQuery('is:open is:issue test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:open is:issue repo:github/issues sort:created-desc')

  query = getQuery('is:issue type:issue test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue repo:github/issues sort:created-desc')

  query = getQuery('is:pr type:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:pr repo:github/issues sort:created-desc')

  query = getQuery('is:pr is:open type:pr test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:pr is:open repo:github/issues sort:created-desc')
})

test('in repo index scope, remove user qualifier', () => {
  let query = getQuery('test @someuser', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')

  query = getQuery('@someuser test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test repo:github/issues sort:created-desc')

  query = getQuery('assignee:@me @someuser test', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test assignee:@me repo:github/issues sort:created-desc')
})

test('in repo index scope, does not add default sort param if sort param exists', () => {
  const query = getQuery('is:issue test sort:comments-desc', {owner: 'github', name: 'issues'})
  expect(query).toEqual('test is:issue sort:comments-desc repo:github/issues')
  expect(query).not.toEqual('test is:issue sort:comments-desc repo:github/issues sort:created-desc')
})

test('in dashboard scope, dont remove user qualifier', () => {
  let query = getQuery('test @someuser', undefined)
  expect(query).toEqual('test @someuser')

  query = getQuery('@someuser test', undefined)
  expect(query).toEqual('@someuser test')

  query = getQuery('assignee:@me @someuser test', undefined)
  expect(query).toEqual('assignee:@me @someuser test')
})

describe('issues advanced search tests', () => {
  test('parses advanced search syntax', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('( is:pr AND assignee:@monalisa ) trousers', {owner: 'github', name: 'issues'})
    expect(query).toEqual('( is:pr AND assignee:@monalisa ) trousers repo:github/issues sort:created-desc')
    expect(query).not.toEqual('( AND ) trousers is:pr assignee:@monalisa')
  })

  test('parses syntax without spaces around parentheses', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('(is:pr AND assignee:@monalisa) trousers', {owner: 'github', name: 'issues'})
    expect(query).toEqual('(is:pr AND assignee:@monalisa) trousers repo:github/issues sort:created-desc')
    expect(query).not.toEqual('AND trousers (is:pr assignee:@monalisa)')
  })

  test('parses query with a label title with @github/issues amd returns correct result', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('is:issue label:"Team: @github/issues"', {owner: 'github', name: 'issues'})
    expect(query).toEqual('is:issue label:"Team: @github/issues" repo:github/issues sort:created-desc')
  })

  test('parses query with a label title with parentheses and @ sign, and returns correct result', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('(is:issue AND label:"Team: @github/issues")', {owner: 'github', name: 'issues'})
    expect(query).toEqual('(is:issue AND label:"Team: @github/issues") repo:github/issues sort:created-desc')
  })

  test('parses query with a label title with repo: and @ sign, and returns correct result', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('is:issue label:"repo: @github/github"', {owner: 'github', name: 'issues'})
    expect(query).toEqual('is:issue label:"repo: @github/github" repo:github/issues sort:created-desc')
  })

  test('parses syntax when no parentheses', () => {
    mockedIsFeatureEnabled.mockReturnValue(true)
    const query = getQuery('is:pr AND assignee:@monalisa trousers', {owner: 'github', name: 'issues'})
    expect(query).toEqual('is:pr AND assignee:@monalisa trousers repo:github/issues sort:created-desc')
  })

  test('when issues_advanced_search feature disabled, does not parse advanced search syntax', () => {
    mockedIsFeatureEnabled.mockReturnValue(false)
    const query = getQuery('( is:pr AND assignee:@monalisa ) trousers', {owner: 'github', name: 'issues'})
    expect(query).toEqual('( AND ) trousers is:pr assignee:@monalisa repo:github/issues sort:created-desc')
  })
})

describe('date tokens tests', () => {
  beforeAll(() => {
    const OriginalDate = Date
    const fixedDate = new Date('2023-03-31T08:30:00Z')
    jest.spyOn(global, 'Date').mockImplementation((...args) => (args.length ? new OriginalDate(...args) : fixedDate))
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('tokenToDate should convert token to date', () => {
    const today = new Date('2023-03-31T08:30:00Z')
    const yesterday = new Date('2023-03-30T08:30:00Z')
    const pastWeek = new Date('2023-03-24T08:30:00Z')
    const pastTwoWeeks = new Date('2023-03-17T08:30:00Z')
    const past30Days = new Date('2023-03-01T08:30:00Z')
    const pastYear = new Date('2022-03-31T08:30:00Z')
    const pastTenYears = new Date('2013-03-31T08:30:00Z')

    // : (equals)
    expect(getQuery('created:2023-03-10')).toEqual(`created:2023-03-10`)
    expect(getQuery('-created:2023-03-10')).toEqual(`-created:2023-03-10`)
    expect(getQuery('created:@today')).toEqual(`created:${new Date(today.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:@today-1d')).toEqual(`created:${new Date(yesterday.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:@today-1w')).toEqual(`created:${new Date(pastWeek.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:@today-2w')).toEqual(
      `created:${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:@today-30d')).toEqual(
      `created:${new Date(past30Days.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:@today-1y')).toEqual(`created:${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:=@today-1y')).toEqual(
      `created:=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('-created:=@today-1y')).toEqual(
      `-created:=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )

    // > (greater than)
    expect(getQuery('created:>2023-03-10')).toEqual(`created:>2023-03-10`)
    expect(getQuery('created:>@today')).toEqual(`created:>${new Date(today.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:>@today-1d')).toEqual(
      `created:>${new Date(yesterday.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:>@today-1w')).toEqual(
      `created:>${new Date(pastWeek.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:>@today-2w')).toEqual(
      `created:>${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:>@today-30d')).toEqual(
      `created:>${new Date(past30Days.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:>@today-1y')).toEqual(
      `created:>${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:>=@today-1y')).toEqual(
      `created:>=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('-created:>=@today-1y')).toEqual(
      `-created:>=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )

    // < (less than)
    expect(getQuery('created:<2023-03-10')).toEqual(`created:<2023-03-10`)
    expect(getQuery('created:<@today')).toEqual(`created:<${new Date(today.getTime()).toISOString().slice(0, 10)}`)
    expect(getQuery('created:<@today-1d')).toEqual(
      `created:<${new Date(yesterday.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:<@today-1w')).toEqual(
      `created:<${new Date(pastWeek.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:<@today-2w')).toEqual(
      `created:<${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:<@today-30d')).toEqual(
      `created:<${new Date(past30Days.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:<@today-1y')).toEqual(
      `created:<${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:<=@today-1y')).toEqual(
      `created:<=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('-created:<=@today-1y')).toEqual(
      `-created:<=${new Date(pastYear.getTime()).toISOString().slice(0, 10)}`,
    )

    // .. (range)
    expect(getQuery('created:2017-01-01..2017-03-01')).toEqual(`created:2017-01-01..2017-03-01`)
    expect(getQuery('created:2017-01-01..*')).toEqual(`created:2017-01-01..*`)
    expect(getQuery('*..2017-03-01')).toEqual(`*..2017-03-01`)
    expect(getQuery('created:@today-10y..@today-1w')).toEqual(
      `created:${new Date(pastTenYears.getTime()).toISOString().slice(0, 10)}..${new Date(pastWeek.getTime())
        .toISOString()
        .slice(0, 10)}`,
    )
    expect(getQuery('created:@today-2w..@today-1d')).toEqual(
      `created:${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}..${new Date(yesterday.getTime())
        .toISOString()
        .slice(0, 10)}`,
    )
    expect(getQuery('created:*..@today-1d')).toEqual(
      `created:*..${new Date(yesterday.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('created:@today-2w..*')).toEqual(
      `created:${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}..*`,
    )
    expect(getQuery('created:2017-01-01T01:00:00+07:00..2017-03-01T15:30:15+07:00')).toEqual(
      `created:2017-01-01T01:00:00+07:00..2017-03-01T15:30:15+07:00`,
    )
    expect(getQuery('created:2016-03-21T14:11:00Z..2016-04-07T20:45:00Z')).toEqual(
      `created:2016-03-21T14:11:00Z..2016-04-07T20:45:00Z`,
    )
    expect(getQuery('created:2017-01-01T01:00:00+07:00..@today-2w')).toEqual(
      `created:2017-01-01T01:00:00+07:00..${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}`,
    )
    expect(getQuery('-created:2017-01-01T01:00:00+07:00..@today-2w')).toEqual(
      `-created:2017-01-01T01:00:00+07:00..${new Date(pastTwoWeeks.getTime()).toISOString().slice(0, 10)}`,
    )
  })
})

describe('checkIfQuerySupportsPr', () => {
  test('returns true if query contains PR-related search terms', () => {
    let query = 'type:pr test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()

    query = 'is:pull-request test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()

    query = 'is:pr test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()

    query = 'is:pr type:pr test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()

    query = 'is:pr type:issue test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()
  })

  test('returns true if query does not contain a type search term', () => {
    let query = 'test'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()

    query = 'type:task is:draft'
    expect(checkIfQuerySupportsPr(query)).toBeTruthy()
  })

  test('returns false if query only contains is:issue or type:issue', () => {
    const query = 'is:issue type:issue state:open test'
    expect(checkIfQuerySupportsPr(query)).toBeFalsy()
  })
})

describe('checkIfStateReasonPresent', () => {
  test('returns true if query contains `reason` qualifier with valid values', () => {
    let query = 'reason:completed test state:open'
    expect(checkIfStateReasonPresent(query)).toBeTruthy()

    query = 'is:issue state:closed reason:"not planned" test'
    expect(checkIfStateReasonPresent(query)).toBeTruthy()

    query = 'is:issue reason:not-planned state:closed'
    expect(checkIfStateReasonPresent(query)).toBeTruthy()

    query = 'reason:"not-planned"'
    expect(checkIfStateReasonPresent(query)).toBeTruthy()
  })

  test('returns false if query does not contain `reason` qualifier with valid values', () => {
    let query = 'is:issue state:open'
    expect(checkIfStateReasonPresent(query)).toBeFalsy()

    query = ''
    expect(checkIfStateReasonPresent(query)).toBeFalsy()

    query = 'is:issue reason:not-plannedasdfasdf'
    expect(checkIfStateReasonPresent(query)).toBeFalsy()

    query = 'safdasdreason:"not-planned"'
    expect(checkIfStateReasonPresent(query)).toBeFalsy()

    query = 'is:issue state:closed "reason:completed"'
    expect(checkIfStateReasonPresent(query)).toBeFalsy()
  })
})
