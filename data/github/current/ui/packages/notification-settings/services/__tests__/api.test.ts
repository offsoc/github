import {request, updateSettings, updateOrgNotificationPrefs, clearOrgNotificationPrefs} from '../api'
import {mockFetch} from '@github-ui/mock-fetch'

describe('failed requests', () => {
  const formData = new FormData()
  formData.set('email', 'email@mail.com')

  test('returns the caught error', async () => {
    const response = request('http://notifications/example')
    expect(await response(formData)).toBeInstanceOf(Error)
  })

  test('returns the response error', async () => {
    const mock = mockFetch.mockRouteOnce('/settings/notifications', {email: 'email@mail.com'}, {ok: false})
    const response = await updateSettings(formData)
    expect(mock).toHaveBeenCalledTimes(1)
    expect(response).toEqual(new Error('Failed to update'))
  })
})

describe('successful requests', () => {
  test('returns the response', async () => {
    const mock = mockFetch.mockRouteOnce('/settings/notifications', {}, {ok: true, status: 200})
    const formData = new FormData()
    formData.set('email', 'email@mail.com')
    const response = await updateSettings(formData)
    expect(mock).toHaveBeenCalledTimes(1)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    expect(response['status']).toEqual(200)
  })
})

describe('update organization notification prefs', () => {
  const MOCK_LOGIN = 'mock-login'
  const MOCK_URL = `/settings/notification_preferences/organizations/${MOCK_LOGIN}`
  const MOCK_RESPONSE = {ok: true, status: 200}

  test('returns the caught error', async () => {
    mockFetch.mockRouteOnce(MOCK_URL, {}, {ok: false})
    const response = await updateOrgNotificationPrefs(MOCK_LOGIN, 'error-test@example.com')
    expect(response).toBeInstanceOf(Error)
  })

  test('returns the response', async () => {
    const mock = mockFetch.mockRouteOnce(MOCK_URL, {}, MOCK_RESPONSE)
    const response = await updateOrgNotificationPrefs(MOCK_LOGIN, 'monalisa@example.com')
    expect(mock).toHaveBeenCalledTimes(1)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    expect(response['status']).toEqual(200)
  })
})

describe('clear organization notification prefs', () => {
  const MOCK_LOGIN = 'mock-login'
  const MOCK_URL = `/settings/notification_preferences/organizations/${MOCK_LOGIN}`
  const MOCK_RESPONSE = {ok: true, status: 200}

  test('returns the caught error', async () => {
    mockFetch.mockRouteOnce(MOCK_URL, {}, {ok: false})
    const response = await clearOrgNotificationPrefs(MOCK_LOGIN)
    expect(response).toBeInstanceOf(Error)
  })

  test('returns the response', async () => {
    const mock = mockFetch.mockRouteOnce(MOCK_URL, {}, MOCK_RESPONSE)
    const response = await clearOrgNotificationPrefs(MOCK_LOGIN)
    expect(mock).toHaveBeenCalledTimes(1)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    expect(response['status']).toEqual(200)
  })
})
