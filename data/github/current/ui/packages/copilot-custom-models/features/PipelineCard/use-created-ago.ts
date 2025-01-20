import {formatDistance} from 'date-fns'
import {useEffect, useState} from 'react'

export function useCreatedAgo(createdAt: string | null): string {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!createdAt) return 'Created by'

  const createdDate = Date.parse(createdAt)
  const runTime = formatDistance(createdDate, now, {addSuffix: true, includeSeconds: true})

  return `Created ${runTime} by`
}
