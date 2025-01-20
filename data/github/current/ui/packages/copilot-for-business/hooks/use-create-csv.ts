import {verifiedFetch} from '@github-ui/verified-fetch'
import {useState} from 'react'

type UseCreateCSVConfigs = {
  slug: string
  endpoint: (config: Record<string, string>) => string
  onSuccess?: () => void
  onError?: () => void
}

export function useCreateCSV(config: UseCreateCSVConfigs) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function makeCSVRequest() {
    setLoading(true)

    const generateCSVPath = config.endpoint({slug: config.slug})

    try {
      const response = await verifiedFetch(generateCSVPath, {
        method: 'POST',
        headers: {Accept: 'text/csv'},
      })

      if (response.ok) {
        const blob = await response.blob()
        const a = document.createElement('a')
        const href = URL.createObjectURL(blob)
        const currentTime = Math.floor(new Date().getTime() / 1000)
        a.href = href
        a.download = `${config.slug}-seat-usage-${currentTime}.csv`
        a.click()
        a.remove()
        URL.revokeObjectURL(href)
        config.onSuccess?.()
      } else {
        const errMsg = `Failed to export CSV: ${response.statusText}`
        setError(errMsg)
        config.onError?.()
        throw new Error(errMsg)
      }
    } catch (e) {
      setError('Could not post. Try your request again.')
      config.onError?.()
    }

    setLoading(false)
  }

  return {loading, error, makeCSVRequest}
}
