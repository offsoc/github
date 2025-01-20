import {verifiedFetch} from '@github-ui/verified-fetch'

export const request = async (url: string, method: string, formData: FormData) => {
  try {
    const response = await verifiedFetch(url, {
      method,
      body: formData,
    })
    return response.ok
  } catch (error) {
    return false
  }
}

export const deleteRequest = (url: string, feature: string) => {
  return request(url, 'DELETE', formData(feature))
}

export const createRequest = (url: string, feature: string) => {
  return request(url, 'POST', formData(feature))
}

const formData = (feature: string) => {
  const data = new FormData()
  data.append('feature', feature)
  return data
}
