import {verifiedFetch} from '@github-ui/verified-fetch'

export const request = (url: string) => {
  return async (formData: FormData) => {
    try {
      const response = await verifiedFetch(url, {
        method: 'POST',
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

export const updateSettings = request('/notifications/subscribe')
