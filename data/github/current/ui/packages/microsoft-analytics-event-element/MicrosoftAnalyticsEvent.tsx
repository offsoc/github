import {useEffect, useState} from 'react'
import './microsoft-analytics-event-element'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'microsoft-analytics-event': Record<string, unknown>
    }
  }
}

function microsoftAnalyticsOrderId(refId: string, utmContent: string) {
  const timestamp = Date.now()
  return `${refId}-${utmContent}-${timestamp}`
}

export default function MicrosoftAnalyticsEvent() {
  const [microsoftId, setMicrosoftId] = useState('')
  const [productTitle, setProductTitle] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refId = params.get('ref_id')
    const utmContent = params.get('utm_content')

    if (refId && utmContent) {
      const id = microsoftAnalyticsOrderId(refId, utmContent)
      setProductTitle(utmContent)
      setMicrosoftId(id)
    }
  }, [])

  return (
    <microsoft-analytics-event
      data-testid="microsoft-analytics-event"
      data-behavior="contact"
      data-order-id={microsoftId}
      data-product-title={productTitle}
    />
  )
}
