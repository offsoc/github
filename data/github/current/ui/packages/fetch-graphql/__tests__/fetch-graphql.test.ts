import fetchGraphQL, {fetchGraphQLWithSubscription, IssuesShowRegex} from '../fetch-graphql'
import {mockFetch} from '@github-ui/mock-fetch'

const payload = encodeURIComponent(JSON.stringify({query: '', variables: {}}))
const baseUrl = `/_graphql`
const url = `${baseUrl}?body=${payload}`

test('fetchGraphQL happy case', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  mockFetch.mockRouteOnce(url, mockData, options)
  const data = await fetchGraphQL('', {})
  expect(data).toMatchObject(mockData)
})

test('fetchGraphQL with 1 feature enabled in the url', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  doWithMockWindowHref('http://localhost:3000?_features=abc', 'http://localhost:3000', async () => {
    mockFetch.mockRouteOnce(`${url}&_features=abc`, mockData, options)
    const data = await fetchGraphQL('', {})
    expect(data).toMatchObject(mockData)
  })
})

test('fetchGraphQL with 2 feature enabled in the url', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  doWithMockWindowHref('http://localhost:3000?_features=abc,def', 'http://localhost:3000', async () => {
    mockFetch.mockRouteOnce(`${url}&_features=abc,def`, mockData, options)
    const data = await fetchGraphQL('', {})
    expect(data).toMatchObject(mockData)
  })
})

test('fetchGraphQL with feature disabled in the url', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  doWithMockWindowHref('http://localhost:3000?_features=abc,!def', 'http://localhost:3000', async () => {
    mockFetch.mockRouteOnce(`${url}&_features=abc,!def`, mockData, options)
    const data = await fetchGraphQL('', {})
    expect(data).toMatchObject(mockData)
  })
})

test('fetchGraphQL with provided baseUrl', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}
  const newBaseUrl = 'http://foo.bar'
  const newRequestUrl = `${newBaseUrl}?body=${payload}`

  mockFetch.mockRouteOnce(newRequestUrl, mockData, options)
  const data = await fetchGraphQL('', {}, undefined, newBaseUrl)
  expect(data).toMatchObject(mockData)
})

test('Issues show regex matches only issues detail paths', async () => {
  const regex = IssuesShowRegex
  expect(regex.test('/github/github/issues/123')).toBe(true)
  expect(regex.test('/github/github/issues')).toBe(false)
  expect(regex.test('/issues/assigned')).toBe(false)
  expect(regex.test('/issues/mentioned')).toBe(false)
  expect(regex.test('/github/issues')).toBe(false)
  expect(regex.test('/github/issues/1')).toBe(false)
})

test('fetchGraphQL >500 errors', async () => {
  const mockData = 'server error'
  const options = {
    headers: new Headers({'Content-Type': 'application/json'}),
    ok: false,
    status: 500,
    text: () => Promise.resolve(mockData),
  }
  mockFetch.mockRouteOnce(url, {}, options)
  await expect(() => fetchGraphQL('', {})).rejects.toThrow('HTTP error (500): server error')
})

test('fetchGraphQL >500 errors call the error method on the observer', async () => {
  const mockData = 'server error'
  const options = {
    headers: new Headers({'Content-Type': 'application/json'}),
    ok: false,
    status: 500,
    text: () => Promise.resolve(mockData),
  }
  mockFetch.mockRouteOnce(url, {}, options)
  // create a fake observer with an error method
  const observer = {
    error: jest.fn(),
    next: jest.fn(),
    complete: jest.fn(),
    closed: false,
  }
  await fetchGraphQL('', {}, 'GET', undefined, undefined, undefined, observer)
  // expect the error method to be called
  expect(observer.error).toHaveBeenCalled()
})

test('fetchGraphQL has 200 response, but has errors with an observer', async () => {
  const mockData = {
    data: {
      changes: null,
    },
    errors: [
      {
        type: 'FORBIDDEN',
        path: ['changesMutation'],
        message: 'unable to make this request',
      },
    ],
  }
  const options = {
    headers: new Headers({'Content-Type': 'application/json'}),
    ok: true,
    status: 200,
  }
  mockFetch.mockRouteOnce(url, mockData, options)
  const observer = {
    error: jest.fn(),
    next: jest.fn(),
    complete: jest.fn(),
    closed: false,
  }

  await fetchGraphQL('', {}, 'GET', undefined, undefined, undefined, observer)
  // expect the error method to be called
  expect(observer.error).toHaveBeenCalled()
})

test('fetchGraphQL has 200 response, but has errors', async () => {
  const mockData = {
    data: {
      changes: null,
    },
    errors: [
      {
        type: 'FORBIDDEN',
        path: ['changesMutation'],
        message: 'unable to make this request',
      },
    ],
  }
  const options = {
    headers: new Headers({'Content-Type': 'application/json'}),
    ok: true,
    status: 200,
  }
  mockFetch.mockRouteOnce(url, mockData, options)
  await expect(() => fetchGraphQL('', {})).rejects.toMatchObject({
    message: 'GraphQL error: FORBIDDEN: unable to make this request (path: changesMutation) (Persisted query id: )',
    cause: mockData.errors,
  })
})

test('fetchGraphQLWithSubscription returns subscription id', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json', 'X-Subscription-ID': '123456'})}

  mockFetch.mockRouteOnce(baseUrl, mockData, options)
  const {subscriptionId, response} = await fetchGraphQLWithSubscription('', {})
  expect(response).toMatchObject(mockData)
  expect(subscriptionId).toEqual('123456')
})

test('verify that the correct http header is present if ff is turned on', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  mockFetch.mockRouteOnce(url, mockData, options)
  await fetchGraphQL('', {}, undefined, undefined, {issues_react_perf_test: true})
  expect(mockFetch.calls()[0][1].headers['X-LUC-Environment']).toEqual('issues')
})

test('verify that the correct http header is present if ff is turned off', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  mockFetch.mockRouteOnce(url, mockData, options)
  await fetchGraphQL('', {}, undefined, undefined, {issues_react_perf_test: false})
  expect(mockFetch.calls()[0][1].headers['X-LUC-Environment']).toBeUndefined()
})

test('verify that request is marked as Ajax', async () => {
  const mockData = {data: {happy: 'yes'}}
  const options = {headers: new Headers({'Content-Type': 'application/json'})}

  mockFetch.mockRouteOnce(url, mockData, options)
  await fetchGraphQL('', {}, undefined, undefined)
  expect(mockFetch.calls()[0][1].headers['X-Requested-With']).toEqual('XMLHttpRequest')
})

async function doWithMockWindowHref(href: string, origin: string, action: () => Promise<void>) {
  const current = window.location
  // @ts-expect-error  This is a workaround to mock window.location.assign to avoid actually navigating to the URL when running tests.
  // We can't just assign a new value to window.location.assign because it's a read-only property.
  // We need to delete the property and reassign it.
  delete window.location
  window.location = {
    href,
    origin,
  } as unknown as Location

  try {
    await action()
  } finally {
    window.location = current
  }
}
