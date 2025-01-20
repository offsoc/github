import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export const fetchVariant = async (url: string, defaultValue: string): Promise<string> => {
  try {
    const response = await verifiedFetchJSON(url)

    if (response.ok) {
      const experiment = await response.json()
      return experiment['value']
    }

    return defaultValue
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching experiments:', error)
    return defaultValue
  }
}
