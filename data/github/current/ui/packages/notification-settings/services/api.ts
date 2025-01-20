import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'

export const request = (url: string) => {
  return async (formData: FormData) => {
    try {
      const response = await verifiedFetch(url, {
        method: 'PUT',
        body: formData,
      })
      if (response.ok) {
        return response
      } else {
        return new Error('Failed to update')
      }
    } catch (error) {
      return error
    }
  }
}

export const updateSettings = request('/settings/notifications')

export const updateOrgNotificationPrefs = (login: string, email: string) => {
  const formData = new FormData()
  formData.set('email', email)
  return request(`/settings/notification_preferences/organizations/${login}`)(formData)
}

export const clearOrgNotificationPrefs = async (login: string) => {
  try {
    const res = await verifiedFetchJSON(`/settings/notification_preferences/organizations/${login}`, {
      method: 'delete',
    })
    if (res.ok) {
      return res
    } else {
      return new Error(`API response not OK: ${res.status}`)
    }
  } catch (error) {
    return error
  }
}
