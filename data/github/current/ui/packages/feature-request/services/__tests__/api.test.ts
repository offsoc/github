import {request, createRequest, deleteRequest} from '../api'
import {mockFetch} from '@github-ui/mock-fetch'

describe('requests', () => {
  const formData = new FormData()
  formData.set('feature', 'protected_branches')

  test('returns false for caught error', async () => {
    const response = request('http://feature_request/example', 'POST', formData)
    expect(await response).toBeFalsy()
  })

  test('returns false when the response is error', async () => {
    const mock = mockFetch.mockRouteOnce(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: false},
    )
    const response = await request('/orgs/test-org/member_feature_request', 'POST', formData)
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeFalsy()
  })

  test('returns true when the request is successful', async () => {
    const mock = mockFetch.mockRouteOnce(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: true},
    )
    const response = await request('/orgs/test-org/member_feature_request', 'POST', formData)
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeTruthy()
  })
})

describe('createRequests', () => {
  test('returns true on success', async () => {
    const mock = mockFetch.mockRouteOnce('/orgs/test-org/member_feature_request', {}, {ok: true, status: 200})
    const response = await createRequest('/orgs/test-org/member_feature_request', 'test-feature')
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeTruthy()
  })

  test('returns false on failure', async () => {
    const mock = mockFetch.mockRouteOnce('/orgs/test-org/member_feature_request', {}, {ok: false, status: 500})
    const response = await createRequest('/orgs/test-org/member_feature_request', 'test-feature')
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeFalsy()
  })
})

describe('deleteRequest', () => {
  test('returns true on success', async () => {
    const mock = mockFetch.mockRouteOnce('/orgs/test-org/member_feature_request', {}, {ok: true, status: 200})
    const response = await deleteRequest('/orgs/test-org/member_feature_request', 'test-feature')
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeTruthy()
  })

  test('returns false on failure', async () => {
    const mock = mockFetch.mockRouteOnce('/orgs/test-org/member_feature_request', {}, {ok: false, status: 500})
    const response = await deleteRequest('/orgs/test-org/member_feature_request', 'test-feature')
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toBeFalsy()
  })
})
